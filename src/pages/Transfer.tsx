import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts, useBeneficiaries } from '@/hooks/useBankingData';
import { useTransfer } from '@/hooks/useTransfer';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, Globe, ArrowRight, Loader2, CheckCircle2, User, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';

const Transfer = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
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

  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  
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
    setPin('');
  };
  
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAccount || !amount) {
      toast({ title: t('transfer_page.toasts.missing_info_title'), description: t('transfer_page.toasts.missing_info_desc'), variant: 'destructive' });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({ title: t('transfer_page.toasts.invalid_amount_title'), description: t('transfer_page.toasts.invalid_amount_desc'), variant: 'destructive' });
      return;
    }

    if (transferType === 'internal' && !toIdentifier.trim()) {
      toast({ title: t('transfer_page.toasts.missing_info_title'), description: t('transfer_page.toasts.missing_recipient_desc'), variant: 'destructive' });
      return;
    }

    if (transferType === 'international' && !beneficiaryId) {
      toast({ title: t('transfer_page.toasts.missing_info_title'), description: t('transfer_page.toasts.missing_beneficiary_desc'), variant: 'destructive' });
      return;
    }

    try {
      await fetch('https://national-credit-union-1.onrender.com/send-transfer-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
      setShowPinDialog(true);
    } catch (error) {
      toast({ title: t('transfer_page.toasts.pin_send_failed_title'), description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handlePinVerification = async () => {
    setIsVerifyingPin(true);
    try {
      const response = await fetch('https://national-credit-union-1.onrender.com/verify-transfer-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, pin }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('transfer_page.toasts.invalid_pin_desc'));
      }

      setShowPinDialog(false);
      
      const transferAmount = parseFloat(amount);
      const result = await transferMutation.mutateAsync({
        fromAccountId: fromAccount,
        toIdentifier: toIdentifier.trim(),
        amount: transferAmount,
        description: description || undefined,
        transferType,
        beneficiaryId: beneficiaryId || undefined,
        receiverEmail: transferType === 'internal' && lookupType === 'email' ? toIdentifier.trim() : undefined,
      });

      setSuccessDetails({
        amount: result.amount,
        currency: result.currency,
        recipientName: result.recipientName,
        referenceNumber: result.referenceNumber
      });
      setShowSuccess(true);
      resetForm();

    } catch (error) {
      toast({ title: t('transfer_page.toasts.pin_verify_failed_title'), description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsVerifyingPin(false);
    }
  };
  
  const handleNewTransfer = () => {
    setShowSuccess(false);
    setSuccessDetails(null);
  };

  if (showSuccess && successDetails) {
    const currSymbol = successDetails.currency === 'EUR' ? '€' : '$';
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{t('transfer_page.success_title')}</h1>
            <p className="text-sm text-muted-foreground mb-6">{t('transfer_page.success_subtitle')}</p>
            <div className="bg-card border border-border rounded-xl p-5 mb-5">
              <div className="text-3xl font-bold text-foreground mb-3">
                {currSymbol}{successDetails.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="space-y-2 text-left text-sm">
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">{t('transfer_page.recipient')}</span>
                  <span className="font-medium text-foreground">{successDetails.recipientName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">{t('transfer_page.reference')}</span>
                  <span className="font-mono text-xs text-foreground">{successDetails.referenceNumber}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">{t('transfer_page.status')}</span>
                  <span className="text-emerald-600 font-medium">{t('transfer_page.completed')}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 text-sm" onClick={handleNewTransfer}>{t('transfer_page.new_transfer')}</Button>
              <Button className="flex-1 text-sm" asChild><Link to="/transactions">{t('transfer_page.view_transactions')}</Link></Button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-0.5">{t('transfer_page.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('transfer_page.subtitle')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 gap-3"
        >
          <button onClick={() => setTransferType('internal')}
            className={`p-5 rounded-xl border-2 transition-all text-left ${
              transferType === 'internal' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                transferType === 'internal' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{t('transfer_page.internal_transfer')}</h3>
                <p className="text-xs text-muted-foreground">{t('transfer_page.internal_subtitle')}</p>
              </div>
            </div>
          </button>

          <button onClick={() => setTransferType('international')}
            className={`p-5 rounded-xl border-2 transition-all text-left ${
              transferType === 'international' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                transferType === 'international' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{t('transfer_page.international_transfer')}</h3>
                <p className="text-xs text-muted-foreground">{t('transfer_page.international_subtitle')}</p>
              </div>
            </div>
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-xl bg-card border border-border"
        >
          <form onSubmit={handleTransfer} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{t('transfer_page.from_account')}</label>
                <select value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t('transfer_page.select_account')}</option>
                  {accounts?.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} - ****{acc.account_number.slice(-4)} ({formatCurrency(Number(acc.balance))})
                    </option>
                  ))}
                </select>
              </div>

              {transferType === 'internal' ? (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">{t('transfer_page.send_to')}</label>
                  <div className="flex gap-1.5 mb-2">
                    <button type="button" onClick={() => setLookupType('account')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md text-xs transition-all ${
                        lookupType === 'account' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <Hash className="w-3.5 h-3.5" /> {t('transfer_page.account_number')}
                    </button>
                    <button type="button" onClick={() => setLookupType('email')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md text-xs transition-all ${
                        lookupType === 'email' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" /> {t('transfer_page.email_address')}
                    </button>
                  </div>
                  <input type={lookupType === 'email' ? 'email' : 'text'} value={toIdentifier}
                    onChange={(e) => setToIdentifier(e.target.value)}
                    placeholder={lookupType === 'email' ? 'recipient@example.com' : 'NCU1234567890'}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    {t('transfer_page.beneficiary')}
                    <Link to="/beneficiaries" className="text-primary text-xs ml-2 hover:underline">{t('transfer_page.add_new')}</Link>
                  </label>
                  <select value={beneficiaryId} onChange={(e) => setBeneficiaryId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t('transfer_page.select_beneficiary')}</option>
                    {beneficiaries?.map((ben) => (
                      <option key={ben.id} value={ben.id}>{ben.name} - {ben.bank_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{t('transfer_page.amount')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">{currencySymbol}</span>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" min="0" step="0.01"
                    className="w-full h-10 pl-7 pr-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{t('transfer_page.description')}</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('transfer_page.description_placeholder')}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <Button type="submit" className="w-full text-sm" disabled={transferMutation.isPending}>
              {transferMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('transfer_page.processing')}</>
              ) : (
                <><ArrowRight className="w-4 h-4 mr-2" />{t('transfer_page.send_money')}</>
              )}
            </Button>
          </form>
        </motion.div>
      </div>

      <AlertDialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('transfer_page.pin_dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('transfer_page.pin_dialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-4">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup>
                {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowPinDialog(false); setPin(''); }}>{t('transfer_page.pin_dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handlePinVerification} disabled={pin.length < 6 || isVerifyingPin}>
              {isVerifyingPin ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t('transfer_page.pin_dialog.verify')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Transfer;
