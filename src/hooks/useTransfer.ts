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

      if (transferType === 'internal') {
        const isEmail = toIdentifier.includes('@');
        
        const { data, error } = await supabase.rpc('internal_transfer', {
          p_sender_user_id: user.id,
          p_from_account_id: fromAccountId,
          p_to_identifier: toIdentifier.trim(),
          p_is_email: isEmail,
          p_amount: amount,
          p_description: description || ''
        });

        if (error) {
          console.error('RPC Error:', error);
          throw new Error('An error occurred during the transfer. Please try again.');
        }

        const result = data[0];

        if (!result.success) {
          throw new Error(result.message);
        }
        
        return {
          success: true,
          referenceNumber: result.reference_number,
          recipientName: result.recipient_name,
          amount,
          currency: result.currency
        };

      } else {
        // --- Keep existing international transfer logic ---
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

        const recipientName = beneficiary.name;
        const recipientAccountNumber = beneficiary.account_number;
        const referenceNumber = generateReferenceNumber();
        const currency = senderAccount.currency || 'USD';
        
        const newSenderBalance = Number(senderAccount.balance) - amount;
        const { error: debitError } = await supabase
          .from('accounts')
          .update({ balance: newSenderBalance })
          .eq('id', fromAccountId);

        if (debitError) {
          throw new Error('Failed to debit account');
        }

        const { error: senderTxError } = await supabase
          .from('transactions')
          .insert({
            account_id: fromAccountId,
            type: 'transfer_out',
            amount: -amount,
            currency,
            description: description || `International transfer to ${recipientName}`,
            reference_number: referenceNumber,
            recipient_name: recipientName,
            recipient_account: recipientAccountNumber,
            status: 'completed'
          });

        if (senderTxError) {
          await supabase.from('accounts').update({ balance: senderAccount.balance }).eq('id', fromAccountId);
          throw new Error('Failed to create transaction record');
        }

        return {
          success: true,
          referenceNumber,
          recipientName,
          amount,
          currency
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] }); // Invalidate notifications as well
    }
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ accountType }: { accountType: 'checking' | 'savings' }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const accountNumber = 'NRB' + Math.random().toString().slice(2, 12).padEnd(10, '0');

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