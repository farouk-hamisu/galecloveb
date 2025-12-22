import {useMutation, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '@/contexts/AuthContext';

interface TransferRequest {
  fromAccountId: string;
  toIdentifier: string; // Can be account number or email
  amount: number;
  description?: string;
  transferType: 'internal' | 'international';
  beneficiaryId?: string;
  receiverEmail?: string;
}

interface TransferResult {
  success: boolean;
  referenceNumber: string;
  recipientName: string;
  recipientEmail: string;
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

import {useToast} from '@/components/ui/use-toast';

export const useTransfer = () => {
  const queryClient = useQueryClient();
  const {user} = useAuth();
  const {toast} = useToast();

  return useMutation({
    mutationFn: async (request: TransferRequest): Promise<TransferResult> => {
      console.log('Initiating transfer:', request);
      if (!user?.id) throw new Error('Not authenticated');

      const {fromAccountId, toIdentifier, amount, description, transferType, beneficiaryId} = request;

      if (transferType === 'internal') {
        const isEmail = toIdentifier.includes('@');

        const {data, error} = await supabase.rpc('internal_transfer', {
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
          recipientEmail: result.recipient_email,
          amount,
          currency: result.currency
        };

      } else {
        console.log('Processing international transfer');
        if (!beneficiaryId) {
          throw new Error('Please select a beneficiary for international transfer');
        }

        const { data, error } = await supabase.rpc('international_transfer', {
          p_sender_user_id: user.id,
          p_from_account_id: fromAccountId,
          p_beneficiary_id: beneficiaryId,
          p_amount: amount,
          p_description: description || ''
        });

        if (error) {
          console.error('RPC Error:', error);
          throw new Error('An error occurred during the international transfer. Please try again.');
        }

        const result = data[0];

        if (!result.success) {
          throw new Error(result.message);
        }

        return {
          success: true,
          referenceNumber: result.reference_number,
          recipientName: result.recipient_name,
          recipientEmail: result.recipient_email,
          amount,
          currency: result.currency
        };
      }
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      console.log('Transfer successful, sending notification...');
      
      let senderName = user?.user_metadata.full_name;
      if (!senderName) {
        const { data: profile } = await supabase.from('profiles').select('first_name, last_name').eq('id', user?.id).single();
        if (profile && profile.first_name && profile.last_name) {
          senderName = `${profile.first_name} ${profile.last_name}`;
        } else {
          senderName = user?.email; // fallback to email
        }
      }

      // Send transaction notification
      const senderEmail = user?.email;
      const receiverEmail = variables.receiverEmail || data.recipientEmail;
      
      fetch('https://national-credit-union-1.onrender.com/send-transaction-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName,
          receiverName: data.recipientName,
          amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(data.amount),
          senderEmail,
          receiverEmail: receiverEmail,
          date: new Date().toLocaleDateString(),
        }),
      })
      .then(response => {
        if (response.ok) {
          console.log('Transaction notification sent successfully.');
        } else {
          console.error('Failed to send transaction notification.');
        }
      })
      .catch(error => {
        console.error('Error sending transaction notification:', error);
      });
    },
    onError: (error) => {
      console.error('Transfer failed:', error);
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message,
      });
    }
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  const {user} = useAuth();

  return useMutation({
    mutationFn: async ({accountType}: {accountType: 'checking' | 'savings'}) => {
      if (!user?.id) throw new Error('Not authenticated');

      const accountNumber = 'NRB' + Math.random().toString().slice(2, 12).padEnd(10, '0');

      const {data, error} = await supabase
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
      queryClient.invalidateQueries({queryKey: ['accounts']});
    }
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();
  const {user} = useAuth();

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
      const {data: account, error: accError} = await supabase
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
      const {error: updateError} = await supabase
        .from('accounts')
        .update({balance: newBalance})
        .eq('id', accountId);

      if (updateError) {
        throw new Error('Failed to update account balance');
      }

      // Create transaction record
      const {error: txError} = await supabase
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
          .update({balance: account.balance})
          .eq('id', accountId);
        throw new Error('Failed to create transaction record');
      }

      return {success: true, referenceNumber};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['accounts']});
      queryClient.invalidateQueries({queryKey: ['transactions']});
    }
  });
};
