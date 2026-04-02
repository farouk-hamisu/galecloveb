import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCards, useAccounts } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CreditCard, Snowflake, Play, Settings, MoreHorizontal, Eye, XCircle, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useToggleCardFreeze, useUpdateCardLimit } from '@/hooks/useBankingData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const Cards = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: cards, isLoading } = useCards();
  const { data: accounts } = useAccounts();
  const toggleFreeze = useToggleCardFreeze();
  const updateLimit = useUpdateCardLimit();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [newLimit, setNewLimit] = useState('');
  const [applying, setApplying] = useState(false);

  const currencySymbol = t('currency.symbol');
  const formatCurrency = (amount: number) =>
    `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const handleApplyForCard = async () => {
    if (!accounts || accounts.length === 0 || !user?.id) {
      toast({ title: 'No accounts found', variant: 'destructive' });
      return;
    }

    setApplying(true);
    try {
      const cardNumber = `4${Math.random().toString().slice(2, 17).padEnd(15, '0')}`;
      const cvv = Math.floor(100 + Math.random() * 900).toString();
      const expiryYear = new Date().getFullYear() + 4;
      const expiryMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');

      const { error } = await supabase.from('cards').insert({
        user_id: user.id,
        account_id: accounts[0].id,
        card_number: cardNumber,
        card_type: 'virtual',
        expiry_date: `${expiryMonth}/${expiryYear}`,
        cvv,
        spending_limit: 5000,
        card_status: 'pending',
      });

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast({ title: 'Application Submitted', description: 'Your virtual card application is pending admin approval.' });
    } catch {
      toast({ title: 'Failed to apply', variant: 'destructive' });
    } finally {
      setApplying(false);
    }
  };

  const handleToggleFreeze = async (cardId: string, currentlyFrozen: boolean) => {
    try {
      await toggleFreeze.mutateAsync({ cardId, isFrozen: !currentlyFrozen });
      toast({ title: currentlyFrozen ? 'Card Unfrozen' : 'Card Frozen' });
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  const handleUpdateLimit = async () => {
    const limit = parseFloat(newLimit);
    if (!selectedCard || isNaN(limit) || limit < 0) return;
    try {
      await updateLimit.mutateAsync({ cardId: selectedCard.id, limit });
      toast({ title: 'Spending limit updated' });
      setLimitDialogOpen(false);
      setNewLimit('');
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  const approvedCards = cards?.filter(c => c.card_status === 'approved') || [];
  const pendingCards = cards?.filter(c => c.card_status === 'pending') || [];
  const rejectedCards = cards?.filter(c => c.card_status === 'rejected') || [];
  const hasPending = pendingCards.length > 0;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="text-[10px]"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved': return <Badge className="text-[10px] bg-emerald-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected': return <Badge variant="destructive" className="text-[10px]"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-foreground mb-0.5">{t('cards_page.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('cards_page.subtitle')}</p>
          </div>
          <Button onClick={handleApplyForCard} disabled={applying || hasPending} size="sm">
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            {hasPending ? 'Application Pending' : 'Apply for Virtual Card'}
          </Button>
        </motion.div>

        {/* How to Apply Guide */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="p-4 rounded-xl bg-primary/5 border border-primary/20"
        >
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-4 h-4 text-primary mt-0.5" />
            <h3 className="text-xs font-semibold text-foreground">How to get your Virtual Card</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { step: '1', title: 'Apply', desc: 'Click "Apply for Virtual Card" to submit your request' },
              { step: '2', title: 'Admin Review', desc: 'Our team will review and approve your application' },
              { step: '3', title: 'Start Using', desc: 'Once approved, your card details will appear here' },
            ].map(s => (
              <div key={s.step} className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pending / Rejected Cards */}
        {(pendingCards.length > 0 || rejectedCards.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xs font-semibold text-foreground mb-2">Applications</h2>
            <div className="space-y-2">
              {[...pendingCards, ...rejectedCards].map(card => (
                <div key={card.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Virtual Card Application</p>
                      <p className="text-[10px] text-muted-foreground">•••• {card.card_number.slice(-4)}</p>
                    </div>
                  </div>
                  {statusBadge(card.card_status)}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Approved Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map(i => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : approvedCards.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedCards.map((card, index) => (
                <motion.div key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }} className="space-y-3"
                >
                  <div className={`relative p-5 rounded-xl bg-gradient-to-br ${
                    card.is_frozen ? 'from-gray-400 to-gray-600' : 'from-gray-800 via-gray-900 to-black'
                  } text-primary-foreground overflow-hidden aspect-[1.586/1]`}>
                    {card.is_frozen && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-1.5 py-0.5 bg-primary-foreground/20 rounded text-[10px]">
                        <Snowflake className="w-3 h-3" /> Frozen
                      </div>
                    )}
                    <div className="absolute top-3 left-5"><span className="text-[11px] opacity-75 capitalize">{card.card_type}</span></div>
                    <div className="absolute top-3 right-5"><CreditCard className="w-6 h-6" /></div>
                    <div className="absolute bottom-16 left-5 right-5">
                      <p className="font-mono text-base tracking-wider">{card.card_number.replace(/(.{4})/g, '$1 ').trim()}</p>
                    </div>
                    <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
                      <div>
                        <p className="text-[9px] opacity-75">Expires</p>
                        <p className="font-mono text-xs">{card.expiry_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] opacity-75">CVV</p>
                        <p className="font-mono text-xs">{card.cvv}</p>
                      </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary-foreground/5" />
                  </div>

                  <div className="flex gap-1.5">
                    <Button variant={card.is_frozen ? 'outline' : 'destructive'} size="sm" className="flex-1 text-xs h-8"
                      onClick={() => handleToggleFreeze(card.id, !!card.is_frozen)} disabled={toggleFreeze.isPending}
                    >
                      {card.is_frozen ? <><Play className="w-3 h-3 mr-1" /> Unfreeze</> : <><Snowflake className="w-3 h-3 mr-1" /> Freeze</>}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => { setSelectedCard(card); setLimitDialogOpen(true); }}>
                          <Settings className="w-3.5 h-3.5 mr-2" /> Set Limit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="p-3 rounded-lg bg-card border border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-muted-foreground">Spending Limit</span>
                      <span className="text-xs font-semibold text-foreground">{formatCurrency(Number(card.spending_limit))}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 rounded-xl bg-card border border-border">
              <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-1">No Approved Cards</h3>
              <p className="text-xs text-muted-foreground mb-3">Apply for a virtual card to get started.</p>
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-sm">Set Spending Limit</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">Current: {selectedCard && formatCurrency(Number(selectedCard.spending_limit))}</p>
            <Input type="number" placeholder="New limit" value={newLimit} onChange={e => setNewLimit(e.target.value)} className="text-xs" />
            <Button className="w-full text-xs" onClick={handleUpdateLimit} disabled={updateLimit.isPending}>
              {updateLimit.isPending ? 'Updating...' : 'Update Limit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Cards;
