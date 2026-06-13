import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts, useTransactions } from '@/hooks/useBankingData';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { isCreditTransaction } from '@/lib/utils';
import { FileText, Download, Calendar, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  generateTransactionReceipt,
  generateMonthlyStatement,
  downloadPDF,
  exportTransactionsCSV,
} from '@/lib/pdfGenerator';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description?: string;
  reference_number: string;
  status: string;
  created_at: string;
  recipient_name?: string;
  recipient_account?: string;
}

const Statements = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: accounts } = useAccounts();
  const { data: transactions } = useTransactions();
  const { toast } = useToast();
  
  const currencySymbol = t('currency.symbol');
  const currencyCode = t('currency.code');

  // Generate statement periods from actual transactions
  const getStatementPeriods = () => {
    if (!transactions?.length) return [];
    
    const periods: { [key: string]: { transactions: number; amount: number } } = {};
    
    transactions.forEach((tx) => {
      const date = new Date(tx.created_at!);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!periods[key]) {
        periods[key] = { transactions: 0, amount: 0 };
      }
      periods[key].transactions++;
      periods[key].amount += Number(tx.amount);
    });

    return Object.entries(periods)
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const date = new Date(Number(year), Number(month) - 1, 1);
        return {
          id: key,
          period: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          date: key,
          transactions: data.transactions,
          amount: data.amount,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  };

  const statementPeriods = getStatementPeriods();

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleDownloadStatement = (periodDate: string, periodName: string) => {
    if (!accounts?.length || !transactions?.length || !user) {
      toast({
        title: t('statements_page.toasts.unable_to_generate_title'),
        description: t('statements_page.toasts.unable_to_generate_desc'),
        variant: 'destructive',
      });
      return;
    }

    const account = accounts[0];
    const [year, month] = periodDate.split('-');
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    const periodTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.created_at!);
      return txDate >= startDate && txDate <= endDate;
    });

    const statementData = {
      accountNumber: account.account_number,
      accountType: account.account_type,
      currency: currencyCode,
      balance: Number(account.balance),
      periodStart: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      periodEnd: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      userName: user?.email || 'Account Holder',
      transactions: periodTransactions.map((tx) => ({
        id: tx.id,
        type: isCreditTransaction(tx.type) ? 'credit' : 'debit',
        amount: Number(tx.amount),
        currency: currencyCode,
        description: tx.description || undefined,
        recipientName: tx.recipient_name || undefined,
        recipientAccount: tx.recipient_account || undefined,
        referenceNumber: tx.reference_number,
        status: tx.status || 'completed',
        date: tx.created_at!,
      })),
    };

    const doc = generateMonthlyStatement(statementData);
    downloadPDF(doc, `NRBank_Statement_${periodDate}.pdf`);

    toast({
      title: t('statements_page.toasts.download_success_title'),
      description: t('statements_page.toasts.download_success_desc', { period: periodName }),
    });
  };

  const handleDownloadReceipt = (tx: Transaction) => {
    const receipt = {
      id: tx.id,
      type: isCreditTransaction(tx.type) ? 'credit' : 'debit',
      amount: Number(tx.amount),
      currency: currencyCode,
      description: tx.description || undefined,
      recipientName: tx.recipient_name || undefined,
      recipientAccount: tx.recipient_account || undefined,
      referenceNumber: tx.reference_number,
      status: tx.status || 'completed',
      date: tx.created_at!,
      accountNumber: accounts?.[0]?.account_number,
    };

    const doc = generateTransactionReceipt(receipt);
    downloadPDF(doc, `NRBank_Receipt_${tx.reference_number}.pdf`);

    toast({
      title: t('statements_page.toasts.receipt_success_title'),
      description: t('statements_page.toasts.receipt_success_desc'),
    });
  };

  const handleExportCSV = () => {
    if (!transactions?.length) {
      toast({
        title: t('statements_page.toasts.no_transactions_title'),
        description: t('statements_page.toasts.no_transactions_desc'),
        variant: 'destructive',
      });
      return;
    }

    const csvData = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      currency: currencyCode,
      description: tx.description || undefined,
      referenceNumber: tx.reference_number,
      status: tx.status || 'completed',
      date: tx.created_at!,
    }));

    exportTransactionsCSV(csvData, `NRBank_Transactions_${new Date().toISOString().split('T')[0]}.csv`);

    toast({
      title: t('statements_page.toasts.export_complete_title'),
      description: t('statements_page.toasts.export_complete_desc'),
    });
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
            <h1 className="text-lg lg:text-xl font-bold text-foreground mb-1">{t('statements_page.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('statements_page.subtitle')}</p>
          </div>
          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="w-4 h-4 mr-2" />
            {t('statements_page.export_csv')}
          </Button>
        </motion.div>

        {/* Account Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">{t('statements_page.select_account')}</label>
            <select className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">{t('statements_page.all_accounts')}</option>
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} - ****{acc.account_number.slice(-4)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="h-11">
              <Calendar className="w-4 h-4 mr-2" />
              {t('statements_page.custom_date_range')}
            </Button>
          </div>
        </motion.div>

        {/* Monthly Statements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">{t('statements_page.monthly_statements')}</h2>
          {statementPeriods.length > 0 ? (
            <div className="space-y-3">
              {statementPeriods.map((statement, index) => (
                <motion.div
                  key={statement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{statement.period}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('statements_page.transactions_total', { count: statement.transactions, amount: formatCurrency(statement.amount) })}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadStatement(statement.date, statement.period)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('statements_page.download_pdf')}
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl bg-card border border-border">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">{t('statements_page.no_statements')}</p>
            </div>
          )}
        </motion.div>

        {/* Recent Transaction Receipts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">{t('statements_page.recent_receipts')}</h2>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
                >
                  <div>
                    <h3 className="font-medium text-foreground">{tx.description || tx.type}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.created_at!).toLocaleDateString()} • {t('statements_page.ref')} {tx.reference_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${
                      isCreditTransaction(tx.type)
                        ? 'text-green-500' 
                        : 'text-foreground'
                    }`}>
                      {isCreditTransaction(tx.type) ? '+' : '-'}
                      {formatCurrency(Number(tx.amount))}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadReceipt(tx)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl bg-card border border-border">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">{t('statements_page.no_receipts')}</p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Statements;
