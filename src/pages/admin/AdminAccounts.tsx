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
import { useTranslation } from 'react-i18next';

const AdminAccounts = () => {
  const { t } = useTranslation();
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
      toast.success(t('admin_accounts_page.balance_updated'));
      setEditingAccount(null);
      setNewBalance('');
    } catch (error) {
      toast.error(t('admin_accounts_page.balance_update_failed'));
    }
  };

  const handleToggleStatus = async (account: AdminAccount) => {
    try {
      await toggleStatus.mutateAsync({
        id: account.id,
        is_active: !account.is_active,
      });
      toast.success(account.is_active ? t('admin_accounts_page.account_suspended') : t('admin_accounts_page.account_activated'));
    } catch (error) {
      toast.error(t('admin_accounts_page.status_update_failed'));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin_accounts_page.title')}</h1>
          <p className="text-muted-foreground">{t('admin_accounts_page.subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t('admin_accounts_page.all_accounts')} ({accounts?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin_accounts_page.search_accounts')}
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">{t('admin_accounts_page.loading_accounts')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin_accounts_page.account')}</TableHead>
                      <TableHead>{t('admin_accounts_page.user')}</TableHead>
                      <TableHead>{t('admin_accounts_page.type')}</TableHead>
                      <TableHead>{t('admin_accounts_page.balance')}</TableHead>
                      <TableHead>{t('admin_accounts_page.currency')}</TableHead>
                      <TableHead>{t('admin_accounts_page.status')}</TableHead>
                      <TableHead>{t('admin_accounts_page.actions')}</TableHead>
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
                            {account.is_active ? t('admin_accounts_page.active') : t('admin_accounts_page.suspended')}
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
                                  <DialogTitle>{t('admin_accounts_page.edit_balance')}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label>{t('admin_accounts_page.account_number')}</Label>
                                    <Input value={editingAccount?.account_number || ''} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('admin_accounts_page.new_balance')}</Label>
                                    <Input
                                      type="number"
                                      value={newBalance}
                                      onChange={(e) => setNewBalance(e.target.value)}
                                    />
                                  </div>
                                  <Button className="w-full" onClick={handleUpdateBalance}>
                                    {t('admin_accounts_page.update_balance')}
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
