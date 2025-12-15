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
        title: t('transfer_page.toasts.missing_info_title'),
        description: t('transfer_page.toasts.missing_info_desc'),
        variant: 'destructive',
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: t('transfer_page.toasts.invalid_amount_title'),
        description: t('transfer_page.toasts.invalid_amount_desc'),
        variant: 'destructive',
      });
      return;
    }

    if (transferType === 'internal' && !toIdentifier.trim()) {
      toast({
        title: t('transfer_page.toasts.missing_info_title'),
        description: t('transfer_page.toasts.missing_recipient_desc'),
        variant: 'destructive',
      });
      return;
    }

    if (transferType === 'international' && !beneficiaryId) {
      toast({
        title: t('transfer_page.toasts.missing_info_title'),
        description: t('transfer_page.toasts.missing_beneficiary_desc'),
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
    } catch (error: unknown) {
      toast({
        title: t('transfer_page.toasts.transfer_failed_title'),
        description: (error as Error).message || t('transfer_page.toasts.transfer_failed_desc'),
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
              {t('transfer_page.success_title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mb-8"
            >
              {t('transfer_page.success_subtitle')}
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
                  <span className="text-muted-foreground">{t('transfer_page.recipient')}</span>
                  <span className="font-medium text-foreground">{successDetails.recipientName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('transfer_page.reference')}</span>
                  <span className="font-mono text-sm text-foreground">{successDetails.referenceNumber}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{t('transfer_page.status')}</span>
                  <span className="text-green-500 font-medium">{t('transfer_page.completed')}</span>
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
                {t('transfer_page.new_transfer')}
              </Button>
              <Button variant="hero" className="flex-1" asChild>
                <Link to="/transactions">{t('transfer_page.view_transactions')}</Link>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('transfer_page.title')}</h1>
          <p className="text-muted-foreground">{t('transfer_page.subtitle')}</p>
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
                <h3 className="font-semibold text-foreground">{t('transfer_page.internal_transfer')}</h3>
                <p className="text-sm text-muted-foreground">{t('transfer_page.internal_subtitle')}</p>
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
                <h3 className="font-semibold text-foreground">{t('transfer_page.international_transfer')}</h3>
                <p className="text-sm text-muted-foreground">{t('transfer_page.international_subtitle')}</p>
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
                <label className="block text-sm font-medium text-foreground mb-2">{t('transfer_page.from_account')}</label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t('transfer_page.select_account')}</option>
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
                    {t('transfer_page.send_to')}
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
                      {t('transfer_page.account_number')}
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
                      {t('transfer_page.email_address')}
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
                    {t('transfer_page.beneficiary')}
                    <Link to="/beneficiaries" className="text-primary text-xs ml-2 hover:underline">
                      {t('transfer_page.add_new')}
                    </Link>
                  </label>
                  <select
                    value={beneficiaryId}
                    onChange={(e) => setBeneficiaryId(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t('transfer_page.select_beneficiary')}</option>
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
                <label className="block text-sm font-medium text-foreground mb-2">{t('transfer_page.amount')}</label>
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
                <label className="block text-sm font-medium text-foreground mb-2">{t('transfer_page.description')}</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('transfer_page.payment_for')}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {transferType === 'international' && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{t('transfer_page.note')}</strong> {t('transfer_page.international_note')}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={resetForm}>{t('transfer_page.cancel')}</Button>
              <Button type="submit" variant="hero" disabled={transferMutation.isPending}>
                {transferMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('transfer_page.processing')}
                  </>
                ) : (
                  <>
                    {t('transfer_page.send_transfer')}
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
