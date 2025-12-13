import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts, useTransactions } from '@/hooks/useBankingData';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  generateTransactionReceipt,
  generateMonthlyStatement,
  downloadPDF,
  exportTransactionsCSV,
} from '@/lib/pdfGenerator';

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
        title: 'Unable to generate statement',
        description: 'No account data available.',
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
        type: tx.type.includes('in') || tx.type === 'deposit' || tx.type === 'credit' ? 'credit' : 'debit',
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
    downloadPDF(doc, `NCUBank_Statement_${periodDate}.pdf`);

    toast({
      title: 'Statement downloaded',
      description: `Your ${periodName} statement has been downloaded.`,
    });
  };

  const handleDownloadReceipt = (tx: any) => {
    const receipt = {
      id: tx.id,
      type: tx.type.includes('in') || tx.type === 'deposit' || tx.type === 'credit' ? 'credit' : 'debit',
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
    downloadPDF(doc, `NCUBank_Receipt_${tx.reference_number}.pdf`);

    toast({
      title: 'Receipt downloaded',
      description: 'Your transaction receipt has been downloaded.',
    });
  };

  const handleExportCSV = () => {
    if (!transactions?.length) {
      toast({
        title: 'No transactions',
        description: 'There are no transactions to export.',
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

    exportTransactionsCSV(csvData, `NCUBank_Transactions_${new Date().toISOString().split('T')[0]}.csv`);

    toast({
      title: 'Export complete',
      description: 'Your transactions have been exported to CSV.',
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
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">Statements & Receipts</h1>
            <p className="text-muted-foreground">Download your monthly bank statements and transaction receipts.</p>
          </div>
          <Button variant="outline" onClick={handleExportCSV}>
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
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
            <label className="block text-sm font-medium text-foreground mb-2">Select Account</label>
            <select className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">All Accounts</option>
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
              Custom Date Range
            </Button>
          </div>
        </motion.div>

        {/* Monthly Statements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Statements</h2>
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
                        {statement.transactions} transactions • {formatCurrency(statement.amount)} total
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadStatement(statement.date, statement.period)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-xl bg-card border border-border">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No statements available yet. Make some transactions first!</p>
            </div>
          )}
        </motion.div>

        {/* Recent Transaction Receipts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Transaction Receipts</h2>
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
                      {new Date(tx.created_at!).toLocaleDateString()} • Ref: {tx.reference_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${
                      tx.type.includes('in') || tx.type === 'deposit' || tx.type === 'credit'
                        ? 'text-green-500' 
                        : 'text-foreground'
                    }`}>
                      {tx.type.includes('in') || tx.type === 'deposit' || tx.type === 'credit' ? '+' : '-'}
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
              <p className="text-muted-foreground">No transaction receipts available yet.</p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Statements;
