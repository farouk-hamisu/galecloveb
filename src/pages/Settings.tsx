import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProfile, useUpdateProfile } from '@/hooks/useBankingData';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Shield, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
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
      toast({ title: 'Profile updated successfully' });
      setProfileDialogOpen(false);
    } catch (error) {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  };

  const settingsSections = [
    {
      icon: User,
      title: 'Profile Information',
      description: 'Update your personal details and contact information',
      action: 'Edit Profile',
      onClick: () => setProfileDialogOpen(true),
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
                  <Button variant="outline" size="sm" onClick={section.onClick}>{section.action}</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Input id="first_name" placeholder="First Name" value={formData.first_name} onChange={handleInputChange} />
              <Input id="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleInputChange} />
            </div>
            <Input id="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} />
            <Input id="address" placeholder="Address" value={formData.address} onChange={handleInputChange} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="city" placeholder="City" value={formData.city} onChange={handleInputChange} />
              <Input id="country" placeholder="Country" value={formData.country} onChange={handleInputChange} />
            </div>
          </div>
          <Button onClick={handleUpdateProfile} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
