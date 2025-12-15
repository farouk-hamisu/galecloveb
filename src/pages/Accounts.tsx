import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts } from '@/hooks/useBankingData';
import { useCreateAccount } from '@/hooks/useTransfer';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, PiggyBank, Briefcase, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const accountIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  checking: CreditCard,
  savings: PiggyBank,
  investment: Briefcase,
};

const Accounts = () => {
  const { t } = useTranslation();
  const { data: accounts, isLoading } = useAccounts();
  const createAccountMutation = useCreateAccount();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const currencySymbol = t('currency.symbol');
  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleCreateAccount = async (accountType: 'checking' | 'savings') => {
    try {
      await createAccountMutation.mutateAsync({ accountType });
      toast({
        title: 'Account Created!',
        description: `Your new ${accountType} account has been opened successfully.`,
      });
      setDialogOpen(false);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to create account.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">My Accounts</h1>
            <p className="text-muted-foreground">Manage all your bank accounts in one place.</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                Open New Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Open New Account</DialogTitle>
                <DialogDescription>
                  Choose the type of account you'd like to open.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <button
                  onClick={() => handleCreateAccount('checking')}
                  disabled={createAccountMutation.isPending}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Checking Account</h3>
                    <p className="text-sm text-muted-foreground">
                      For everyday transactions and payments
                    </p>
                  </div>
                  {createAccountMutation.isPending && (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  )}
                </button>

                <button
                  onClick={() => handleCreateAccount('savings')}
                  disabled={createAccountMutation.isPending}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <PiggyBank className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Savings Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Earn interest on your savings
                    </p>
                  </div>
                  {createAccountMutation.isPending && (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  )}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Total Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm opacity-90">Total Balance Across All Accounts</span>
          </div>
          <p className="text-4xl font-bold">{formatCurrency(totalBalance)}</p>
        </motion.div>

        {/* Accounts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Accounts</h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : accounts && accounts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account, index) => {
                const Icon = accountIcons[account.account_type] || CreditCard;
                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        account.account_type === 'savings' 
                          ? 'bg-green-500/10' 
                          : account.account_type === 'investment'
                            ? 'bg-purple-500/10'
                            : 'bg-primary/10'
                      }`}>
                        <Icon className={`w-7 h-7 ${
                          account.account_type === 'savings'
                            ? 'text-green-500'
                            : account.account_type === 'investment'
                              ? 'text-purple-500'
                              : 'text-primary'
                        }`} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        account.is_active 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground capitalize mb-1">
                      {account.account_type} Account
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {account.account_number}
                    </p>

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(Number(account.balance))}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-card border border-border">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No accounts yet</h3>
              <p className="text-muted-foreground mb-4">Open your first account to get started.</p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Open Account
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Accounts;
