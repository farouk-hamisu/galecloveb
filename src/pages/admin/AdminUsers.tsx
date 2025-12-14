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
  useDeleteProfile,
  AdminProfile 
} from '@/hooks/useAdminData';
import { Search, Edit, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

const AdminUsers = () => {
  const { data: profiles, isLoading } = useAdminProfiles();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();
  
  const [searchTerm, setSearchTerm] = useState('');
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
      toast.success('User updated successfully');
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await deleteProfile.mutateAsync(id);
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage all registered users</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Users ({profiles?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
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
                                  <DialogTitle>Edit User</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>First Name</Label>
                                      <Input
                                        value={editForm.first_name}
                                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Last Name</Label>
                                      <Input
                                        value={editForm.last_name}
                                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                      value={editForm.email}
                                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                      value={editForm.phone}
                                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>KYC Status</Label>
                                    <select
                                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                      value={editForm.kyc_status}
                                      onChange={(e) => setEditForm({ ...editForm, kyc_status: e.target.value })}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="verified">Verified</option>
                                      <option value="rejected">Rejected</option>
                                    </select>
                                  </div>
                                  <Button className="w-full" onClick={handleSave}>
                                    Save Changes
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
