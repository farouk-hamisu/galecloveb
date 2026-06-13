import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSiteSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching site settings:', error);
        return {
          site_name: 'Galecloveb',
          phone_number: '+1 (808) 206-5163',
          address: 'Tampa, Florida',
          support_email: 'support@galecloveb.com',
        };
      }
      return data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: {
      site_name: string;
      phone_number: string;
      address: string;
      support_email: string;
    }) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_settings'] });
      toast({
        title: 'Settings updated',
        description: 'Site settings have been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'An error occurred while updating settings.',
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
};
