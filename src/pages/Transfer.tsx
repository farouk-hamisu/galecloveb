import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts } from '@/hooks/useBankingData';
import { useTransfer } from '@/hooks/useTransfer';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Globe, ArrowRight, Loader2, CheckCircle2, User, Wallet, Bitcoin, DollarSign, Smartphone, CreditCard, Building2, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';

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

// Dynamic fields per method for international transfers
const methodFields: Record<string, { label: string; placeholder: string; key: string; type?: string }[]> = {
  wire: [
    { label: 'Recipient Email', placeholder: 'recipient@example.com', key: 'recipientEmail', type: 'email' },
    { label: 'Bank Name', placeholder: 'e.g. Chase Bank', key: 'bankName' },
    { label: 'SWIFT / BIC Code', placeholder: 'e.g. CHASUS33', key: 'swiftCode' },
    { label: 'Account / IBAN Number', placeholder: 'e.g. US12345678901234', key: 'accountNumber' },
    { label: 'Routing Number', placeholder: 'e.g. 021000021', key: 'routingNumber' },
  ],
  crypto: [
    { label: 'Recipient Email', placeholder: 'recipient@example.com', key: 'recipientEmail', type: 'email' },
    { label: 'Wallet Address', placeholder: 'e.g. 0x1234...abcd', key: 'walletAddress' },
    { label: 'Network', placeholder: 'e.g. Ethereum, Bitcoin, USDT-TRC20', key: 'network' },
  ],
  paypal: [
    { label: 'Recipient PayPal Email', placeholder: 'recipient@example.com', key: 'recipientEmail', type: 'email' },
  ],
  wise: [
    { label: 'Recipient Email', placeholder: 'recipient@example.com', key: 'recipientEmail', type: 'email' },
    { label: 'Full Name (as on Wise)', placeholder: 'John Doe', key: 'fullName' },
  ],
  cashapp: [
    { label: 'Recipient Email', placeholder: 'recipient@example.com', key: 'recipientEmail', type: 'email' },
    { label: 'Cash Tag', placeholder: '$username', key: 'cashTag' },
  ],
  zelle: [
    { label: 'Recipient Email or Phone', placeholder: 'recipient@example.com or +1...', key: 'recipientEmail' },
  ],
  venmo: [
    { label: 'Recipient Email', placeholder: 'recipient@example.com', key: 'recipientEmail', type: 'email' },
    { label: 'Venmo Username', placeholder: '@username', key: 'venmoUsername' },
  ],
  alipay: [
    { label: 'Recipient Email', placeholder: 'recipient@example.com', key: 'recipientEmail', type: 'email' },
    { label: 'Alipay ID', placeholder: 'Alipay account ID', key: 'alipayId' },
  ],
};

type PageStep = 'loading' | 'verify' | 'form' | 'processing' | 'success';

const Transfer = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: accounts } = useAccounts();
  const { toast } = useToast();
  const transferMutation = useTransfer();

  const [step, setStep] = useState<PageStep>('loading');
  const [transferType, setTransferType] = useState<'internal' | 'international'>('internal');
  const [selectedMethod, setSelectedMethod] = useState('wire');
  const [fromAccount, setFromAccount] = useState('');
  const [toIdentifier, setToIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [successDetails, setSuccessDetails] = useState<any>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Dynamic fields state for international
  const [methodFieldValues, setMethodFieldValues] = useState<Record<string, string>>({});

  const currencySymbol = t('currency.symbol');
  const formatCurrency = (amt: number) => `${currencySymbol}${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  // Loading → Verify flow on mount
  useEffect(() => {
    const timer = setTimeout(() => setStep('verify'), 2000);
    return () => clearTimeout(timer);
  }, []);

  const resetForm = () => {
    setFromAccount(''); setToIdentifier('');
    setAmount(''); setDescription(''); setPin('');
    setMethodFieldValues({});
  };

  const handleVerified = () => {
    setStep('form');
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccount || !amount) {
      toast({ title: 'Missing info', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' }); return;
    }
    if (transferType === 'internal' && !toIdentifier.trim()) {
      toast({ title: 'Missing recipient', description: 'Please enter the recipient email.', variant: 'destructive' }); return;
    }
    if (transferType === 'international') {
      const requiredFields = methodFields[selectedMethod] || [];
      for (const f of requiredFields) {
        if (!methodFieldValues[f.key]?.trim()) {
          toast({ title: 'Missing info', description: `Please fill in ${f.label}.`, variant: 'destructive' }); return;
        }
      }
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

      // Start processing animation
      setStep('processing');
      setProcessingProgress(0);

      const transferAmount = parseFloat(amount);

      // Simulate processing steps
      const progressSteps = [15, 35, 55, 75, 90];
      for (const p of progressSteps) {
        await new Promise(r => setTimeout(r, 600));
        setProcessingProgress(p);
      }

      // For internal transfers, use the RPC
      if (transferType === 'internal') {
        const result = await transferMutation.mutateAsync({
          fromAccountId: fromAccount, toIdentifier: toIdentifier.trim(),
          amount: transferAmount, description: description || undefined, transferType: 'internal',
          receiverEmail: toIdentifier.trim(),
        });
        setProcessingProgress(100);
        await new Promise(r => setTimeout(r, 400));
        setSuccessDetails({ amount: result.amount, currency: result.currency, recipientName: result.recipientName, referenceNumber: result.referenceNumber, method: 'internal' });
      } else {
        // International: use the international_transfer RPC via a dummy beneficiary flow
        // Since beneficiaries are removed, we process as a direct deduction
        const result = await transferMutation.mutateAsync({
          fromAccountId: fromAccount, toIdentifier: methodFieldValues.recipientEmail || 'international@transfer.com',
          amount: transferAmount, description: description || `${transferMethods.find(m => m.id === selectedMethod)?.name} transfer`,
          transferType: 'internal', // Use internal RPC for balance deduction
          receiverEmail: methodFieldValues.recipientEmail || '',
        });
        setProcessingProgress(100);
        await new Promise(r => setTimeout(r, 400));
        setSuccessDetails({ amount: result.amount, currency: result.currency, recipientName: result.recipientName || methodFieldValues.fullName || methodFieldValues.recipientEmail || 'Recipient', referenceNumber: result.referenceNumber, method: selectedMethod });
      }

      setStep('success');
      resetForm();
    } catch (error) {
      setStep('form');
      toast({ title: 'Transfer Failed', description: (error as Error).message, variant: 'destructive' });
    } finally { setIsVerifyingPin(false); }
  };

  // ─── LOADING SCREEN ─────────────────────────────────
  if (step === 'loading') {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full mx-auto"
            />
            <div>
              <h2 className="text-sm font-semibold text-foreground">{t('transfer_page.loading_title')}</h2>
              <p className="text-xs text-muted-foreground mt-1">{t('transfer_page.loading_subtitle')}</p>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── VERIFICATION SCREEN ─────────────────────────────
  if (step === 'verify') {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full text-center space-y-5">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t('transfer_page.verify_title')}</h2>
              <p className="text-xs text-muted-foreground mt-1">{t('transfer_page.verify_subtitle')}</p>
            </div>
            <Button onClick={handleVerified} className="w-full text-xs" size="sm">
              {t('transfer_page.continue_to_transfer')} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── PROCESSING SCREEN ─────────────────────────────
  if (step === 'processing') {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm w-full text-center space-y-5">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">{t('transfer_page.processing_title')}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {processingProgress < 40 ? t('transfer_page.processing_verifying') :
                  processingProgress < 70 ? t('transfer_page.processing_deducting') :
                    processingProgress < 95 ? t('transfer_page.processing_finalizing') : t('transfer_page.processing_almost')}
              </p>
            </div>
            <Progress value={processingProgress} className="w-full h-2" />
            <p className="text-[10px] text-muted-foreground">{t('transfer_page.processing_warning')}</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── SUCCESS SCREEN ─────────────────────────────
  if (step === 'success' && successDetails) {
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
            <h1 className="text-xl font-bold text-foreground mb-1">{t('transfer_page.success_title')}</h1>
            <p className="text-xs text-muted-foreground mb-5">{t('transfer_page.success_subtitle')}</p>
            <div className="bg-card border border-border rounded-xl p-4 mb-4">
              <div className="text-2xl font-bold text-foreground mb-3">{sym}{successDetails.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div className="space-y-2 text-left text-xs">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">{t('transfer_page.recipient')}</span>
                  <span className="font-medium text-foreground">{successDetails.recipientName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">{t('transfer_page.reference')}</span>
                  <span className="font-mono text-[11px] text-foreground">{successDetails.referenceNumber}</span>
                </div>
                {successDetails.method !== 'internal' && (
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">{t('transfer_page.method')}</span>
                    <span className="font-medium text-foreground capitalize">{transferMethods.find(m => m.id === successDetails.method)?.name || successDetails.method}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{t('transfer_page.status')}</span>
                  <span className="text-emerald-600 font-medium">{t('transfer_page.completed')}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-xs" size="sm" onClick={() => { setStep('form'); setSuccessDetails(null); }}>{t('transfer_page.new_transfer')}</Button>
              <Button className="flex-1 text-xs" size="sm" asChild><Link to="/transactions">{t('transfer_page.view_transactions')}</Link></Button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── TRANSFER FORM ─────────────────────────────
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
                <button key={method.id} onClick={() => { setSelectedMethod(method.id); setMethodFieldValues({}); }}
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
            {/* From Account */}
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

            {/* Internal: Email only */}
            {transferType === 'internal' && (
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  <Mail className="w-3 h-3 inline mr-1" /> Recipient Email
                </label>
                <input type="email" value={toIdentifier} onChange={e => setToIdentifier(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {/* International: Dynamic fields */}
            <AnimatePresence mode="wait">
              {transferType === 'international' && (
                <motion.div key={selectedMethod} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {(methodFields[selectedMethod] || []).map(field => (
                    <div key={field.key}>
                      <label className="block text-[11px] font-medium text-foreground mb-1">{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        value={methodFieldValues[field.key] || ''}
                        onChange={e => setMethodFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Amount & Description */}
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
              <ArrowRight className="w-3.5 h-3.5 mr-1.5" /> {t('transfer_page.send_money')}
            </Button>
          </form>
        </motion.div>
      </div>

      {/* PIN Dialog */}
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
