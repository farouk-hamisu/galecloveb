import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts, useBtcWallet } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Bitcoin, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

const SIMULATED_BTC_PRICE = 67432.50;

const Swap = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: accounts } = useAccounts();
  const { data: btcWallet } = useBtcWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [direction, setDirection] = useState<'fiat_to_btc' | 'btc_to_fiat'>('fiat_to_btc');
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const convertedAmount = direction === 'fiat_to_btc' 
    ? parsedAmount / SIMULATED_BTC_PRICE 
    : parsedAmount * SIMULATED_BTC_PRICE;

  const currencySymbol = t('currency.symbol');

  const handleSwap = async () => {
    if (!user?.id || !selectedAccountId || parsedAmount <= 0) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    if (!btcWallet) {
      toast({ title: 'No Bitcoin wallet found. Please contact support.', variant: 'destructive' });
      return;
    }

    setIsSwapping(true);
    try {
      const account = accounts?.find(a => a.id === selectedAccountId);
      if (!account) throw new Error('Account not found');

      if (direction === 'fiat_to_btc') {
        if (Number(account.balance) < parsedAmount) {
          throw new Error('Insufficient fiat balance');
        }
        // Debit fiat
        await supabase.from('accounts').update({ balance: Number(account.balance) - parsedAmount }).eq('id', selectedAccountId);
        // Credit BTC
        await supabase.from('btc_wallets').update({ btc_balance: Number(btcWallet.btc_balance) + convertedAmount }).eq('user_id', user.id);
        // Record transaction
        await supabase.from('transactions').insert({
          account_id: selectedAccountId,
          type: 'withdrawal',
          amount: parsedAmount,
          currency: 'USD',
          description: `Swap to BTC: ${convertedAmount.toFixed(8)} BTC`,
          reference_number: 'SWP' + Date.now().toString(36).toUpperCase(),
          status: 'completed'
        });
      } else {
        if (Number(btcWallet.btc_balance) < parsedAmount) {
          throw new Error('Insufficient BTC balance');
        }
        // Debit BTC
        await supabase.from('btc_wallets').update({ btc_balance: Number(btcWallet.btc_balance) - parsedAmount }).eq('user_id', user.id);
        // Credit fiat
        await supabase.from('accounts').update({ balance: Number(account.balance) + convertedAmount }).eq('id', selectedAccountId);
        // Record transaction
        await supabase.from('transactions').insert({
          account_id: selectedAccountId,
          type: 'deposit',
          amount: convertedAmount,
          currency: 'USD',
          description: `Swap from BTC: ${parsedAmount.toFixed(8)} BTC`,
          reference_number: 'SWP' + Date.now().toString(36).toUpperCase(),
          status: 'completed'
        });
      }

      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['btc_wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      toast({ title: 'Swap completed successfully!' });
      setAmount('');
    } catch (error) {
      toast({ title: 'Swap failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-0.5">Swap</h1>
          <p className="text-sm text-muted-foreground">Convert between fiat and Bitcoin instantly</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-xl bg-card border border-border space-y-4"
        >
          {/* Direction Toggle */}
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setDirection('fiat_to_btc')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                direction === 'fiat_to_btc' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" /> USD → BTC
            </button>
            <button onClick={() => setDirection('btc_to_fiat')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                direction === 'btc_to_fiat' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              <Bitcoin className="w-3.5 h-3.5" /> BTC → USD
            </button>
          </div>

          {/* Account Selection */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Fiat Account</label>
            <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select account</option>
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} - ****{acc.account_number.slice(-4)} ({currencySymbol}{Number(acc.balance).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              {direction === 'fiat_to_btc' ? 'Amount (USD)' : 'Amount (BTC)'}
            </label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder={direction === 'fiat_to_btc' ? '0.00' : '0.00000000'} min="0" step="any"
            />
          </div>

          {/* Conversion Preview */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">You'll receive</span>
              <span className="font-semibold text-foreground">
                {direction === 'fiat_to_btc' 
                  ? `${convertedAmount.toFixed(8)} BTC`
                  : `${currencySymbol}${convertedAmount.toFixed(2)}`
                }
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-muted-foreground">Rate</span>
              <span className="text-muted-foreground">1 BTC = {currencySymbol}{SIMULATED_BTC_PRICE.toLocaleString()}</span>
            </div>
            {btcWallet && (
              <div className="flex items-center justify-between text-xs mt-1.5">
                <span className="text-muted-foreground">BTC Balance</span>
                <span className="text-foreground font-medium">{Number(btcWallet.btc_balance).toFixed(8)} BTC</span>
              </div>
            )}
          </div>

          <Button className="w-full text-sm" onClick={handleSwap} disabled={isSwapping || parsedAmount <= 0}>
            {isSwapping ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Swapping...</>
            ) : (
              <><ArrowLeftRight className="w-4 h-4 mr-2" /> Swap Now</>
            )}
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Swap;
