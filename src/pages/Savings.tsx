import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts, useSavingsVaults, useCreateSavingsVault, useDepositToVault, useWithdrawFromVault } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PiggyBank, Plus, TrendingUp, Target, Lock, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SavingsVault } from '@/hooks/useBankingData';

const Savings = () => {
  const { t } = useTranslation();
  const { data: accounts } = useAccounts();
  const { data: savingsVaults, isLoading } = useSavingsVaults();
  const createVault = useCreateSavingsVault();
  const depositToVault = useDepositToVault();
  const withdrawFromVault = useWithdrawFromVault();
  const { toast } = useToast();

  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultTarget, setNewVaultTarget] = useState('');
  const [newVaultLocked, setNewVaultLocked] = useState(false);
  const [newVaultMaturity, setNewVaultMaturity] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const [selectedVault, setSelectedVault] = useState<SavingsVault | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');

  const currencySymbol = t('currency.symbol');
  const totalSavings = savingsVaults?.reduce((sum, vault) => sum + Number(vault.current_balance), 0) || 0;

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleCreateVault = async () => {
    if (!newVaultName || !newVaultTarget) {
      toast({ title: "Name and target are required", variant: 'destructive' });
      return;
    }
    
    setIsCreating(true);
    try {
      await createVault.mutateAsync({
        name: newVaultName,
        target_amount: parseFloat(newVaultTarget),
        is_locked: newVaultLocked,
        maturity_date: newVaultLocked && newVaultMaturity ? newVaultMaturity : null,
      });
      toast({ title: "Savings vault created successfully" });
      setNewVaultName('');
      setNewVaultTarget('');
      setNewVaultLocked(false);
      setNewVaultMaturity('');
    } catch (error) {
      toast({ title: "Failed to create vault", variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedVault || !depositAmount || !fromAccountId) {
      toast({ title: "Please select a vault, amount, and source account.", variant: 'destructive' });
      return;
    }
    try {
      await depositToVault.mutateAsync({
        vaultId: selectedVault.id,
        amount: parseFloat(depositAmount),
        fromAccountId,
      });
      toast({ title: "Deposit successful" });
      setDepositAmount('');
    } catch (error) {
      toast({ title: "Deposit failed", description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handleWithdraw = async () => {
    if (!selectedVault || !withdrawAmount || !fromAccountId) {
      toast({ title: "Please select a vault, amount, and destination account.", variant: 'destructive' });
      return;
    }
    try {
      await withdrawFromVault.mutateAsync({
        vaultId: selectedVault.id,
        amount: parseFloat(withdrawAmount),
        toAccountId: fromAccountId,
      });
      toast({ title: "Withdrawal successful" });
      setWithdrawAmount('');
    } catch (error) {
      toast({ title: "Withdrawal failed", description: (error as Error).message, variant: 'destructive' });
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('savings_page.title')}</h1>
            <p className="text-muted-foreground">{t('savings_page.subtitle')}</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                {t('savings_page.create_new_vault')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('savings_page.create_new_goal')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Vault Name</Label>
                  <Input value={newVaultName} onChange={(e) => setNewVaultName(e.target.value)} placeholder="e.g., Emergency Fund" />
                </div>
                <div className="space-y-2">
                  <Label>Target Amount</Label>
                  <Input type="number" value={newVaultTarget} onChange={(e) => setNewVaultTarget(e.target.value)} placeholder="e.g., 10000" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="lock-vault" checked={newVaultLocked} onCheckedChange={setNewVaultLocked} />
                  <Label htmlFor="lock-vault">Lock this vault?</Label>
                </div>
                {newVaultLocked && (
                  <div className="space-y-2">
                    <Label>Maturity Date</Label>
                    <Input type="date" value={newVaultMaturity} onChange={(e) => setNewVaultMaturity(e.target.value)} />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateVault} disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Vault
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <p className="text-sm opacity-90">{t('savings_page.total_savings')}</p>
              <p className="text-3xl font-bold">{formatCurrency(totalSavings)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{t('savings_page.apy_info')}</span>
          </div>
        </motion.div>

        {/* Savings Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('savings_page.goals_title')}</h2>
          {isLoading ? (
             <p className="text-muted-foreground">Loading savings vaults...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savingsVaults?.map((vault, index) => {
                const progress = (Number(vault.current_balance) / Number(vault.target_amount)) * 100;
                return (
                  <motion.div
                    key={vault.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-6 rounded-2xl bg-card border border-border flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                      {vault.is_locked && <Lock className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-1">{vault.name}</h3>
                    <p className="text-2xl font-bold text-foreground mb-4">
                      {formatCurrency(Number(vault.current_balance))}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        {t('savings_page.of')} {formatCurrency(Number(vault.target_amount))}
                      </span>
                    </p>

                    <div className="space-y-2 flex-grow">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {progress.toFixed(0)}{t('savings_page.complete')}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Dialog onOpenChange={() => setSelectedVault(vault)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Plus className="w-4 h-4 mr-2" />
                            Deposit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Deposit to {selectedVault?.name}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="space-y-2">
                              <Label>Amount</Label>
                              <Input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                              <Label>From Account</Label>
                              <select
                                value={fromAccountId}
                                onChange={(e) => setFromAccountId(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <option value="">Select account</option>
                                {accounts?.filter(acc => acc.account_type === 'checking').map((acc) => (
                                  <option key={acc.id} value={acc.id}>
                                    {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} - ****{acc.account_number.slice(-4)} ({formatCurrency(Number(acc.balance))})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button onClick={handleDeposit} disabled={depositToVault.isPending}>
                              {depositToVault.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Deposit
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog onOpenChange={() => setSelectedVault(vault)}>
                        <DialogTrigger asChild>
                           <Button size="sm" variant="outline" className="flex-1" disabled={vault.is_locked}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Withdraw
                          </Button>
                        </DialogTrigger>
                         <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Withdraw from {selectedVault?.name}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="space-y-2">
                              <Label>Amount</Label>
                              <Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                              <Label>To Account</Label>
                              <select
                                value={fromAccountId}
                                onChange={(e) => setFromAccountId(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <option value="">Select account</option>
                                {accounts?.filter(acc => acc.account_type === 'checking').map((acc) => (
                                  <option key={acc.id} value={acc.id}>
                                    {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} - ****{acc.account_number.slice(-4)} ({formatCurrency(Number(acc.balance))})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button onClick={handleWithdraw} disabled={withdrawFromVault.isPending}>
                              {withdrawFromVault.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Withdraw
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Savings;
