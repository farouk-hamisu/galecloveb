import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTransactions, useAccounts } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Filter,
  Search,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Transactions = () => {
  const { t } = useTranslation();
  const { data: transactions, isLoading } = useTransactions();
  const { data: accounts } = useAccounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const currencySymbol = t('currency.symbol');

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const filteredTransactions = transactions?.filter((tx) => {
    const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.reference_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const getTransactionIcon = (type: string) => {
    if (type.includes('in') || type === 'deposit') {
      return <ArrowDownRight className="w-5 h-5 text-green-500" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-red-500" />;
  };

  const getTransactionColor = (type: string) => {
    return type.includes('in') || type === 'deposit' ? 'text-green-500' : 'text-foreground';
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
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">Transactions</h1>
            <p className="text-muted-foreground">View and manage your transaction history.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="transfer_in">Transfer In</option>
            <option value="transfer_out">Transfer Out</option>
            <option value="card_payment">Card Payments</option>
          </select>
          <Button variant="outline" className="h-11">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card border border-border overflow-hidden"
        >
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reference</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                      <td className="p-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type.includes('in') || tx.type === 'deposit'
                            ? 'bg-green-500/10'
                            : 'bg-red-500/10'
                        }`}>
                          {getTransactionIcon(tx.type)}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{tx.description || tx.type}</p>
                        {tx.recipient_name && (
                          <p className="text-sm text-muted-foreground">{tx.recipient_name}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground font-mono">{tx.reference_number}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">
                          {new Date(tx.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'completed' 
                            ? 'bg-green-500/10 text-green-500'
                            : tx.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-red-500/10 text-red-500'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`font-semibold ${getTransactionColor(tx.type)}`}>
                          {tx.type.includes('in') || tx.type === 'deposit' ? '+' : '-'}
                          {formatCurrency(Number(tx.amount))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Your transaction history will appear here.'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
