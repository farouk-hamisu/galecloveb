import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProfile, useUpdateProfile } from '@/hooks/useBankingData';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const Settings = () => {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      toast({ title: t('settings_page.toast.success') });
      setProfileDialogOpen(false);
    } catch (error) {
      toast({ title: t('settings_page.toast.error'), variant: 'destructive' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl + '?t=' + Date.now();

      await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Profile photo updated!' });
    } catch (error) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl = profile?.avatar_url;
  const initials = `${(profile?.first_name || 'U')[0]}${(profile?.last_name || '')[0] || ''}`.toUpperCase();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-lg lg:text-xl font-bold text-foreground mb-0.5">{t('settings_page.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('settings_page.subtitle')}</p>
        </motion.div>

        {/* Profile Photo Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-4">
            <div className="relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                  <span className="text-primary font-bold text-lg">{initials}</span>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                disabled={uploading}
              >
                {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {profile?.first_name || ''} {profile?.last_name || ''}
              </h3>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <button onClick={() => fileInputRef.current?.click()} className="text-xs text-primary mt-1 hover:underline">
                Change photo
              </button>
            </div>
          </div>
        </motion.div>

        {/* Settings Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <motion.div
            className="p-5 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{t('settings_page.sections.profile_info.title')}</h3>
                <p className="text-xs text-muted-foreground mb-3">{t('settings_page.sections.profile_info.description')}</p>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setProfileDialogOpen(true)}>{t('settings_page.sections.profile_info.action')}</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings_page.dialog.title')}</DialogTitle>
            <DialogDescription>{t('settings_page.dialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <Input id="first_name" placeholder={t('settings_page.form.first_name')} value={formData.first_name} onChange={handleInputChange} />
              <Input id="last_name" placeholder={t('settings_page.form.last_name')} value={formData.last_name} onChange={handleInputChange} />
            </div>
            <Input id="phone" placeholder={t('settings_page.form.phone')} value={formData.phone} onChange={handleInputChange} />
            <Input id="address" placeholder={t('settings_page.form.address')} value={formData.address} onChange={handleInputChange} />
            <div className="grid grid-cols-2 gap-3">
              <Input id="city" placeholder={t('settings_page.form.city')} value={formData.city} onChange={handleInputChange} />
              <Input id="country" placeholder={t('settings_page.form.country')} value={formData.country} onChange={handleInputChange} />
            </div>
          </div>
          <Button onClick={handleUpdateProfile} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? t('settings_page.form.saving') : t('settings_page.form.save_changes')}
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
