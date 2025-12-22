import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '@/contexts/AuthContext';

export interface AdminProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  kyc_status: string | null;
  account_status: string | null; // Added new field
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_type: string;
  balance: number | null;
  currency: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface AdminTransaction {
  id: string;
  account_id: string;
  amount: number;
  type: string;
  status: string | null;
  description: string | null;
  recipient_name: string | null;
  recipient_account: string | null;
  reference_number: string;
  currency: string | null;
  created_at: string | null;
}

export interface AdminBeneficiary {
  id: string;
  user_id: string;
  name: string;
  bank_name: string;
  account_number: string;
  swift_code: string | null;
  iban: string | null;
  country: string | null;
  is_favorite: boolean | null;
  created_at: string | null;
}

export interface AdminCard {
  id: string;
  user_id: string;
  account_id: string;
  card_number: string;
  card_type: string | null;
  expiry_date: string;
  cvv: string;
  is_active: boolean | null;
  is_frozen: boolean | null;
  spending_limit: number | null;
  created_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean | null;
  created_at: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string | null;
}

// Check if current user is admin
export const useIsAdmin = () => {
  const {user} = useAuth();

  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const {data, error} = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user,
  });
};

// Get all users/profiles
export const useAdminProfiles = () => {
  return useQuery({
    queryKey: ['adminProfiles'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', {ascending: false});

      if (error) throw error;
      return data as AdminProfile[];
    },
  });
};

// Get all accounts
export const useAdminAccounts = () => {
  return useQuery({
    queryKey: ['adminAccounts'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', {ascending: false});

      if (error) throw error;
      return data as AdminAccount[];
    },
  });
};

// Get all transactions
export const useAdminTransactions = () => {
  return useQuery({
    queryKey: ['adminTransactions'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', {ascending: false});

      if (error) throw error;
      return data as AdminTransaction[];
    },
  });
};

// Get all beneficiaries
export const useAdminBeneficiaries = () => {
  return useQuery({
    queryKey: ['adminBeneficiaries'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('beneficiaries')
        .select('*')
        .order('created_at', {ascending: false});

      if (error) throw error;
      return data as AdminBeneficiary[];
    },
  });
};

// Get all cards
export const useAdminCards = () => {
  return useQuery({
    queryKey: ['adminCards'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('cards')
        .select('*')
        .order('created_at', {ascending: false});

      if (error) throw error;
      return data as AdminCard[];
    },
  });
};

// Get all notifications
export const useAdminNotifications = () => {
  return useQuery({
    queryKey: ['adminNotifications'],
    queryFn: async () => {
      const {data, error} = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', {ascending: false});

      if (error) throw error;
      return data as Notification[];
    },
  });
};

// Update profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, updates}: {id: string; updates: Partial<AdminProfile>}) => {
      const {error} = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminProfiles']});
    },
  });
};

// Delete profile
export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const {error} = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminProfiles']});
    },
  });
};

// Update account balance
export const useUpdateAccountBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, balance}: {id: string; balance: number}) => {
      const {error} = await supabase
        .from('accounts')
        .update({balance})
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminAccounts']});
    },
  });
};

// Toggle account status
export const useToggleAccountStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, is_active}: {id: string; is_active: boolean}) => {
      const {error} = await supabase
        .from('accounts')
        .update({is_active})
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminAccounts']});
    },
  });
};

// Create transaction
export const useCreateAdminTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<AdminTransaction, 'id' | 'created_at'>) => {
      const {error} = await supabase
        .from('transactions')
        .insert(transaction);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminTransactions']});
    },
  });
};

// Update transaction
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, updates}: {id: string; updates: Partial<AdminTransaction>}) => {
      const {error} = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminTransactions']});
    },
  });
};

// Delete transaction
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const {error} = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminTransactions']});
    },
  });
};

// Delete beneficiary
export const useDeleteBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const {error} = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminBeneficiaries']});
    },
  });
};

// Update card
export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, updates}: {id: string; updates: Partial<AdminCard>}) => {
      const {error} = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminCards']});
    },
  });
};

// Delete card
export const useDeleteCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const {error} = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminCards']});
    },
  });
};

// Send notification
export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: {user_id: string; title: string; message: string; type?: string}) => {
      const {error} = await supabase
        .from('notifications')
        .insert(notification);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminNotifications']});
    },
  });
};

// Send bulk notifications
export const useSendBulkNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({userIds, title, message, type}: {userIds: string[]; title: string; message: string; type?: string}) => {
      const notifications = userIds.map(user_id => ({
        user_id,
        title,
        message,
        type: type || 'info',
      }));

      const {error} = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminNotifications']});
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const {error} = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['adminNotifications']});
    },
  });
};

// Update account status (freeze/unfreeze)
export const useUpdateAccountStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user_id, account_status }: { user_id: string; account_status: 'active' | 'frozen' }) => {
      const { error } = await supabase.functions.invoke('update-account-status', {
        body: { user_id, account_status },
      });

      if (error) {
        throw new Error(error.message || 'Failed to update account status');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProfiles'] });
    },
  });
};
