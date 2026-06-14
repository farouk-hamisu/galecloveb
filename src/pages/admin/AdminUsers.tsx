import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useAdminProfiles, 
  useUpdateProfile, 
  useAdminDeleteUser,
  useToggleAccountStatus,
  useAdminCreateUser,
  AdminProfile 
} from '@/hooks/useAdminData';
import { Search, Edit, Trash2, User, Ban, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const AdminUsers = () => {
  const { t } = useTranslation();
  const { data: profiles, isLoading } = useAdminProfiles();
  const updateProfile = useUpdateProfile();
  const deleteUser = useAdminDeleteUser();
  const toggleAccountStatus = useToggleAccountStatus();
  const createUser = useAdminCreateUser();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    account_number: '',
    account_type: 'checking',
    account_balance: '0',
  });
  const [editingUser, setEditingUser] = useState<AdminProfile | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    kyc_status: '',
  });

  const filteredProfiles = profiles?.filter(p => 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleEdit = (profile: AdminProfile) => {
    setEditingUser(profile);
    setEditForm({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email,
      phone: profile.phone || '',
      kyc_status: profile.kyc_status || 'pending',
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    
    try {
      await updateProfile.mutateAsync({
        id: editingUser.id,
        updates: editForm,
      });
      toast.success(t('admin_users_page.user_updated'));
      setEditingUser(null);
    } catch (error) {
      toast.error(t('admin_users_page.user_update_failed'));
    }
  };

  const handleFreezeAccount = async (userId: string) => {
    try {
      await toggleAccountStatus.mutateAsync({ id: userId, is_active: false });
      toast.success(t('admin_users_page.account_frozen_success'));
    } catch (error) {
      toast.error(t('admin_users_page.account_frozen_failed'));
    }
  };

  const handleUnfreezeAccount = async (userId: string) => {
    try {
      await toggleAccountStatus.mutateAsync({ id: userId, is_active: true });
      toast.success(t('admin_users_page.account_unfrozen_success'));
    } catch (error) {
      toast.error(t('admin_users_page.account_unfrozen_failed'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin_users_page.delete_user_confirm'))) return;

    try {
      await deleteUser.mutateAsync(id);
      toast.success('User and all associated data deleted successfully');
    } catch (error: any) {
      console.error('Delete user error:', error);
      toast.error(error.message || t('admin_users_page.user_delete_failed'));
    }
  };


  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync(createForm);
      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      setCreateForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        account_number: '',
        account_type: 'checking',
        account_balance: '0',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('admin_users_page.title')}</h1>
            <p className="text-muted-foreground">{t('admin_users_page.subtitle')}</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create_first_name">First Name</Label>
                    <Input
                      id="create_first_name"
                      value={createForm.first_name}
                      onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create_last_name">Last Name</Label>
                    <Input
                      id="create_last_name"
                      value={createForm.last_name}
                      onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create_email">Email Address</Label>
                    <Input
                      id="create_email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create_password">Password</Label>
                    <Input
                      id="create_password"
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_phone">Phone Number</Label>
                  <Input
                    id="create_phone"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  />
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-4 text-sm">Initial Account Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create_account_number">Account Number</Label>
                      <Input
                        id="create_account_number"
                        value={createForm.account_number}
                        onChange={(e) => setCreateForm({ ...createForm, account_number: e.target.value })}
                        placeholder="e.g. 1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create_account_type">Account Type</Label>
                      <select
                        id="create_account_type"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={createForm.account_type}
                        onChange={(e) => setCreateForm({ ...createForm, account_type: e.target.value })}
                      >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="investment">Investment</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="create_account_balance">Initial Balance ($)</Label>
                    <Input
                      id="create_account_balance"
                      type="number"
                      step="0.01"
                      value={createForm.account_balance}
                      onChange={(e) => setCreateForm({ ...createForm, account_balance: e.target.value })}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={createUser.isPending}>
                  {createUser.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t('admin_users_page.all_users')} ({profiles?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin_users_page.search_users')}
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">{t('admin_users_page.loading_users')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin_users_page.user')}</TableHead>
                      <TableHead>{t('admin_users_page.email')}</TableHead>
                      <TableHead>{t('admin_users_page.phone')}</TableHead>
                      <TableHead>{t('admin_users_page.kyc_status')}</TableHead>
                      <TableHead>{t('admin_users_page.account_status')}</TableHead> {/* Added */}
                      <TableHead>{t('admin_users_page.joined')}</TableHead>
                      <TableHead>{t('admin_users_page.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles?.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">
                              {profile.first_name} {profile.last_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            profile.kyc_status === 'verified' ? 'default' :
                            profile.kyc_status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {profile.kyc_status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">active</Badge>
                        </TableCell>
                        <TableCell>
                          {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEdit(profile)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t('admin_users_page.edit_user')}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>{t('admin_users_page.first_name')}</Label>
                                      <Input
                                        value={editForm.first_name}
                                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>{t('admin_users_page.last_name')}</Label>
                                      <Input
                                        value={editForm.last_name}
                                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('admin_users_page.email')}</Label>
                                    <Input
                                      value={editForm.email}
                                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('admin_users_page.phone')}</Label>
                                    <Input
                                      value={editForm.phone}
                                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('admin_users_page.kyc_status')}</Label>
                                    <select
                                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                      value={editForm.kyc_status}
                                      onChange={(e) => setEditForm({ ...editForm, kyc_status: e.target.value })}
                                    >
                                      <option value="pending">{t('admin_users_page.pending')}</option>
                                      <option value="verified">{t('admin_users_page.verified')}</option>
                                      <option value="rejected">{t('admin_users_page.rejected')}</option>
                                    </select>
                                  </div>
                                  <Button className="w-full" onClick={handleSave}>
                                    {t('admin_users_page.save_changes')}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(profile.id)}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(profile.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
