import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts, useBeneficiaries } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, Globe, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Transfer = () => {
  const { t } = useTranslation();
  const { data: accounts } = useAccounts();
  const { data: beneficiaries } = useBeneficiaries();
  const { toast } = useToast();
  
  const [transferType, setTransferType] = useState<'internal' | 'international'>('internal');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const currencySymbol = t('currency.symbol');

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAccount || !amount) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (transferType === 'internal' && !toAccount) {
      toast({
        title: 'Missing information',
        description: 'Please select a destination account.',
        variant: 'destructive',
      });
      return;
    }

    if (transferType === 'international' && !beneficiaryId) {
      toast({
        title: 'Missing information',
        description: 'Please select a beneficiary.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    // Simulate transfer
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    toast({
      title: 'Transfer initiated!',
      description: `${currencySymbol}${amount} transfer has been initiated successfully.`,
    });
    
    // Reset form
    setAmount('');
    setDescription('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">Transfer Money</h1>
          <p className="text-muted-foreground">Send money instantly to your accounts or beneficiaries.</p>
        </motion.div>

        {/* Transfer Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <button
            onClick={() => setTransferType('internal')}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              transferType === 'internal'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                transferType === 'internal' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Internal Transfer</h3>
                <p className="text-sm text-muted-foreground">Between your own accounts</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTransferType('international')}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              transferType === 'international'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                transferType === 'international' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">International Transfer</h3>
                <p className="text-sm text-muted-foreground">SWIFT transfers worldwide</p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Transfer Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <form onSubmit={handleTransfer} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* From Account */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">From Account</label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select account</option>
                  {accounts?.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} - ****{acc.account_number.slice(-4)} ({formatCurrency(Number(acc.balance))})
                    </option>
                  ))}
                </select>
              </div>

              {/* To Account / Beneficiary */}
              {transferType === 'internal' ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">To Account</label>
                  <select
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select account</option>
                    {accounts?.filter(acc => acc.id !== fromAccount).map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} - ****{acc.account_number.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Beneficiary
                    <Link to="/beneficiaries" className="text-primary text-xs ml-2 hover:underline">
                      + Add new
                    </Link>
                  </label>
                  <select
                    value={beneficiaryId}
                    onChange={(e) => setBeneficiaryId(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select beneficiary</option>
                    {beneficiaries?.map((ben) => (
                      <option key={ben.id} value={ben.id}>
                        {ben.name} - {ben.bank_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment for..."
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {transferType === 'international' && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> International transfers may take 1-3 business days to complete. SWIFT fees may apply.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">Cancel</Button>
              <Button type="submit" variant="hero" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Send Transfer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Transfer;
