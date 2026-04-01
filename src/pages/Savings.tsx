import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts, useTransactions } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PiggyBank, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Savings = () => {
  const { t } = useTranslation();
  const { data: accounts, isLoading } = useAccounts();
  const { data: transactions } = useTransactions();

  const savingsAccounts = accounts?.filter(acc => acc.account_type === 'savings') || [];
  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  const currencySymbol = t('currency.symbol');
  const formatCurrency = (amount: number) => `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-0.5">{t('savings_page.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('savings_page.subtitle')}</p>
          </div>
          <Link to="/accounts">
            <Button size="sm" className="text-xs">Open Savings Account</Button>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs opacity-90">{t('savings_page.total_savings')}</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSavings)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('savings_page.apy_info')}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-sm font-semibold text-foreground mb-3">Savings Accounts</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : savingsAccounts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {savingsAccounts.map((account) => (
                <div key={account.id} className="p-5 rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <PiggyBank className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{account.account_type} Account</p>
                        <p className="text-xs text-muted-foreground">****{account.account_number.slice(-4)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-3">{formatCurrency(Number(account.balance))}</p>
                  <div className="flex gap-2">
                    <Link to="/deposits" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">Deposit</Button>
                    </Link>
                    <Link to="/transfer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">Transfer</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-card rounded-xl border border-border">
              <PiggyBank className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No savings accounts yet</p>
              <Link to="/accounts">
                <Button size="sm" className="text-xs">Open a Savings Account</Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Savings;
