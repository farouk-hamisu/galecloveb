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
  useAdminAccounts, 
  useAdminProfiles,
  useUpdateAccountBalance,
  useToggleAccountStatus,
  AdminAccount 
} from '@/hooks/useAdminData';
import { Search, Edit, Power, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const AdminAccounts = () => {
  const { data: accounts, isLoading } = useAdminAccounts();
  const { data: profiles } = useAdminProfiles();
  const updateBalance = useUpdateAccountBalance();
  const toggleStatus = useToggleAccountStatus();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [newBalance, setNewBalance] = useState('');

  const getProfileEmail = (userId: string) => {
    const profile = profiles?.find(p => p.id === userId);
    return profile?.email || 'Unknown';
  };

  const filteredAccounts = accounts?.filter(a => 
    a.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getProfileEmail(a.user_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateBalance = async () => {
    if (!editingAccount || !newBalance) return;
    
    try {
      await updateBalance.mutateAsync({
        id: editingAccount.id,
        balance: parseFloat(newBalance),
      });
      toast.success('Balance updated successfully');
      setEditingAccount(null);
      setNewBalance('');
    } catch (error) {
      toast.error('Failed to update balance');
    }
  };

  const handleToggleStatus = async (account: AdminAccount) => {
    try {
      await toggleStatus.mutateAsync({
        id: account.id,
        is_active: !account.is_active,
      });
      toast.success(`Account ${account.is_active ? 'suspended' : 'activated'} successfully`);
    } catch (error) {
      toast.error('Failed to update account status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Management</h1>
          <p className="text-muted-foreground">Manage user accounts and balances</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Accounts ({accounts?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading accounts...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts?.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                              <Wallet className="w-4 h-4 text-green-500" />
                            </div>
                            <span className="font-mono text-sm">{account.account_number}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getProfileEmail(account.user_id)}</TableCell>
                        <TableCell className="capitalize">{account.account_type}</TableCell>
                        <TableCell className="font-semibold">
                          ${(account.balance || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>{account.currency}</TableCell>
                        <TableCell>
                          <Badge variant={account.is_active ? 'default' : 'destructive'}>
                            {account.is_active ? 'Active' : 'Suspended'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setEditingAccount(account);
                                    setNewBalance(String(account.balance || 0));
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Account Balance</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label>Account Number</Label>
                                    <Input value={editingAccount?.account_number || ''} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>New Balance</Label>
                                    <Input
                                      type="number"
                                      value={newBalance}
                                      onChange={(e) => setNewBalance(e.target.value)}
                                    />
                                  </div>
                                  <Button className="w-full" onClick={handleUpdateBalance}>
                                    Update Balance
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className={account.is_active ? 'text-destructive hover:text-destructive' : 'text-green-500 hover:text-green-500'}
                              onClick={() => handleToggleStatus(account)}
                            >
                              <Power className="w-4 h-4" />
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

export default AdminAccounts;
