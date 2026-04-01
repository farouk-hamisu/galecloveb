import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProfile, useAccounts, useTransactions, useCards, useBtcWallet } from '@/hooks/useBankingData';
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
  Plus,
  Bitcoin,
  Copy,
  ArrowLeftRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: transactions } = useTransactions();
  const { data: cards } = useCards();
  const { data: btcWallet } = useBtcWallet();
  const { toast } = useToast();

  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
  const recentTransactions = transactions?.slice(0, 5) || [];

  const currencySymbol = t('currency.symbol');

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthTransactions = transactions?.filter(tx => {
    const txDate = new Date(tx.created_at);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  }) || [];

  const lastMonthTransactions = transactions?.filter(tx => {
    const txDate = new Date(tx.created_at);
    return txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear;
  }) || [];

  const getIncome = (txs: any[]) => txs
    .filter(tx => tx.type === 'transfer_in' || tx.type === 'deposit')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const getExpenses = (txs: any[]) => txs
    .filter(tx => tx.type === 'transfer_out' || tx.type === 'withdrawal' || tx.type === 'card_payment')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const thisMonthIncome = getIncome(currentMonthTransactions);
  const thisMonthExpenses = getExpenses(currentMonthTransactions);
  const lastMonthIncome = getIncome(lastMonthTransactions);
  const lastMonthExpenses = getExpenses(lastMonthTransactions);

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const incomeChange = calculatePercentageChange(thisMonthIncome, lastMonthIncome);
  const expensesChange = calculatePercentageChange(thisMonthExpenses, lastMonthExpenses);

  const formatPercentage = (change: number) => {
    const symbol = change >= 0 ? '+' : '-';
    return `${symbol}${Math.abs(change).toFixed(1)}% vs last month`;
  };

  const copyWalletAddress = () => {
    if (btcWallet?.wallet_address) {
      navigator.clipboard.writeText(btcWallet.wallet_address);
      toast({ title: 'Wallet address copied!' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-0.5">
            {t('dashboard_page.welcome', { name: profile?.first_name || 'User' })}
          </h1>
          <p className="text-sm text-muted-foreground">{t('dashboard_page.subtitle')}</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {[
            { to: '/transfer', icon: Send, label: t('dashboard_page.quick_actions.send'), color: 'bg-primary/10 text-primary' },
            { to: '/deposits', icon: Download, label: t('dashboard_page.quick_actions.deposit'), color: 'bg-emerald-500/10 text-emerald-600' },
            { to: '/cards', icon: CreditCard, label: t('dashboard_page.quick_actions.cards'), color: 'bg-primary/10 text-primary' },
            { to: '/savings', icon: PiggyBank, label: t('dashboard_page.quick_actions.savings'), color: 'bg-violet-500/10 text-violet-600' },
            { to: '/swap', icon: ArrowLeftRight, label: 'Swap', color: 'bg-amber-500/10 text-amber-600' },
          ].map(item => (
            <Link key={item.to} to={item.to}>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
                <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs opacity-90">{t('dashboard_page.stats.total_balance')}</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-0.5">{formatCurrency(totalBalance)}</p>
            <p className="text-xs opacity-75">{t('dashboard_page.stats.balance_change')}</p>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{t('dashboard_page.stats.income')}</span>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-0.5">{formatCurrency(thisMonthIncome)}</p>
            <p className="text-xs text-emerald-600">{formatPercentage(incomeChange)}</p>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{t('dashboard_page.stats.expenses')}</span>
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-0.5">{formatCurrency(thisMonthExpenses)}</p>
            <p className="text-xs text-red-500">{formatPercentage(expensesChange)}</p>
          </div>
        </motion.div>

        {/* Bitcoin Wallet */}
        {btcWallet && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Bitcoin className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Bitcoin Wallet</h3>
                  <p className="text-xs text-muted-foreground">BTC Balance</p>
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">{Number(btcWallet.btc_balance).toFixed(8)} BTC</p>
            </div>
            {btcWallet.wallet_address && (
              <div className="flex items-center gap-2 p-2.5 bg-background/60 rounded-lg">
                <span className="text-xs text-muted-foreground flex-1 font-mono truncate">{btcWallet.wallet_address}</span>
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={copyWalletAddress}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <Link to="/swap" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" /> Swap BTC
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Accounts & Transactions */}
        <div className="grid lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="p-5 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">{t('dashboard_page.accounts.title')}</h2>
              <Link to="/accounts">
                <Button variant="ghost" size="sm" className="text-xs">{t('dashboard_page.accounts.view_all')}</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {accountsLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : accounts && accounts.length > 0 ? (
                accounts.slice(0, 3).map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{account.account_type}</p>
                        <p className="text-xs text-muted-foreground">****{account.account_number.slice(-4)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(Number(account.balance))}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4 text-sm">{t('dashboard_page.accounts.no_accounts')}</p>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-5 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">{t('dashboard_page.transactions.title')}</h2>
              <Link to="/transactions">
                <Button variant="ghost" size="sm" className="text-xs">{t('dashboard_page.transactions.view_all')}</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type.includes('in') || tx.type === 'deposit' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                      }`}>
                        {tx.type.includes('in') || tx.type === 'deposit' ? (
                          <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {tx.type === 'transfer_out' ? 'Debit' : tx.type === 'transfer_in' ? 'Credit' : tx.description || tx.type}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${
                      tx.type.includes('in') || tx.type === 'deposit' ? 'text-emerald-600' : 'text-foreground'
                    }`}>
                      {tx.type.includes('in') || tx.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(Number(tx.amount))}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4 text-sm">{t('dashboard_page.transactions.no_transactions')}</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Cards Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="p-5 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">{t('dashboard_page.cards.title')}</h2>
            <Link to="/cards">
              <Button variant="ghost" size="sm" className="text-xs">{t('dashboard_page.cards.manage')}</Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards && cards.length > 0 ? (
              cards.slice(0, 2).map((card) => (
                <div key={card.id} 
                  className={`relative p-5 rounded-xl bg-gradient-to-br ${
                    card.is_frozen ? 'from-gray-400 to-gray-600' : 'from-primary to-primary/80'
                  } text-white overflow-hidden`}
                >
                  {card.is_frozen && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
                      {t('dashboard_page.cards.frozen')}
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs opacity-75 capitalize">{card.card_type}</span>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <p className="font-mono text-sm mb-3 tracking-wider">
                    •••• •••• •••• {card.card_number.slice(-4)}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] opacity-75">{t('dashboard_page.cards.expires')}</p>
                      <p className="font-mono text-xs">{card.expiry_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-75">{t('dashboard_page.cards.limit')}</p>
                      <p className="text-xs font-semibold">{formatCurrency(Number(card.spending_limit))}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Link to="/cards" 
                className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-border hover:border-primary/30 transition-colors cursor-pointer min-h-[140px]"
              >
                <Plus className="w-6 h-6 text-muted-foreground mb-1.5" />
                <span className="text-xs text-muted-foreground">{t('dashboard_page.cards.create_card')}</span>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
