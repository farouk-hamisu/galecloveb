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

      let recipientAccountId: string | null = null;
      let recipientAccountNumber: string | null = null;
      let recipientUserId: string | null = null;
      let recipientName = '';

      if (transferType === 'internal') {
        // Check if identifier is an email
        const isEmail = toIdentifier.includes('@');

        // Use the database function to look up recipient (bypasses RLS)
        const { data: recipientData, error: lookupError } = await supabase
          .rpc('lookup_transfer_recipient', {
            p_identifier: toIdentifier.trim(),
            p_is_email: isEmail
          });

        if (lookupError) {
          console.error('Lookup error:', lookupError);
          throw new Error(isEmail 
            ? 'Recipient not found. Please check the email address.'
            : 'Recipient account not found. Please check the account number.');
        }

        if (!recipientData || recipientData.length === 0) {
          throw new Error(isEmail 
            ? 'Recipient not found. Please check the email address.'
            : 'Recipient account not found. Please check the account number.');
        }

        const recipient = recipientData[0];
        recipientAccountId = recipient.account_id;
        recipientAccountNumber = recipient.account_number;
        recipientUserId = recipient.user_id;
        recipientName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'User';

        // Prevent self-transfer to same account
        if (recipientAccountId === fromAccountId) {
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
        recipientAccountNumber = beneficiary.account_number;
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
          recipient_account: recipientAccountNumber || 'International',
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
      if (transferType === 'internal' && recipientAccountId) {
        // Get recipient's current balance
        const { data: recipientAccData } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', recipientAccountId)
          .single();

        if (recipientAccData) {
          const newRecipientBalance = Number(recipientAccData.balance) + amount;
          
          await supabase
            .from('accounts')
            .update({ balance: newRecipientBalance })
            .eq('id', recipientAccountId);
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
            account_id: recipientAccountId,
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

export const useDeposit = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      accountId, 
      amount, 
      method, 
      description 
    }: { 
      accountId: string; 
      amount: number; 
      method: string;
      description?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Get current account balance
      const { data: account, error: accError } = await supabase
        .from('accounts')
        .select('balance, currency, account_number')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single();

      if (accError || !account) {
        throw new Error('Account not found');
      }

      const referenceNumber = 'DEP' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
      const newBalance = Number(account.balance) + amount;

      // Update balance
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', accountId);

      if (updateError) {
        throw new Error('Failed to update account balance');
      }

      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          account_id: accountId,
          type: 'deposit',
          amount: amount,
          currency: account.currency || 'USD',
          description: description || `Deposit via ${method}`,
          reference_number: referenceNumber,
          status: 'completed'
        });

      if (txError) {
        // Rollback
        await supabase
          .from('accounts')
          .update({ balance: account.balance })
          .eq('id', accountId);
        throw new Error('Failed to create transaction record');
      }

      return { success: true, referenceNumber };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });
};