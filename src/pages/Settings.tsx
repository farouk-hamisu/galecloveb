import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProfile } from '@/hooks/useBankingData';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Shield, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Settings = () => {
  const { data: profile } = useProfile();
  const { user } = useAuth();

  const settingsSections = [
    {
      icon: User,
      title: 'Profile Information',
      description: 'Update your personal details and contact information',
      action: 'Edit Profile',
    },
    {
      icon: Lock,
      title: 'Security',
      description: 'Change password, enable 2FA, and manage security settings',
      action: 'Manage Security',
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Configure email and push notification preferences',
      action: 'Configure',
    },
    {
      icon: Shield,
      title: 'Privacy',
      description: 'Manage your data privacy and sharing preferences',
      action: 'Review Privacy',
    },
    {
      icon: Globe,
      title: 'Language & Region',
      description: 'Set your preferred language and regional settings',
      action: 'Change',
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize the look and feel of your dashboard',
      action: 'Customize',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : 'User'}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profile?.kyc_status === 'verified'
                    ? 'bg-green-500/10 text-green-500'
                    : profile?.kyc_status === 'rejected'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  KYC: {profile?.kyc_status || 'pending'}
                </span>
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {settingsSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                  <Button variant="outline" size="sm">{section.action}</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border-2 border-destructive/20 bg-destructive/5"
        >
          <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
