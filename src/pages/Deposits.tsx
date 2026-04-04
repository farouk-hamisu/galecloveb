import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts } from '@/hooks/useBankingData';
import { useDeposit, useCreateAccount } from '@/hooks/useTransfer';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  CreditCard, 
  Building2, 
  Mail, 
  Hash,
  Bitcoin,
  Copy,
  CheckCircle2,
  Loader2,
  Plus,
  PiggyBank
} from 'lucide-react';
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

// Crypto icons as simple components
const CryptoIcon = ({ type }: { type: string }) => {
  const icons: Record<string, { bg: string; text: string; label: string }> = {
    btc: { bg: 'bg-orange-500', text: 'text-white', label: '₿' },
    eth: { bg: 'bg-blue-500', text: 'text-white', label: 'Ξ' },
    usdt: { bg: 'bg-green-500', text: 'text-white', label: '₮' },
    sol: { bg: 'bg-purple-500', text: 'text-white', label: '◎' },
  };
  
  const icon = icons[type] || icons.btc;
  
  return (
    <div className={`w-10 h-10 rounded-full ${icon.bg} ${icon.text} flex items-center justify-center font-bold text-lg`}>
      {icon.label}
    </div>
  );
};

// Placeholder crypto wallet addresses
const cryptoWallets = {
  btc: {
    name: 'Bitcoin',
    symbol: 'BTC',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    network: 'Bitcoin Network',
    confirmations: '3 confirmations'
  },
  eth: {
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5aB2e',
    network: 'Ethereum Mainnet',
    confirmations: '12 confirmations'
  },
  usdt: {
    name: 'Tether',
    symbol: 'USDT',
    address: 'TVDGpx4xNZDZ8z5VLgK1vL7ub3b4gVFFzT',
    network: 'Tron Network (TRC20)',
    confirmations: '20 confirmations'
  },
  sol: {
    name: 'Solana',
    symbol: 'SOL',
    address: '7EYnhQoR9YL8wMJu5i6d5FPAqX4a9CKBrFAyM7x2Y1wz',
    network: 'Solana Network',
    confirmations: '32 confirmations'
  }
};

const Deposits = () => {
  const { t } = useTranslation();
  const { data: accounts, isLoading } = useAccounts();
  const { user } = useAuth();
  const depositMutation = useDeposit();
  const createAccountMutation = useCreateAccount();
  const { toast } = useToast();
  
  const [depositMethod, setDepositMethod] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<'account' | 'email'>('account');
  const [selectedCrypto, setSelectedCrypto] = useState<keyof typeof cryptoWallets | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [newAccountDialogOpen, setNewAccountDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{ amount: number; reference: string } | null>(null);

  const currencySymbol = t('currency.symbol');
  
  const checkingAccounts = accounts?.filter(acc => acc.account_type === 'checking') || [];
  const savingsAccounts = accounts?.filter(acc => acc.account_type === 'savings') || [];
  const allAccounts = [...checkingAccounts, ...savingsAccounts];
  const primaryAccount = allAccounts.length > 0 ? allAccounts[0] : null;


  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${field} copied to clipboard.`,
    });
  };

  const handleDeposit = async () => {
    if (!selectedAccount || !depositAmount) {
      toast({
        title: t('deposits_page.missing_info'),
        description: t('deposits_page.missing_info_desc'),
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t('deposits_page.invalid_amount'),
        description: t('deposits_page.invalid_amount_desc'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await depositMutation.mutateAsync({
        accountId: selectedAccount,
        amount,
        method: depositMethod || 'Bank Transfer',
        description: `Deposit via ${depositMethod}`
      });
      
      setSuccessDetails({ amount, reference: result.referenceNumber });
      setShowSuccess(true);
      setDepositAmount('');
      setSelectedAccount('');
      setDepositMethod(null);
    } catch (error: unknown) {
      toast({
        title: t('deposits_page.deposit_failed'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleCreateAccount = async (accountType: 'checking' | 'savings') => {
    try {
      await createAccountMutation.mutateAsync({ accountType });
      toast({
        title: 'Account Created!',
        description: `Your new ${accountType} account has been opened.`,
      });
      setNewAccountDialogOpen(false);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  // Success screen
  if (showSuccess && successDetails) {
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

            <h1 className="text-xl font-bold text-foreground mb-2">{t('deposits_page.deposit_initiated')}</h1>
            <p className="text-muted-foreground mb-8">{t('deposits_page.deposit_processed')}</p>

            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <div className="text-4xl font-bold text-foreground mb-4">
                {formatCurrency(successDetails.amount)}
              </div>
              <div className="space-y-3 text-left">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('deposits_page.reference')}</span>
                  <span className="font-mono text-sm text-foreground">{successDetails.reference}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{t('deposits_page.status')}</span>
                  <span className="text-green-500 font-medium">{t('deposits_page.completed')}</span>
                </div>
              </div>
            </div>

            <Button variant="hero" onClick={() => setShowSuccess(false)}>
              {t('deposits_page.make_another_deposit')}
            </Button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-foreground mb-1">{t('deposits_page.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('deposits_page.subtitle')}</p>
          </div>
          
          <Dialog open={newAccountDialogOpen} onOpenChange={setNewAccountDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                {t('deposits_page.open_new_account')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('deposits_page.dialog_title')}</DialogTitle>
                <DialogDescription>
                  {t('deposits_page.dialog_subtitle')}
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
                    <h3 className="font-semibold text-foreground">{t('deposits_page.checking_account')}</h3>
                    <p className="text-sm text-muted-foreground">{t('deposits_page.checking_subtitle')}</p>
                  </div>
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
                    <h3 className="font-semibold text-foreground">{t('deposits_page.savings_account')}</h3>
                    <p className="text-sm text-muted-foreground">{t('deposits_page.savings_subtitle')}</p>
                  </div>
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
        
        {/* Your Deposit Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">{t('deposits_page.your_deposit_info')}</h2>
          <p className="text-muted-foreground mb-6">{t('deposits_page.your_deposit_info_subtitle')}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('deposits_page.account_number')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={primaryAccount ? primaryAccount.account_number : 'Loading...'}
                  readOnly
                  className="flex-1 h-12 px-4 rounded-xl border border-border bg-muted text-foreground font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(primaryAccount?.account_number || '', 'Account Number')}
                  disabled={!primaryAccount}
                  className="h-12 w-12"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('deposits_page.email_address')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={user?.email || 'Loading...'}
                  readOnly
                  className="flex-1 h-12 px-4 rounded-xl border border-border bg-muted text-foreground font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(user?.email || '', 'Email Address')}
                  disabled={!user}
                  className="h-12 w-12"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Deposit Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">{t('deposits_page.choose_deposit_method')}</h2>
          
          <div className="grid sm:grid-cols-1 lg:grid-cols-1 gap-4">
            {/* Cryptocurrency */}
            <button
              onClick={() => setDepositMethod('Cryptocurrency')}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                depositMethod === 'Cryptocurrency'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                <Bitcoin className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t('deposits_page.crypto')}</h3>
              <p className="text-sm text-muted-foreground">{t('deposits_page.crypto_subtitle')}</p>
            </button>
          </div>
        </motion.div>

        {/* Cryptocurrency Deposit */}
        {depositMethod === 'Cryptocurrency' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-6">{t('deposits_page.select_crypto')}</h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.keys(cryptoWallets) as Array<keyof typeof cryptoWallets>).map((crypto) => (
                  <button
                    key={crypto}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedCrypto === crypto
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CryptoIcon type={crypto} />
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{cryptoWallets[crypto].symbol}</p>
                        <p className="text-xs text-muted-foreground">{cryptoWallets[crypto].name}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedCrypto && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center gap-4 mb-6">
                  <CryptoIcon type={selectedCrypto} />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {t('deposits_page.crypto_deposit_title', { cryptoName: cryptoWallets[selectedCrypto].name })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('deposits_page.crypto_deposit_subtitle', { cryptoNetwork: cryptoWallets[selectedCrypto].network })}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('deposits_page.deposit_address')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cryptoWallets[selectedCrypto].address}
                        readOnly
                        className="flex-1 h-12 px-4 rounded-xl border border-border bg-muted text-foreground font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(cryptoWallets[selectedCrypto].address, 'Wallet Address')}
                        className="h-12 w-12"
                      >
                        {copiedAddress ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      <strong>{t('deposits_page.important')}</strong> {t('deposits_page.important_crypto_text', { cryptoSymbol: cryptoWallets[selectedCrypto].symbol, cryptoNetwork: cryptoWallets[selectedCrypto].network, confirmations: cryptoWallets[selectedCrypto].confirmations })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('deposits_page.credit_to_account')}
                    </label>
                    <select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
                    >
                      <option value="">{t('deposits_page.select_account')}</option>
                      {allAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} - ****{acc.account_number.slice(-4)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    {t('deposits_page.crypto_conversion_note')}
                  </p>
                </div>
              </motion.div>
            )}

            <Button variant="outline" onClick={() => { setDepositMethod(null); setSelectedCrypto(null); }}>
              {t('deposits_page.back_to_methods')}
            </Button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Deposits;
