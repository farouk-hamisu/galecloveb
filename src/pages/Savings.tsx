import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PiggyBank, Plus, TrendingUp, Target, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Savings = () => {
  const { t } = useTranslation();
  const { data: accounts } = useAccounts();
  
  const currencySymbol = t('currency.symbol');
  const savingsAccounts = accounts?.filter(acc => acc.account_type === 'savings') || [];
  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Sample savings goals (would be fetched from database in production)
  const savingsGoals = [
    { id: 1, name: 'Emergency Fund', target: 10000, current: 6500, color: 'bg-green-500' },
    { id: 2, name: 'Vacation', target: 5000, current: 2000, color: 'bg-blue-500' },
    { id: 3, name: 'New Car', target: 25000, current: 8000, color: 'bg-purple-500' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">Savings Vaults</h1>
            <p className="text-muted-foreground">Grow your wealth with smart savings goals.</p>
          </div>
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" />
            Create New Vault
          </Button>
        </motion.div>

        {/* Total Savings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Total Savings</p>
              <p className="text-3xl font-bold">{formatCurrency(totalSavings)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Earning 2% APY on your savings</span>
          </div>
        </motion.div>

        {/* Savings Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Savings Goals</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savingsGoals.map((goal, index) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-6 rounded-2xl bg-card border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-1">{goal.name}</h3>
                  <p className="text-2xl font-bold text-foreground mb-4">
                    {formatCurrency(goal.current)}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      of {formatCurrency(goal.target)}
                    </span>
                  </p>

                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full ${goal.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {progress.toFixed(0)}% complete
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Add New Goal Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer min-h-[200px]"
            >
              <Plus className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Create new goal</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Savings Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-primary/5 border border-primary/20"
        >
          <h3 className="font-semibold text-foreground mb-3">💡 Savings Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Set up automatic transfers to your savings vault every payday</li>
            <li>• Round up your purchases and save the difference</li>
            <li>• Challenge yourself with a no-spend week each month</li>
            <li>• Review and cut unnecessary subscriptions</li>
          </ul>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Savings;
