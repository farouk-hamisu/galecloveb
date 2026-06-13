import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Loader2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminSettings = () => {
  const { t } = useTranslation();
  const { settings, isLoading, updateSettings, isUpdating } = useSiteSettings();
  const [formData, setFormData] = useState({
    site_name: '',
    phone_number: '',
    address: '',
    support_email: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name,
        phone_number: settings.phone_number,
        address: settings.address,
        support_email: settings.support_email,
      });
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Site Settings</h2>
          <p className="text-muted-foreground">
            Manage global platform information and branding.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Information</CardTitle>
            <CardDescription>
              These values are reflected across the entire website, dashboard, and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={formData.site_name}
                  onChange={handleChange}
                  placeholder="Galecloveb"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+1 (808) 206-5163"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Site Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Tampa, Florida"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="support_email">Support Email</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={formData.support_email}
                  onChange={handleChange}
                  placeholder="support@galecloveb.com"
                  required
                />
              </div>
              <Button type="submit" disabled={isUpdating} className="gap-2">
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
