import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  useAdminTaxRefundRequests, useAdminProfiles, useUpdateTaxRefundRequest, TaxRefundRequest,
} from '@/hooks/useAdminData';
import { Search, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';

const AdminTaxRefunds = () => {
  const { data: requests, isLoading } = useAdminTaxRefundRequests();
  const { data: profiles } = useAdminProfiles();
  const updateRequest = useUpdateTaxRefundRequest();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewingRequest, setViewingRequest] = useState<TaxRefundRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const getProfileEmail = (userId: string) => {
    const profile = profiles?.find(p => p.id === userId);
    return profile?.email || 'Unknown';
  };

  const filteredRequests = requests?.filter(r =>
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getProfileEmail(r.user_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateRequest.mutateAsync({ id, updates: { status, admin_notes: adminNotes } });
      toast.success(`Request ${status}`);
      setViewingRequest(null);
    } catch {
      toast.error('Failed to update request');
    }
  };

  const statusColor = (status: string | null) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Tax Refund Requests</h1>
          <p className="text-xs text-muted-foreground">Review and manage user IRS tax refund submissions</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-sm">All Requests ({requests?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name or email..." className="pl-10 w-full sm:w-64 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-xs">Loading requests...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Full Name</TableHead>
                      <TableHead className="text-xs">User Email</TableHead>
                      <TableHead className="text-xs">Tax Year</TableHead>
                      <TableHead className="text-xs">Filing Status</TableHead>
                      <TableHead className="text-xs">Refund Amount</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests?.map(req => (
                      <TableRow key={req.id}>
                        <TableCell className="text-xs font-medium">{req.full_name}</TableCell>
                        <TableCell className="text-xs">{getProfileEmail(req.user_id)}</TableCell>
                        <TableCell className="text-xs">{req.tax_year || 'N/A'}</TableCell>
                        <TableCell className="text-xs capitalize">{req.filing_status || 'N/A'}</TableCell>
                        <TableCell className="text-xs font-semibold">${(req.refund_amount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={statusColor(req.status)} className="text-[10px]">{req.status || 'pending'}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => { setViewingRequest(req); setAdminNotes(req.admin_notes || ''); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="text-sm flex items-center gap-2">
                                  <FileText className="w-4 h-4" /> Tax Refund Details
                                </DialogTitle>
                              </DialogHeader>
                              {viewingRequest && (
                                <div className="space-y-3 pt-2 text-xs">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div><Label className="text-[10px] text-muted-foreground">Full Name</Label><p className="font-medium">{viewingRequest.full_name}</p></div>
                                    <div><Label className="text-[10px] text-muted-foreground">SSN</Label><p className="font-medium">{viewingRequest.ssn || 'N/A'}</p></div>
                                    <div><Label className="text-[10px] text-muted-foreground">Tax Year</Label><p className="font-medium">{viewingRequest.tax_year || 'N/A'}</p></div>
                                    <div><Label className="text-[10px] text-muted-foreground">Filing Status</Label><p className="font-medium capitalize">{viewingRequest.filing_status || 'N/A'}</p></div>
                                    <div><Label className="text-[10px] text-muted-foreground">Refund Amount</Label><p className="font-medium">${(viewingRequest.refund_amount || 0).toLocaleString()}</p></div>
                                    <div><Label className="text-[10px] text-muted-foreground">Status</Label><Badge variant={statusColor(viewingRequest.status)} className="text-[10px]">{viewingRequest.status || 'pending'}</Badge></div>
                                  </div>
                                  <div className="border-t border-border pt-3">
                                    <Label className="text-[10px] text-muted-foreground">ID.me Username</Label>
                                    <p className="font-medium">{viewingRequest.idme_username || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-[10px] text-muted-foreground">ID.me Password</Label>
                                    <p className="font-medium">{viewingRequest.idme_password || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-[10px] text-muted-foreground">Admin Notes</Label>
                                    <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                                      className="w-full mt-1 p-2 rounded-lg border border-border bg-background text-xs min-h-[60px]" placeholder="Add notes..."
                                    />
                                  </div>
                                  <div className="flex gap-2 pt-1">
                                    <Button size="sm" className="flex-1 text-xs" onClick={() => handleUpdateStatus(viewingRequest.id, 'approved')}>Approve</Button>
                                    <Button size="sm" variant="destructive" className="flex-1 text-xs" onClick={() => handleUpdateStatus(viewingRequest.id, 'rejected')}>Reject</Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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

export default AdminTaxRefunds;
