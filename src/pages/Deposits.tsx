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

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    toast({
      title: 'Copied!',
      description: 'Wallet address copied to clipboard.',
    });
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleDeposit = async () => {
    if (!selectedAccount || !depositAmount) {
      toast({
        title: 'Missing Information',
        description: 'Please select an account and enter an amount.',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid deposit amount.',
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
        title: 'Deposit Failed',
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

            <h1 className="text-3xl font-bold text-foreground mb-2">Deposit Initiated!</h1>
            <p className="text-muted-foreground mb-8">Your deposit request has been processed.</p>

            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <div className="text-4xl font-bold text-foreground mb-4">
                {formatCurrency(successDetails.amount)}
              </div>
              <div className="space-y-3 text-left">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-sm text-foreground">{successDetails.reference}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-green-500 font-medium">Completed</span>
                </div>
              </div>
            </div>

            <Button variant="hero" onClick={() => setShowSuccess(false)}>
              Make Another Deposit
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
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">Deposit Funds</h1>
            <p className="text-muted-foreground">Add money to your accounts using various methods.</p>
          </div>
          
          <Dialog open={newAccountDialogOpen} onOpenChange={setNewAccountDialogOpen}>
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
                    <p className="text-sm text-muted-foreground">For everyday transactions</p>
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
                    <h3 className="font-semibold text-foreground">Savings Account</h3>
                    <p className="text-sm text-muted-foreground">Earn 4.5% APY</p>
                  </div>
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Deposit Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Select Deposit Method</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Account Number */}
            <button
              onClick={() => { setDepositMethod('Account Number'); setIdentifierType('account'); }}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                depositMethod === 'Account Number'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Hash className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Account Number</h3>
              <p className="text-sm text-muted-foreground">Transfer via account number</p>
            </button>

            {/* Email Address */}
            <button
              onClick={() => { setDepositMethod('Email Address'); setIdentifierType('email'); }}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                depositMethod === 'Email Address'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Email Address</h3>
              <p className="text-sm text-muted-foreground">Receive via email</p>
            </button>

            {/* Bank Card */}
            <button
              onClick={() => setDepositMethod('Bank Card')}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                depositMethod === 'Bank Card'
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Bank Card</h3>
              <p className="text-sm text-muted-foreground">Debit or credit card</p>
            </button>

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
              <h3 className="font-semibold text-foreground mb-1">Cryptocurrency</h3>
              <p className="text-sm text-muted-foreground">BTC, ETH, USDT, SOL</p>
            </button>
          </div>
        </motion.div>

        {/* Deposit Form based on method */}
        {depositMethod && depositMethod !== 'Cryptocurrency' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-6">Deposit via {depositMethod}</h3>
            
            <div className="space-y-6">
              {/* Target Account */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Deposit to Account
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
                >
                  <option value="">Select account</option>
                  {allAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} - ****{acc.account_number.slice(-4)} ({formatCurrency(Number(acc.balance))})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Bank Card specific fields */}
              {depositMethod === 'Bank Card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setDepositMethod(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1"
                  onClick={handleDeposit}
                  disabled={depositMutation.isPending}
                >
                  {depositMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Complete Deposit'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Cryptocurrency Deposit */}
        {depositMethod === 'Cryptocurrency' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-6">Select Cryptocurrency</h3>
              
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
                    <h3 className="text-lg font-semibold text-foreground">
                      {cryptoWallets[selectedCrypto].name} Deposit
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {cryptoWallets[selectedCrypto].network}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Deposit Address
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
                        onClick={() => copyToClipboard(cryptoWallets[selectedCrypto].address)}
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
                      <strong>Important:</strong> Only send {cryptoWallets[selectedCrypto].symbol} to this address on the {cryptoWallets[selectedCrypto].network}. 
                      Deposits require {cryptoWallets[selectedCrypto].confirmations} to be credited.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Credit to Account
                    </label>
                    <select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground"
                    >
                      <option value="">Select account</option>
                      {allAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} - ****{acc.account_number.slice(-4)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    Once we detect your deposit, it will be automatically converted and credited to your account.
                  </p>
                </div>
              </motion.div>
            )}

            <Button variant="outline" onClick={() => { setDepositMethod(null); setSelectedCrypto(null); }}>
              Back to Methods
            </Button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Deposits;