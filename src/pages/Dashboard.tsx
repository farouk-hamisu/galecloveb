import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProfile, useAccounts, useTransactions, useCards, useBtcWallet } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { isCreditTransaction } from '@/lib/utils';
import { 
  ArrowUpRight, ArrowDownRight, CreditCard, TrendingUp, PiggyBank,
  Send, Download, Plus, Bitcoin, Copy, ArrowLeftRight, ExternalLink, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const BTC_PRICE = 67432.50;

const Dashboard = () => {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: transactions } = useTransactions();
  const { data: cards } = useCards();
  const { data: btcWallet } = useBtcWallet();
  const { toast } = useToast();
  const [sendBtcOpen, setSendBtcOpen] = useState(false);
  const [btcRecipient, setBtcRecipient] = useState('');
  const [btcAmount, setBtcAmount] = useState('');

  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
  const btcBalance = btcWallet ? Number(btcWallet.btc_balance) : 0;
  const totalBalanceBtc = (totalBalance / BTC_PRICE) + btcBalance;
  const recentTransactions = transactions?.slice(0, 5) || [];

  const currencySymbol = t('currency.symbol');
  const formatCurrency = (amount: number) =>
    `${currencySymbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthTransactions = transactions?.filter(tx => {
    const d = new Date(tx.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }) || [];
  const lastMonthTransactions = transactions?.filter(tx => {
    const d = new Date(tx.created_at);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  }) || [];

  const getIncome = (txs: any[]) => txs.filter(tx => isCreditTransaction(tx.type)).reduce((s, tx) => s + Number(tx.amount), 0);
  const getExpenses = (txs: any[]) => txs.filter(tx => !isCreditTransaction(tx.type)).reduce((s, tx) => s + Number(tx.amount), 0);

  const thisMonthIncome = getIncome(currentMonthTransactions);
  const thisMonthExpenses = getExpenses(currentMonthTransactions);
  const lastMonthIncome = getIncome(lastMonthTransactions);
  const lastMonthExpenses = getExpenses(lastMonthTransactions);

  const pctChange = (cur: number, prev: number) => prev === 0 ? (cur > 0 ? 100 : 0) : ((cur - prev) / prev) * 100;
  const incomeChange = pctChange(thisMonthIncome, lastMonthIncome);
  const expensesChange = pctChange(thisMonthExpenses, lastMonthExpenses);
  const fmtPct = (c: number) => `${c >= 0 ? '+' : '-'}${Math.abs(c).toFixed(1)}% vs last month`;

  const copyWalletAddress = () => {
    if (btcWallet?.wallet_address) {
      navigator.clipboard.writeText(btcWallet.wallet_address);
      toast({ title: 'Wallet address copied!' });
    }
  };

  const [isSendingBtc, setIsSendingBtc] = useState(false);

  const handleSendBtc = async () => {
    const amt = parseFloat(btcAmount);
    if (!btcRecipient || isNaN(amt) || amt <= 0) {
      toast({ title: 'Please enter a valid address and amount', variant: 'destructive' });
      return;
    }
    setIsSendingBtc(true);
    // Simulate processing
    await new Promise(r => setTimeout(r, 2500));
    setIsSendingBtc(false);
    toast({ title: 'BTC Sent Successfully', description: `${amt} BTC sent to ${btcRecipient.slice(0, 10)}...` });
    setSendBtcOpen(false);
    setBtcRecipient('');
    setBtcAmount('');
  };

  const avatarUrl = profile?.avatar_url;
  const initials = `${(profile?.first_name || 'U')[0]}${(profile?.last_name || '')[0] || ''}`.toUpperCase();

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Welcome with Profile Image */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-11 h-11 rounded-full object-cover border-2 border-border" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
              <span className="text-primary font-semibold text-sm">{initials}</span>
            </div>
          )}
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-foreground mb-0.5">
              {t('dashboard_page.welcome', { name: profile?.first_name || 'User' })}
            </h1>
            <p className="text-xs text-muted-foreground">{t('dashboard_page.subtitle')}</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-2"
        >
          {[
            { to: '/transfer', icon: Send, label: t('dashboard_page.quick_actions.send'), color: 'bg-primary/10 text-primary' },
            { to: '/deposits', icon: Download, label: t('dashboard_page.quick_actions.deposit'), color: 'bg-emerald-500/10 text-emerald-600' },
            { to: '/cards', icon: CreditCard, label: t('dashboard_page.quick_actions.cards'), color: 'bg-primary/10 text-primary' },
            { to: '/savings', icon: PiggyBank, label: t('dashboard_page.quick_actions.savings'), color: 'bg-violet-500/10 text-violet-600' },
            { to: '/swap', icon: ArrowLeftRight, label: 'Swap', color: 'bg-amber-500/10 text-amber-600' },
          ].map(item => (
            <Link key={item.to} to={item.to}>
              <div className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
                <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-foreground">{item.label}</span>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid md:grid-cols-3 gap-3"
        >
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] opacity-90">{t('dashboard_page.stats.total_balance')}</span>
              <TrendingUp className="w-4 h-4 opacity-70" />
            </div>
            <p className="text-xl font-bold mb-0.5">{formatCurrency(totalBalance)}</p>
            <p className="text-[11px] opacity-75">≈ {totalBalanceBtc.toFixed(6)} BTC</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground">{t('dashboard_page.stats.income')}</span>
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-foreground mb-0.5">{formatCurrency(thisMonthIncome)}</p>
            <p className="text-[11px] text-emerald-600">{fmtPct(incomeChange)}</p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground">{t('dashboard_page.stats.expenses')}</span>
              <ArrowUpRight className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-xl font-bold text-foreground mb-0.5">{formatCurrency(thisMonthExpenses)}</p>
            <p className="text-[11px] text-red-500">{fmtPct(expensesChange)}</p>
          </div>
        </motion.div>

        {/* Bitcoin Wallet */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Bitcoin className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">Bitcoin Wallet</h3>
                <p className="text-[11px] text-muted-foreground">≈ {formatCurrency(btcBalance * BTC_PRICE)}</p>
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">{totalBalanceBtc.toFixed(8)} BTC</p>
          </div>

          {/* Receive BTC - Wallet Address */}
          {btcWallet?.wallet_address && (
            <div className="mb-3">
              <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wide">Receive BTC</p>
              <div className="flex items-center gap-2 p-2 bg-background/60 rounded-lg">
                <span className="text-[11px] text-muted-foreground flex-1 font-mono truncate">{btcWallet.wallet_address}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2" onClick={copyWalletAddress}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => setSendBtcOpen(true)}>
              <Send className="w-3 h-3 mr-1" /> Send BTC
            </Button>
            <Link to="/swap" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs h-8">
                <ArrowLeftRight className="w-3 h-3 mr-1" /> Swap
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Accounts & Transactions */}
        <div className="grid lg:grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-foreground">{t('dashboard_page.accounts.title')}</h2>
              <Link to="/accounts"><Button variant="ghost" size="sm" className="text-[11px] h-7">{t('dashboard_page.accounts.view_all')}</Button></Link>
            </div>
            <div className="space-y-2">
              {accountsLoading ? (
                [1, 2].map(i => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)
              ) : accounts && accounts.length > 0 ? (
                accounts.slice(0, 3).map(account => (
                  <div key={account.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground capitalize">{account.account_type}</p>
                        <p className="text-[10px] text-muted-foreground">****{account.account_number.slice(-4)}</p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{formatCurrency(Number(account.balance))}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-3 text-xs">{t('dashboard_page.accounts.no_accounts')}</p>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-foreground">{t('dashboard_page.transactions.title')}</h2>
              <Link to="/transactions"><Button variant="ghost" size="sm" className="text-[11px] h-7">{t('dashboard_page.transactions.view_all')}</Button></Link>
            </div>
            <div className="space-y-2">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isCreditTransaction(tx.type) ? 'bg-emerald-500/10' : 'bg-red-500/10'
                      }`}>
                        {isCreditTransaction(tx.type) ? <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-foreground">
                          {tx.type === 'transfer_out' ? 'Debit' : tx.type === 'transfer_in' ? 'Credit' : tx.description || tx.type}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold ${isCreditTransaction(tx.type) ? 'text-emerald-600' : 'text-foreground'}`}>
                      {isCreditTransaction(tx.type) ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-3 text-xs">{t('dashboard_page.transactions.no_transactions')}</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Cards Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-foreground">{t('dashboard_page.cards.title')}</h2>
            <Link to="/cards"><Button variant="ghost" size="sm" className="text-[11px] h-7">{t('dashboard_page.cards.manage')}</Button></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {cards && cards.filter(c => c.card_status === 'approved').length > 0 ? (
              cards.filter(c => c.card_status === 'approved').slice(0, 2).map(card => (
                <div key={card.id} className={`relative p-4 rounded-xl bg-gradient-to-br ${card.is_frozen ? 'from-gray-400 to-gray-600' : 'from-primary to-primary/80'} text-primary-foreground overflow-hidden`}>
                  {card.is_frozen && <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-primary-foreground/20 rounded text-[9px]">{t('dashboard_page.cards.frozen')}</div>}
                  <div className="flex justify-between items-start mb-5">
                    <span className="text-[10px] opacity-75 capitalize">{card.card_type}</span>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <p className="font-mono text-xs mb-2 tracking-wider">•••• •••• •••• {card.card_number.slice(-4)}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] opacity-75">{t('dashboard_page.cards.expires')}</p>
                      <p className="font-mono text-[11px]">{card.expiry_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] opacity-75">{t('dashboard_page.cards.limit')}</p>
                      <p className="text-[11px] font-semibold">{formatCurrency(Number(card.spending_limit))}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Link to="/cards" className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/30 transition-colors cursor-pointer min-h-[120px]">
                <Plus className="w-5 h-5 text-muted-foreground mb-1" />
                <span className="text-[11px] text-muted-foreground">{t('dashboard_page.cards.create_card')}</span>
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {/* Send BTC Dialog */}
      <Dialog open={sendBtcOpen} onOpenChange={setSendBtcOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Send Bitcoin</DialogTitle>
          </DialogHeader>
          {isSendingBtc ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Processing Transaction</p>
                <p className="text-xs text-muted-foreground mt-1">Sending BTC to recipient...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Recipient Wallet Address</label>
                <Input placeholder="bc1q..." value={btcRecipient} onChange={e => setBtcRecipient(e.target.value)} className="text-xs" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Amount (BTC)</label>
                <Input type="number" placeholder="0.00000000" step="0.00000001" value={btcAmount} onChange={e => setBtcAmount(e.target.value)} className="text-xs" />
              </div>
              <Button className="w-full text-xs" onClick={handleSendBtc} disabled={isSendingBtc}>
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Send BTC
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
