import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TransferRequest {
  fromAccountId: string;
  toIdentifier: string; // Can be account number or email
  amount: number;
  description?: string;
  transferType: 'internal' | 'international';
  beneficiaryId?: string;
}

interface TransferResult {
  success: boolean;
  referenceNumber: string;
  recipientName: string;
  amount: number;
  currency: string;
}

// Generate reference number
const generateReferenceNumber = () => {
  const prefix = 'TRF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

export const useTransfer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (request: TransferRequest): Promise<TransferResult> => {
      if (!user?.id) throw new Error('Not authenticated');

      const { fromAccountId, toIdentifier, amount, description, transferType, beneficiaryId } = request;

      // Get sender's account
      const { data: senderAccount, error: senderError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', fromAccountId)
        .eq('user_id', user.id)
        .single();

      if (senderError || !senderAccount) {
        throw new Error('Source account not found');
      }

      if (Number(senderAccount.balance) < amount) {
        throw new Error('Insufficient funds');
      }

      let recipientAccount: any = null;
      let recipientUserId: string | null = null;
      let recipientName = '';

      if (transferType === 'internal') {
        // Check if identifier is an email
        const isEmail = toIdentifier.includes('@');

        if (isEmail) {
          // Find user by email
          const { data: recipientProfile, error: profileError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .eq('email', toIdentifier.toLowerCase().trim())
            .maybeSingle();

          if (profileError || !recipientProfile) {
            throw new Error('Recipient not found. Please check the email address.');
          }

          recipientUserId = recipientProfile.id;
          recipientName = `${recipientProfile.first_name || ''} ${recipientProfile.last_name || ''}`.trim() || 'User';

          // Get recipient's primary (first active) account
          const { data: accounts, error: accError } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', recipientProfile.id)
            .eq('is_active', true)
            .order('created_at', { ascending: true })
            .limit(1);

          if (accError || !accounts || accounts.length === 0) {
            throw new Error('Recipient has no active accounts');
          }

          recipientAccount = accounts[0];
        } else {
          // Find account by account number
          const { data: account, error: accError } = await supabase
            .from('accounts')
            .select('*')
            .eq('account_number', toIdentifier.trim())
            .eq('is_active', true)
            .maybeSingle();

          if (accError || !account) {
            throw new Error('Recipient account not found. Please check the account number.');
          }

          recipientAccount = account;
          recipientUserId = account.user_id;

          // Get recipient name
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', account.user_id)
            .single();

          recipientName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User' : 'User';
        }

        // Prevent self-transfer to same account
        if (recipientAccount.id === fromAccountId) {
          throw new Error('Cannot transfer to the same account');
        }
      } else {
        // International transfer - use beneficiary
        if (!beneficiaryId) {
          throw new Error('Please select a beneficiary for international transfer');
        }

        const { data: beneficiary, error: benError } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('id', beneficiaryId)
          .single();

        if (benError || !beneficiary) {
          throw new Error('Beneficiary not found');
        }

        recipientName = beneficiary.name;
      }

      const referenceNumber = generateReferenceNumber();
      const currency = senderAccount.currency || 'USD';

      // Debit sender's account
      const newSenderBalance = Number(senderAccount.balance) - amount;
      const { error: debitError } = await supabase
        .from('accounts')
        .update({ balance: newSenderBalance })
        .eq('id', fromAccountId);

      if (debitError) {
        throw new Error('Failed to debit account');
      }

      // Create debit transaction for sender
      const { error: senderTxError } = await supabase
        .from('transactions')
        .insert({
          account_id: fromAccountId,
          type: 'transfer_out',
          amount: -amount,
          currency,
          description: description || `Transfer to ${recipientName}`,
          reference_number: referenceNumber,
          recipient_name: recipientName,
          recipient_account: recipientAccount?.account_number || 'International',
          status: 'completed'
        });

      if (senderTxError) {
        // Rollback balance
        await supabase
          .from('accounts')
          .update({ balance: Number(senderAccount.balance) })
          .eq('id', fromAccountId);
        throw new Error('Failed to create transaction record');
      }

      // For internal transfers, credit recipient
      if (transferType === 'internal' && recipientAccount) {
        const newRecipientBalance = Number(recipientAccount.balance) + amount;
        
        const { error: creditError } = await supabase
          .from('accounts')
          .update({ balance: newRecipientBalance })
          .eq('id', recipientAccount.id);

        if (creditError) {
          console.error('Failed to credit recipient:', creditError);
        }

        // Create credit transaction for recipient
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        const senderName = senderProfile ? `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim() || 'User' : 'User';

        await supabase
          .from('transactions')
          .insert({
            account_id: recipientAccount.id,
            type: 'transfer_in',
            amount: amount,
            currency,
            description: description || `Transfer from ${senderName}`,
            reference_number: referenceNumber,
            recipient_name: senderName,
            recipient_account: senderAccount.account_number,
            status: 'completed'
          });

        // Send notifications via edge function (fault-tolerant)
        if (recipientUserId) {
          try {
            await supabase.functions.invoke('send-transfer-notification', {
              body: {
                senderUserId: user.id,
                recipientUserId,
                amount,
                currency,
                referenceNumber,
                transferType,
                description
              }
            });
          } catch (notifError) {
            console.error('Failed to send notifications (non-fatal):', notifError);
          }
        }
      }

      return {
        success: true,
        referenceNumber,
        recipientName,
        amount,
        currency
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ accountType }: { accountType: 'checking' | 'savings' }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const accountNumber = 'NCU' + Math.random().toString().slice(2, 12).padEnd(10, '0');

      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          account_number: accountNumber,
          account_type: accountType,
          currency: 'USD',
          balance: 0,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
};
