import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAccounts, useTransactions } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Statements = () => {
  const { t } = useTranslation();
  const { data: accounts } = useAccounts();
  const { data: transactions } = useTransactions();
  
  const currencySymbol = t('currency.symbol');

  // Generate sample statement periods
  const statementPeriods = [
    { id: 1, period: 'December 2024', date: '2024-12-01', transactions: 45, amount: 12500 },
    { id: 2, period: 'November 2024', date: '2024-11-01', transactions: 52, amount: 15200 },
    { id: 3, period: 'October 2024', date: '2024-10-01', transactions: 38, amount: 9800 },
    { id: 4, period: 'September 2024', date: '2024-09-01', transactions: 41, amount: 11300 },
    { id: 5, period: 'August 2024', date: '2024-08-01', transactions: 35, amount: 8700 },
    { id: 6, period: 'July 2024', date: '2024-07-01', transactions: 48, amount: 14100 },
  ];

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleDownload = (period: string) => {
    // In production, this would generate and download a PDF
    console.log(`Downloading statement for ${period}`);
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
                  onClick={() => handleDownload(statement.period)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </motion.div>
            ))}
          </div>
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
                      {new Date(tx.created_at).toLocaleDateString()} • Ref: {tx.reference_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${
                      tx.type.includes('in') || tx.type === 'deposit' 
                        ? 'text-green-500' 
                        : 'text-foreground'
                    }`}>
                      {tx.type.includes('in') || tx.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(Number(tx.amount))}
                    </span>
                    <Button variant="ghost" size="sm">
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
