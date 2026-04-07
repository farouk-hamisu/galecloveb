import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useAdminTransactions,
  useAdminAccounts,
  useAdminProfiles,
  useCreateAdminTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  AdminTransaction 
} from '@/hooks/useAdminData';
import { Search, Edit, Trash2, Plus, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

const AdminTransactions = () => {
  const { data: transactions, isLoading } = useAdminTransactions();
  const { data: accounts } = useAdminAccounts();
  const { data: profiles } = useAdminProfiles();
  const createTransaction = useCreateAdminTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingTx, setEditingTx] = useState<AdminTransaction | null>(null);
  const [selectedEmail, setSelectedEmail] = useState('');
  
  const [txForm, setTxForm] = useState({
    account_id: '',
    amount: '',
    type: 'credit',
    status: 'completed',
    description: '',
    recipient_name: '',
    recipient_account: '',
    reference_number: '',
    currency: 'USD',
  });

  const generateRef = () => `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const filteredTransactions = transactions?.filter(t => 
    t.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (t.recipient_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!txForm.account_id || !txForm.amount) {
      toast.error('Failed to create transaction. Missing required fields.');
      return;
    }
    
    try {
      await createTransaction.mutateAsync({
        account_id: txForm.account_id,
        amount: parseFloat(txForm.amount),
        type: txForm.type,
        status: txForm.status,
        description: txForm.description || null,
        recipient_name: txForm.recipient_name || null,
        recipient_account: txForm.recipient_account || null,
        reference_number: txForm.reference_number || generateRef(),
        currency: txForm.currency,
      });
      toast.success('Transaction created successfully.');
      setShowCreate(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create transaction.');
    }
  };

  const handleUpdate = async () => {
    if (!editingTx) return;
    
    try {
      await updateTransaction.mutateAsync({
        id: editingTx.id,
        updates: {
          amount: parseFloat(txForm.amount),
          type: txForm.type,
          status: txForm.status,
          description: txForm.description || null,
          recipient_name: txForm.recipient_name || null,
          recipient_account: txForm.recipient_account || null,
        },
      });
      toast.success('Transaction updated successfully.');
      setEditingTx(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update transaction.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await deleteTransaction.mutateAsync(id);
      toast.success('Transaction deleted.');
    } catch (error) {
      toast.error('Failed to delete transaction.');
    }
  };

  const resetForm = () => {
    setTxForm({
      account_id: '',
      amount: '',
      type: 'credit',
      status: 'completed',
      description: '',
      recipient_name: '',
      recipient_account: '',
      reference_number: '',
      currency: 'USD',
    });
  };

  const handleEdit = (tx: AdminTransaction) => {
    setEditingTx(tx);
    setTxForm({
      account_id: tx.account_id,
      amount: String(tx.amount),
      type: tx.type,
      status: tx.status || 'completed',
      description: tx.description || '',
      recipient_name: tx.recipient_name || '',
      recipient_account: tx.recipient_account || '',
      reference_number: tx.reference_number,
      currency: tx.currency || 'USD',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground">Manage and monitor all user transactions.</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setShowCreate(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Account</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={txForm.account_id}
                    onChange={(e) => setTxForm({ ...txForm, account_id: e.target.value })}
                  >
                    <option value="">Select Account</option>
                    {accounts?.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_number} - ${acc.balance?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={txForm.amount}
                      onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={txForm.type}
                      onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                    >
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                      <option value="transfer">Transfer</option>
                      <option value="deposit">Deposit</option>
                      <option value="withdrawal">Withdrawal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={txForm.status}
                    onChange={(e) => setTxForm({ ...txForm, status: e.target.value })}
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={txForm.description}
                    onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Recipient Name</Label>
                  <Input
                    value={txForm.recipient_name}
                    onChange={(e) => setTxForm({ ...txForm, recipient_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Recipient Account</Label>
                  <Input
                    value={txForm.recipient_account}
                    onChange={(e) => setTxForm({ ...txForm, recipient_account: e.target.value })}
                  />
                </div>

                <Button className="w-full" onClick={handleCreate}>
                  Create Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* TABLE SECTION */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>All Transactions ({transactions?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading transactions...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredTransactions?.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                              <ArrowLeftRight className="w-4 h-4 text-purple-500" />
                            </div>
                            <span className="font-mono text-xs">{tx.reference_number}</span>
                          </div>
                        </TableCell>

                        <TableCell className="capitalize">{tx.type}</TableCell>

                        <TableCell className={`font-semibold ${
                          tx.type === 'credit' || tx.type === 'deposit'
                            ? 'text-green-500'
                            : ''
                        }`}>
                          {tx.type === 'credit' || tx.type === 'deposit' ? '+' : '-'}
                          ${Math.abs(tx.amount).toLocaleString()}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              tx.status === 'completed'
                                ? 'default'
                                : tx.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>

                        <TableCell>{tx.recipient_name || '-'}</TableCell>

                        <TableCell>
                          {tx.created_at
                            ? new Date(tx.created_at).toLocaleDateString()
                            : '-'}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* EDIT */}
                            <Dialog
                              open={editingTx?.id === tx.id}
                              onOpenChange={(open) => !open && setEditingTx(null)}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(tx)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>

                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Transaction</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4 pt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Amount</Label>
                                      <Input
                                        type="number"
                                        value={txForm.amount}
                                        onChange={(e) =>
                                          setTxForm({ ...txForm, amount: e.target.value })
                                        }
                                      />
                                    </div>

                                    <div>
                                      <Label>Type</Label>
                                      <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                        value={txForm.type}
                                        onChange={(e) =>
                                          setTxForm({ ...txForm, type: e.target.value })
                                        }
                                      >
                                        <option value="credit">Credit</option>
                                        <option value="debit">Debit</option>
                                        <option value="transfer">Transfer</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Status</Label>
                                    <select
                                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                      value={txForm.status}
                                      onChange={(e) =>
                                        setTxForm({ ...txForm, status: e.target.value })
                                      }
                                    >
                                      <option value="completed">Completed</option>
                                      <option value="pending">Pending</option>
                                      <option value="failed">Failed</option>
                                    </select>
                                  </div>

                                  <div>
                                    <Label>Description</Label>
                                    <Input
                                      value={txForm.description}
                                      onChange={(e) =>
                                        setTxForm({ ...txForm, description: e.target.value })
                                      }
                                    />
                                  </div>

                                  <Button className="w-full" onClick={handleUpdate}>
                                    Save Changes
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* DELETE */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(tx.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
export default AdminTransactions;

