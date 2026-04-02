import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts, useBeneficiaries } from '@/hooks/useBankingData';
import { useTransfer } from '@/hooks/useTransfer';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, Globe, ArrowRight, Loader2, CheckCircle2, User, Hash, Wallet, Bitcoin, DollarSign, Smartphone, CreditCard, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';

const transferMethods = [
  { id: 'wire', name: 'Wire Transfer', icon: Building2, color: 'bg-primary/10 text-primary' },
  { id: 'crypto', name: 'Cryptocurrency', icon: Bitcoin, color: 'bg-amber-500/10 text-amber-600' },
  { id: 'paypal', name: 'PayPal', icon: Wallet, color: 'bg-blue-500/10 text-blue-500' },
  { id: 'wise', name: 'Wise', icon: Globe, color: 'bg-green-500/10 text-green-600' },
  { id: 'cashapp', name: 'Cash App', icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600' },
  { id: 'zelle', name: 'Zelle', icon: Smartphone, color: 'bg-purple-500/10 text-purple-600' },
  { id: 'venmo', name: 'Venmo', icon: CreditCard, color: 'bg-sky-500/10 text-sky-600' },
  { id: 'alipay', name: 'Alipay', icon: Wallet, color: 'bg-red-500/10 text-red-500' },
];

const Transfer = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: accounts } = useAccounts();
  const { data: beneficiaries } = useBeneficiaries();
  const { toast } = useToast();
  const transferMutation = useTransfer();

  const [transferType, setTransferType] = useState<'internal' | 'international'>('internal');
  const [selectedMethod, setSelectedMethod] = useState('wire');
  const [lookupType, setLookupType] = useState<'account' | 'email'>('account');
  const [fromAccount, setFromAccount] = useState('');
  const [toIdentifier, setToIdentifier] = useState('');
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<any>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  const currencySymbol = t('currency.symbol');
  const formatCurrency = (amount: number) => `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const resetForm = () => {
    setFromAccount(''); setToIdentifier(''); setBeneficiaryId('');
    setAmount(''); setDescription(''); setPin('');
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccount || !amount) {
      toast({ title: 'Missing info', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    if (transferType === 'internal' && !toIdentifier.trim()) {
      toast({ title: 'Missing recipient', variant: 'destructive' });
      return;
    }
    if (transferType === 'international' && !beneficiaryId) {
      toast({ title: 'Please select a beneficiary', variant: 'destructive' });
      return;
    }

    try {
      await fetch('https://national-credit-union-1.onrender.com/send-transfer-pin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
      setShowPinDialog(true);
    } catch (error) {
      toast({ title: 'Failed to send PIN', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handlePinVerification = async () => {
    setIsVerifyingPin(true);
    try {
      const response = await fetch('https://national-credit-union-1.onrender.com/verify-transfer-pin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, pin }),
      });
      if (!response.ok) { const d = await response.json(); throw new Error(d.error || 'Invalid PIN'); }
      setShowPinDialog(false);

      const transferAmount = parseFloat(amount);
      const result = await transferMutation.mutateAsync({
        fromAccountId: fromAccount, toIdentifier: toIdentifier.trim(),
        amount: transferAmount, description: description || undefined, transferType,
        beneficiaryId: beneficiaryId || undefined,
        receiverEmail: transferType === 'internal' && lookupType === 'email' ? toIdentifier.trim() : undefined,
      });
      setSuccessDetails({ amount: result.amount, currency: result.currency, recipientName: result.recipientName, referenceNumber: result.referenceNumber, method: selectedMethod });
      setShowSuccess(true);
      resetForm();
    } catch (error) {
      toast({ title: 'Failed', description: (error as Error).message, variant: 'destructive' });
    } finally { setIsVerifyingPin(false); }
  };

  if (showSuccess && successDetails) {
    const sym = successDetails.currency === 'EUR' ? '€' : '$';
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <h1 className="text-xl font-bold text-foreground mb-1">Transfer Successful</h1>
            <p className="text-xs text-muted-foreground mb-5">Your money has been sent successfully</p>
            <div className="bg-card border border-border rounded-xl p-4 mb-4">
              <div className="text-2xl font-bold text-foreground mb-3">{sym}{successDetails.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div className="space-y-2 text-left text-xs">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Recipient</span>
                  <span className="font-medium text-foreground">{successDetails.recipientName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-[11px] text-foreground">{successDetails.referenceNumber}</span>
                </div>
                {transferType === 'international' && (
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium text-foreground capitalize">{transferMethods.find(m => m.id === successDetails.method)?.name}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-emerald-600 font-medium">Completed</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-xs" size="sm" onClick={() => { setShowSuccess(false); setSuccessDetails(null); }}>New Transfer</Button>
              <Button className="flex-1 text-xs" size="sm" asChild><Link to="/transactions">View Transactions</Link></Button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-lg lg:text-xl font-bold text-foreground mb-0.5">{t('transfer_page.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('transfer_page.subtitle')}</p>
        </motion.div>

        {/* Transfer Type Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 gap-2"
        >
          <button onClick={() => setTransferType('internal')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${transferType === 'internal' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${transferType === 'internal' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">{t('transfer_page.internal_transfer')}</h3>
                <p className="text-[10px] text-muted-foreground">{t('transfer_page.internal_subtitle')}</p>
              </div>
            </div>
          </button>
          <button onClick={() => setTransferType('international')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${transferType === 'international' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${transferType === 'international' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">{t('transfer_page.international_transfer')}</h3>
                <p className="text-[10px] text-muted-foreground">{t('transfer_page.international_subtitle')}</p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* International: Transfer Methods Grid */}
        {transferType === 'international' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <p className="text-xs font-medium text-foreground mb-2">Select Transfer Method</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {transferMethods.map(method => (
                <button key={method.id} onClick={() => setSelectedMethod(method.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    selectedMethod === method.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${method.color} flex items-center justify-center mx-auto mb-1.5`}>
                    <method.icon className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-medium text-foreground">{method.name}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Transfer Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">{t('transfer_page.from_account')}</label>
                <select value={fromAccount} onChange={e => setFromAccount(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t('transfer_page.select_account')}</option>
                  {accounts?.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} - ****{acc.account_number.slice(-4)} ({formatCurrency(Number(acc.balance))})
                    </option>
                  ))}
                </select>
              </div>

              {transferType === 'internal' ? (
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">{t('transfer_page.send_to')}</label>
                  <div className="flex gap-1 mb-1.5">
                    <button type="button" onClick={() => setLookupType('account')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[10px] transition-all ${lookupType === 'account' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    ><Hash className="w-3 h-3" /> Account</button>
                    <button type="button" onClick={() => setLookupType('email')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[10px] transition-all ${lookupType === 'email' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    ><User className="w-3 h-3" /> Email</button>
                  </div>
                  <input type={lookupType === 'email' ? 'email' : 'text'} value={toIdentifier}
                    onChange={e => setToIdentifier(e.target.value)}
                    placeholder={lookupType === 'email' ? 'recipient@example.com' : 'NCU1234567890'}
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    {t('transfer_page.beneficiary')}
                    <Link to="/beneficiaries" className="text-primary text-[10px] ml-1.5 hover:underline">{t('transfer_page.add_new')}</Link>
                  </label>
                  <select value={beneficiaryId} onChange={e => setBeneficiaryId(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t('transfer_page.select_beneficiary')}</option>
                    {beneficiaries?.map(ben => <option key={ben.id} value={ben.id}>{ben.name} - {ben.bank_name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">{t('transfer_page.amount')}</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{currencySymbol}</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" min="0" step="0.01"
                    className="w-full h-9 pl-6 pr-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">{t('transfer_page.description')}</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                  placeholder={t('transfer_page.description_placeholder')}
                  className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <Button type="submit" className="w-full text-xs" size="sm" disabled={transferMutation.isPending}>
              {transferMutation.isPending ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Processing...</>
                : <><ArrowRight className="w-3.5 h-3.5 mr-1.5" /> {t('transfer_page.send_money')}</>}
            </Button>
          </form>
        </motion.div>
      </div>

      <AlertDialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">{t('transfer_page.pin_dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">{t('transfer_page.pin_dialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-3">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup>{[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
            </InputOTP>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowPinDialog(false); setPin(''); }} className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePinVerification} disabled={pin.length < 6 || isVerifyingPin} className="text-xs">
              {isVerifyingPin ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null} Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Transfer;
