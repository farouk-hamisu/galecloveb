import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProfile, useUpdateProfile } from '@/hooks/useBankingData';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
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

  const settingsSections = [
    {
      icon: User,
      title: t('settings_page.sections.profile_info.title'),
      description: t('settings_page.sections.profile_info.description'),
      action: t('settings_page.sections.profile_info.action'),
      onClick: () => setProfileDialogOpen(true),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-0.5">{t('settings_page.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('settings_page.subtitle')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {settingsSections.map((section, index) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-5 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-0.5">{section.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{section.description}</p>
                  <Button variant="outline" size="sm" className="text-xs" onClick={section.onClick}>{section.action}</Button>
                </div>
              </div>
            </motion.div>
          ))}
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
