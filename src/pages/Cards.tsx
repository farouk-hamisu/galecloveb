import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCards, useAccounts, useCreateCard, useToggleCardFreeze, useUpdateCardLimit } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Snowflake, Play, Settings, Loader2, MoreHorizontal, Eye, ArrowRight, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const Cards = () => {
  const { t } = useTranslation();
  const { data: cards, isLoading } = useCards();
  const { data: accounts } = useAccounts();
  const createCard = useCreateCard();
  const toggleFreeze = useToggleCardFreeze();
  const updateLimit = useUpdateCardLimit();
  const { toast } = useToast();

  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [createCardDialogOpen, setCreateCardDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [newLimit, setNewLimit] = useState('');
  const [newCardPin, setNewCardPin] = useState('');

  const currencySymbol = t('currency.symbol');

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleCreateCard = async () => {
    if (!accounts || accounts.length === 0) {
      toast({
        title: t('cards_page.toasts.no_accounts_title'),
        description: t('cards_page.toasts.no_accounts_desc'),
        variant: 'destructive',
      });
      return;
    }
    
    if (!/^\d{4}$/.test(newCardPin)) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be a 4-digit number.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createCard.mutateAsync({ accountId: accounts[0].id, pin: newCardPin });
      toast({
        title: t('cards_page.toasts.create_success_title'),
        description: t('cards_page.toasts.create_success_desc'),
      });
      setCreateCardDialogOpen(false);
      setNewCardPin('');
    } catch (error) {
      toast({
        title: t('cards_page.toasts.create_error_title'),
        description: t('cards_page.toasts.create_error_desc'),
        variant: 'destructive',
      });
    }
  };

  const handleToggleFreeze = async (cardId: string, currentlyFrozen: boolean) => {
    try {
      await toggleFreeze.mutateAsync({ cardId, isFrozen: !currentlyFrozen });
      toast({
        title: currentlyFrozen ? t('cards_page.toasts.unfreeze_title') : t('cards_page.toasts.freeze_title'),
        description: currentlyFrozen 
          ? t('cards_page.toasts.unfreeze_desc')
          : t('cards_page.toasts.freeze_desc'),
      });
    } catch (error) {
      toast({
        title: t('cards_page.toasts.status_error_title'),
        description: t('cards_page.toasts.status_error_desc'),
        variant: 'destructive',
      });
    }
  };

  const handleUpdateLimit = async () => {
    const limit = parseFloat(newLimit);
    if (!selectedCard || isNaN(limit) || limit < 0) {
      toast({ title: "Invalid limit", variant: "destructive" });
      return;
    }
    try {
      await updateLimit.mutateAsync({ cardId: selectedCard.id, limit });
      toast({ title: "Spending limit updated" });
      setLimitDialogOpen(false);
      setNewLimit('');
    } catch (error) {
      toast({ title: "Failed to update limit", variant: "destructive"});
    }
  };

  const formatCardNumber = (number: string) => {
    return number.replace(/(.{4})/g, '$1 ').trim();
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
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('cards_page.title')}</h1>
            <p className="text-muted-foreground">{t('cards_page.subtitle')}</p>
          </div>
          <Dialog open={createCardDialogOpen} onOpenChange={setCreateCardDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="hero" 
                disabled={createCard.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('cards_page.create_new_card')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Card</DialogTitle>
                <DialogDescription>
                  Set a 4-digit PIN for your new card.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input 
                  type="password"
                  placeholder="4-digit PIN"
                  value={newCardPin}
                  onChange={(e) => setNewCardPin(e.target.value)}
                  maxLength={4}
                />
              </div>
              <Button onClick={handleCreateCard} disabled={createCard.isPending}>
                {createCard.isPending ? 'Creating...' : 'Create Card'}
              </Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-56 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : cards && cards.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="space-y-4"
                >
                  {/* Card Visual */}
                  <div 
                    className={`relative p-6 rounded-2xl bg-gradient-to-br ${
                      card.is_frozen 
                        ? 'from-gray-400 to-gray-600' 
                        : 'from-gray-800 via-gray-900 to-black'
                    } text-white overflow-hidden aspect-[1.586/1]`}
                  >
                    {card.is_frozen && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-white/20 rounded text-xs">
                        <Snowflake className="w-3 h-3" />
                        {t('cards_page.frozen')}
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-6">
                      <span className="text-sm opacity-75 capitalize">{t('cards_page.card_type', { type: card.card_type })}</span>
                    </div>
                    
                    <div className="absolute top-4 right-6">
                      <CreditCard className="w-8 h-8" />
                    </div>

                    <div className="absolute bottom-20 left-6 right-6">
                      <p className="font-mono text-xl tracking-wider">
                        {formatCardNumber(card.card_number)}
                      </p>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div>
                        <p className="text-xs opacity-75">{t('cards_page.expires')}</p>
                        <p className="font-mono">{card.expiry_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-75">{t('cards_page.cvv')}</p>
                        <p className="font-mono">{card.cvv}</p>
                      </div>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/5" />
                  </div>

                  {/* Card Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant={card.is_frozen ? 'outline' : 'destructive'}
                      className="flex-1"
                      onClick={() => handleToggleFreeze(card.id, card.is_frozen)}
                      disabled={toggleFreeze.isPending}
                    >
                      {card.is_frozen ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          {t('cards_page.unfreeze')}
                        </>
                      ) : (
                        <>
                          <Snowflake className="w-4 h-4 mr-2" />
                          {t('cards_page.freeze')}
                        </>
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => { setSelectedCard(card); setLimitDialogOpen(true); }}>
                          <Settings className="w-4 h-4 mr-2" />
                          Set Spending Limit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setSelectedCard(card); setPinDialogOpen(true); }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View PIN
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { setSelectedCard(card); setCancelDialogOpen(true); }} className="text-red-500">
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Card
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('cards_page.spending_limit')}</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(Number(card.spending_limit))}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-card border border-border">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('cards_page.no_cards')}</h3>
              <p className="text-muted-foreground mb-4">{t('cards_page.no_cards_subtitle')}</p>
              <Button variant="hero" onClick={() => setCreateCardDialogOpen(true)} disabled={createCard.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                {t('cards_page.create_first_card')}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Dialogs for card settings */}
      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Spending Limit</DialogTitle>
            <DialogDescription>
              Current Limit: {selectedCard && formatCurrency(Number(selectedCard.spending_limit))}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input 
              type="number"
              placeholder="New limit"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
            />
          </div>
          <Button onClick={handleUpdateLimit} disabled={updateLimit.isPending}>
            {updateLimit.isPending ? 'Updating...' : 'Update Limit'}
          </Button>
        </DialogContent>
      </Dialog>
      
      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Card PIN</DialogTitle>
          </DialogHeader>
          <div className="text-center text-4xl font-bold tracking-widest py-8">
            {selectedCard?.pin}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action will permanently cancel your card. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>No, keep it</Button>
            <Button variant="destructive" onClick={() => {
              // Placeholder for cancel logic
              toast({ title: "Card cancelled (placeholder)"});
              setCancelDialogOpen(false);
            }}>
              Yes, Cancel Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
};

export default Cards;

