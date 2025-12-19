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
  useAdminCards,
  useAdminProfiles,
  useUpdateCard,
  useDeleteCard,
  AdminCard,
} from '@/hooks/useAdminData';
import { Search, Edit, Trash2, CreditCard as CardIcon, Snowflake, Power } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const AdminCards = () => {
  const { t } = useTranslation();
  const { data: cards, isLoading } = useAdminCards();
  const { data: profiles } = useAdminProfiles();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCard, setEditingCard] = useState<AdminCard | null>(null);
  const [cardForm, setCardForm] = useState({
    spending_limit: '',
    is_active: true,
    is_frozen: false,
  });

  const getProfileEmail = (userId: string) => {
    const profile = profiles?.find(p => p.id === userId);
    return profile?.email || 'Unknown';
  };

  const filteredCards = cards?.filter(c => 
    c.card_number.includes(searchTerm) ||
    getProfileEmail(c.user_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const maskCardNumber = (number: string) => {
    return `**** **** **** ${number.slice(-4)}`;
  };

  const handleEdit = (card: AdminCard) => {
    setEditingCard(card);
    setCardForm({
      spending_limit: String(card.spending_limit || 5000),
      is_active: card.is_active ?? true,
      is_frozen: card.is_frozen ?? false,
    });
  };

  const handleUpdate = async () => {
    if (!editingCard) return;
    
    try {
      await updateCard.mutateAsync({
        id: editingCard.id,
        updates: {
          spending_limit: parseFloat(cardForm.spending_limit),
          is_active: cardForm.is_active,
          is_frozen: cardForm.is_frozen,
        },
      });
      toast.success(t('admin_cards_page.card_updated'));
      setEditingCard(null);
    } catch (error) {
      toast.error(t('admin_cards_page.card_update_failed'));
    }
  };

  const handleToggleFreeze = async (card: AdminCard) => {
    try {
      await updateCard.mutateAsync({
        id: card.id,
        updates: { is_frozen: !card.is_frozen },
      });
      toast.success(card.is_frozen ? t('admin_cards_page.card_unfrozen') : t('admin_cards_page.card_frozen'));
    } catch (error) {
      toast.error(t('admin_cards_page.card_update_failed'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin_cards_page.delete_card_confirm'))) return;
    
    try {
      await deleteCard.mutateAsync(id);
      toast.success(t('admin_cards_page.card_deleted'));
    } catch (error) {
      toast.error(t('admin_cards_page.card_delete_failed'));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin_cards_page.title')}</h1>
          <p className="text-muted-foreground">{t('admin_cards_page.subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t('admin_cards_page.all_cards')} ({cards?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin_cards_page.search_cards')}
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">{t('admin_cards_page.loading_cards')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin_cards_page.card')}</TableHead>
                      <TableHead>{t('admin_cards_page.type')}</TableHead>
                      <TableHead>{t('admin_cards_page.owner')}</TableHead>
                      <TableHead>{t('admin_cards_page.expiry')}</TableHead>
                      <TableHead>{t('admin_cards_page.limit')}</TableHead>
                      <TableHead>{t('admin_cards_page.status')}</TableHead>
                      <TableHead>{t('admin_cards_page.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCards?.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                              <CardIcon className="w-4 h-4 text-orange-500" />
                            </div>
                            <span className="font-mono text-sm">{maskCardNumber(card.card_number)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{card.card_type}</TableCell>
                        <TableCell>{getProfileEmail(card.user_id)}</TableCell>
                        <TableCell>{card.expiry_date}</TableCell>
                        <TableCell>${(card.spending_limit || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {card.is_frozen && (
                              <Badge variant="secondary">
                                <Snowflake className="w-3 h-3 mr-1" />
                                {t('admin_cards_page.frozen')}
                              </Badge>
                            )}
                            {!card.is_active && (
                              <Badge variant="destructive">{t('admin_cards_page.inactive')}</Badge>
                            )}
                            {card.is_active && !card.is_frozen && (
                              <Badge variant="default">{t('admin_cards_page.active')}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog open={editingCard?.id === card.id} onOpenChange={(open) => !open && setEditingCard(null)}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEdit(card)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t('admin_cards_page.edit_card')}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label>{t('admin_cards_page.card_number')}</Label>
                                    <Input value={maskCardNumber(editingCard?.card_number || '')} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{t('admin_cards_page.spending_limit')}</Label>
                                    <Input
                                      type="number"
                                      value={cardForm.spending_limit}
                                      onChange={(e) => setCardForm({ ...cardForm, spending_limit: e.target.value })}
                                    />
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={cardForm.is_active}
                                        onChange={(e) => setCardForm({ ...cardForm, is_active: e.target.checked })}
                                      />
                                      {t('admin_cards_page.active')}
                                    </label>
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={cardForm.is_frozen}
                                        onChange={(e) => setCardForm({ ...cardForm, is_frozen: e.target.checked })}
                                      />
                                      {t('admin_cards_page.frozen')}
                                    </label>
                                  </div>
                                  <Button className="w-full" onClick={handleUpdate}>
                                    {t('admin_cards_page.save_changes')}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleToggleFreeze(card)}
                              title={card.is_frozen ? t('admin_cards_page.unfreeze') : t('admin_cards_page.freeze')}
                            >
                              <Snowflake className={`w-4 h-4 ${card.is_frozen ? 'text-blue-500' : 'text-muted-foreground'}`} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(card.id)}
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

export default AdminCards;
