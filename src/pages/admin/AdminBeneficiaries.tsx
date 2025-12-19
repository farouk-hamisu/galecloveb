import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useAdminBeneficiaries,
  useAdminProfiles,
  useDeleteBeneficiary,
} from '@/hooks/useAdminData';
import { Search, Trash2, UserCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const AdminBeneficiaries = () => {
  const { t } = useTranslation();
  const { data: beneficiaries, isLoading } = useAdminBeneficiaries();
  const { data: profiles } = useAdminProfiles();
  const deleteBeneficiary = useDeleteBeneficiary();
  
  const [searchTerm, setSearchTerm] = useState('');

  const getProfileEmail = (userId: string) => {
    const profile = profiles?.find(p => p.id === userId);
    return profile?.email || 'Unknown';
  };

  const filteredBeneficiaries = beneficiaries?.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.account_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin_beneficiaries_page.delete_beneficiary_confirm'))) return;
    
    try {
      await deleteBeneficiary.mutateAsync(id);
      toast.success(t('admin_beneficiaries_page.beneficiary_deleted'));
    } catch (error) {
      toast.error(t('admin_beneficiaries_page.beneficiary_delete_failed'));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin_beneficiaries_page.title')}</h1>
          <p className="text-muted-foreground">{t('admin_beneficiaries_page.subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t('admin_beneficiaries_page.all_beneficiaries')} ({beneficiaries?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin_beneficiaries_page.search_beneficiaries')}
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">{t('admin_beneficiaries_page.loading_beneficiaries')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin_beneficiaries_page.beneficiary')}</TableHead>
                      <TableHead>{t('admin_beneficiaries_page.bank')}</TableHead>
                      <TableHead>{t('admin_beneficiaries_page.account')}</TableHead>
                      <TableHead>{t('admin_beneficiaries_page.owner')}</TableHead>
                      <TableHead>{t('admin_beneficiaries_page.country')}</TableHead>
                      <TableHead>{t('admin_beneficiaries_page.favorite')}</TableHead>
                      <TableHead>{t('admin_beneficiaries_page.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBeneficiaries?.map((beneficiary) => (
                      <TableRow key={beneficiary.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                              <UserCheck className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="font-medium">{beneficiary.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{beneficiary.bank_name}</TableCell>
                        <TableCell className="font-mono text-sm">{beneficiary.account_number}</TableCell>
                        <TableCell>{getProfileEmail(beneficiary.user_id)}</TableCell>
                        <TableCell>{beneficiary.country || '-'}</TableCell>
                        <TableCell>
                          {beneficiary.is_favorite ? (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(beneficiary.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

export default AdminBeneficiaries;
