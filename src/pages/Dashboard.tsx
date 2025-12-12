import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProfile, useAccounts, useTransactions, useCards } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  TrendingUp, 
  PiggyBank,
  Send,
  Download,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: transactions } = useTransactions();
  const { data: cards } = useCards();

  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
  const recentTransactions = transactions?.slice(0, 5) || [];

  const currencySymbol = t('currency.symbol');

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
            Welcome back, {profile?.first_name || 'User'}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your accounts.</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Link to="/transfer">
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Send Money</span>
            </div>
          </Link>
          <Link to="/accounts">
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm font-medium text-foreground">Deposit</span>
            </div>
          </Link>
          <Link to="/cards">
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-foreground">Cards</span>
            </div>
          </Link>
          <Link to="/savings">
            <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-foreground">Savings</span>
            </div>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm opacity-90">Total Balance</span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{formatCurrency(totalBalance)}</p>
            <p className="text-sm opacity-75">+2.5% from last month</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">This Month Income</span>
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{formatCurrency(2450)}</p>
            <p className="text-sm text-green-500">+12% from last month</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">This Month Expenses</span>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{formatCurrency(1280)}</p>
            <p className="text-sm text-red-500">+5% from last month</p>
          </div>
        </motion.div>

        {/* Accounts & Transactions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* My Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">My Accounts</h2>
              <Link to="/accounts">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {accountsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : accounts && accounts.length > 0 ? (
                accounts.slice(0, 3).map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">{account.account_type} Account</p>
                        <p className="text-sm text-muted-foreground">****{account.account_number.slice(-4)}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">{formatCurrency(Number(account.balance))}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No accounts found</p>
              )}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
              <Link to="/transactions">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type.includes('in') || tx.type === 'deposit' 
                          ? 'bg-green-500/10' 
                          : 'bg-red-500/10'
                      }`}>
                        {tx.type.includes('in') || tx.type === 'deposit' ? (
                          <ArrowDownRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{tx.description || tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      tx.type.includes('in') || tx.type === 'deposit'
                        ? 'text-green-500'
                        : 'text-foreground'
                    }`}>
                      {tx.type.includes('in') || tx.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(Number(tx.amount))}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No transactions yet</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Cards Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">My Cards</h2>
            <Link to="/cards">
              <Button variant="ghost" size="sm">Manage Cards</Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards && cards.length > 0 ? (
              cards.slice(0, 2).map((card) => (
                <div 
                  key={card.id} 
                  className={`relative p-6 rounded-2xl bg-gradient-to-br ${
                    card.is_frozen 
                      ? 'from-gray-400 to-gray-600' 
                      : 'from-gray-800 to-gray-900'
                  } text-white overflow-hidden`}
                >
                  {card.is_frozen && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/20 rounded text-xs">
                      Frozen
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-sm opacity-75 capitalize">{card.card_type} Card</span>
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <p className="font-mono text-lg mb-4 tracking-wider">
                    •••• •••• •••• {card.card_number.slice(-4)}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs opacity-75">Expires</p>
                      <p className="font-mono">{card.expiry_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-75">Limit</p>
                      <p className="font-semibold">{formatCurrency(Number(card.spending_limit))}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Link 
                to="/cards" 
                className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer min-h-[180px]"
              >
                <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Create your first card</span>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
