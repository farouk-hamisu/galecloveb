import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  kyc_status: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_number: string;
  account_type: string;
  currency: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
  reference_number: string;
  recipient_name: string | null;
  recipient_account: string | null;
  status: string;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  bank_name: string;
  account_number: string;
  swift_code: string | null;
  iban: string | null;
  country: string | null;
  is_favorite: boolean;
  created_at: string;
}

export interface Card {
  id: string;
  user_id: string;
  account_id: string;
  card_number: string;
  card_type: string;
  expiry_date: string;
  cvv: string;
  pin: string;
  spending_limit: number;
  is_frozen: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface BtcWallet {
  id: string;
  user_id: string;
  wallet_address: string;
  btc_balance: number;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const {user} = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const {user} = useAuth();

  return useMutation({
    mutationFn: async (profile: Partial<Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at' | 'kyc_status'>>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const {data, error} = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['profile']});
    },
  });
};

export const useAccounts = () => {
  const {user} = useAuth();

  return useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {data, error} = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: true});

      if (error) throw error;
      return data as Account[];
    },
    enabled: !!user?.id,
  });
};

export const useBtcWallet = () => {
  const {user} = useAuth();

  return useQuery({
    queryKey: ['btc_wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const {data, error} = await supabase
        .from('btc_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as BtcWallet | null;
    },
    enabled: !!user?.id,
  });
};

export const useTransactions = (accountId?: string) => {
  const {user} = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id, accountId],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', {ascending: false});

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const {data, error} = await query;

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user?.id,
  });
};

export const useBeneficiaries = () => {
  const {user} = useAuth();

  return useQuery({
    queryKey: ['beneficiaries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {data, error} = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .order('name', {ascending: true});

      if (error) throw error;
      return data as Beneficiary[];
    },
    enabled: !!user?.id,
  });
};

export const useCards = () => {
  const {user} = useAuth();

  return useQuery({
    queryKey: ['cards', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {data, error} = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false});

      if (error) throw error;
      return data as Card[];
    },
    enabled: !!user?.id,
  });
};

export const useSupportTickets = () => {
  const {user} = useAuth();

  return useQuery({
    queryKey: ['support_tickets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {data, error} = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false});

      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!user?.id,
  });
};

export const useNotifications = () => {
  const {user} = useAuth();

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const {data, error} = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false});

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();
  const {user} = useAuth();

  return useMutation({
    mutationFn: async ({accountId, pin}: {accountId: string; pin: string}) => {
      if (!user?.id) throw new Error('Not authenticated');

      const cardNumber = `4${Math.random().toString().slice(2, 17).padEnd(15, '0')}`;
      const cvv = Math.floor(100 + Math.random() * 900).toString();
      const expiryYear = new Date().getFullYear() + 4;
      const expiryMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');

      const {data, error} = await supabase
        .from('cards')
        .insert({
          user_id: user.id,
          account_id: accountId,
          card_number: cardNumber,
          card_type: 'virtual',
          expiry_date: `${expiryMonth}/${expiryYear}`,
          cvv,
          pin,
          spending_limit: 5000,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['cards']});
    },
  });
};

export const useToggleCardFreeze = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({cardId, isFrozen}: {cardId: string; isFrozen: boolean}) => {
      const {error} = await supabase
        .from('cards')
        .update({is_frozen: isFrozen})
        .eq('id', cardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['cards']});
    },
  });
};

export const useUpdateCardLimit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({cardId, limit}: {cardId: string; limit: number}) => {
      const {error} = await supabase
        .from('cards')
        .update({spending_limit: limit})
        .eq('id', cardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['cards']});
    },
  });
};

export const useCreateBeneficiary = () => {
  const queryClient = useQueryClient();
  const {user} = useAuth();

  return useMutation({
    mutationFn: async (beneficiary: Omit<Beneficiary, 'id' | 'user_id' | 'created_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const {data, error} = await supabase
        .from('beneficiaries')
        .insert({
          ...beneficiary,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['beneficiaries']});
    },
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  const {user} = useAuth();

  return useMutation({
    mutationFn: async (ticket: {subject: string; message: string; priority?: string}) => {
      if (!user?.id) throw new Error('Not authenticated');

      const {data, error} = await supabase
        .from('support_tickets')
        .insert({
          ...ticket,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['support_tickets']});
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const {error} = await supabase
        .from('notifications')
        .update({is_read: true})
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['notifications']});
    },
  });
};
