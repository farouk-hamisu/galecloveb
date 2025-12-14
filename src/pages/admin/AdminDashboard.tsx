import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useAdminProfiles, 
  useAdminAccounts, 
  useAdminTransactions, 
  useAdminCards 
} from '@/hooks/useAdminData';
import { Users, Wallet, ArrowLeftRight, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { data: profiles, isLoading: profilesLoading } = useAdminProfiles();
  const { data: accounts, isLoading: accountsLoading } = useAdminAccounts();
  const { data: transactions, isLoading: transactionsLoading } = useAdminTransactions();
  const { data: cards, isLoading: cardsLoading } = useAdminCards();

  const totalUsers = profiles?.length || 0;
  const totalAccounts = accounts?.length || 0;
  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
  const totalTransactions = transactions?.length || 0;
  const totalCards = cards?.length || 0;
  const activeAccounts = accounts?.filter(a => a.is_active)?.length || 0;
  const frozenCards = cards?.filter(c => c.is_frozen)?.length || 0;

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of all banking operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">
                    {profilesLoading ? '...' : totalUsers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Accounts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {accountsLoading ? '...' : totalAccounts}
                  </p>
                  <p className="text-xs text-muted-foreground">{activeAccounts} active</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-2xl font-bold text-foreground">
                    {accountsLoading ? '...' : `$${totalBalance.toLocaleString()}`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold text-foreground">
                    {transactionsLoading ? '...' : totalTransactions}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <ArrowLeftRight className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                  <p className="text-2xl font-bold text-foreground">
                    {cardsLoading ? '...' : totalCards}
                  </p>
                  {frozenCards > 0 && (
                    <p className="text-xs text-destructive">{frozenCards} frozen</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactive Accounts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {accountsLoading ? '...' : totalAccounts - activeAccounts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : recentTransactions.length === 0 ? (
              <p className="text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{tx.description || tx.type}</p>
                      <p className="text-sm text-muted-foreground">{tx.reference_number}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === 'credit' || tx.type === 'deposit' ? 'text-green-500' : 'text-foreground'}`}>
                        {tx.type === 'credit' || tx.type === 'deposit' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
