import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts, useBeneficiaries } from '@/hooks/useBankingData';
import { useTransfer } from '@/hooks/useTransfer';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Globe, ArrowRight, Loader2, CheckCircle2, User, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Transfer = () => {
  const { t } = useTranslation();
  const { data: accounts } = useAccounts();
  const { data: beneficiaries } = useBeneficiaries();
  const { toast } = useToast();
  const transferMutation = useTransfer();
  
  const [transferType, setTransferType] = useState<'internal' | 'international'>('internal');
  const [lookupType, setLookupType] = useState<'account' | 'email'>('account');
  const [fromAccount, setFromAccount] = useState('');
  const [toIdentifier, setToIdentifier] = useState('');
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    amount: number;
    currency: string;
    recipientName: string;
    referenceNumber: string;
  } | null>(null);

  const currencySymbol = t('currency.symbol');

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const resetForm = () => {
    setFromAccount('');
    setToIdentifier('');
    setBeneficiaryId('');
    setAmount('');
    setDescription('');
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

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid transfer amount.',
        variant: 'destructive',
      });
      return;
    }

    if (transferType === 'internal' && !toIdentifier.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter recipient email or account number.',
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

    try {
      const result = await transferMutation.mutateAsync({
        fromAccountId: fromAccount,
        toIdentifier: toIdentifier.trim(),
        amount: transferAmount,
        description: description || undefined,
        transferType,
        beneficiaryId: beneficiaryId || undefined
      });

      setSuccessDetails({
        amount: result.amount,
        currency: result.currency,
        recipientName: result.recipientName,
        referenceNumber: result.referenceNumber
      });
      setShowSuccess(true);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Transfer Failed',
        description: error.message || 'An error occurred during the transfer.',
        variant: 'destructive',
      });
    }
  };

  const handleNewTransfer = () => {
    setShowSuccess(false);
    setSuccessDetails(null);
  };

  // Success Screen
  if (showSuccess && successDetails) {
    const currSymbol = successDetails.currency === 'EUR' ? '€' : '$';
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-14 h-14 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-foreground mb-2"
            >
              Transfer Successful!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mb-8"
            >
              Your money is on its way
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card border border-border rounded-2xl p-6 mb-6"
            >
              <div className="text-4xl font-bold text-foreground mb-4">
                {currSymbol}{successDetails.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>

              <div className="space-y-3 text-left">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Recipient</span>
                  <span className="font-medium text-foreground">{successDetails.recipientName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-sm text-foreground">{successDetails.referenceNumber}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-green-500 font-medium">Completed</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4"
            >
              <Button variant="outline" className="flex-1" onClick={handleNewTransfer}>
                New Transfer
              </Button>
              <Button variant="hero" className="flex-1" asChild>
                <Link to="/transactions">View Transactions</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">Transfer Money</h1>
          <p className="text-muted-foreground">Send money instantly to anyone, anywhere.</p>
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
                <p className="text-sm text-muted-foreground">Send to any bank user</p>
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Send To
                  </label>
                  
                  {/* Lookup Type Toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setLookupType('account')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all ${
                        lookupType === 'account'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <Hash className="w-4 h-4" />
                      Account Number
                    </button>
                    <button
                      type="button"
                      onClick={() => setLookupType('email')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all ${
                        lookupType === 'email'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Email Address
                    </button>
                  </div>

                  <input
                    type={lookupType === 'email' ? 'email' : 'text'}
                    value={toIdentifier}
                    onChange={(e) => setToIdentifier(e.target.value)}
                    placeholder={lookupType === 'email' ? 'recipient@example.com' : 'NCU1234567890'}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
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
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit" variant="hero" disabled={transferMutation.isPending}>
                {transferMutation.isPending ? (
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
