import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCards, useAccounts, useCreateCard, useToggleCardFreeze } from '@/hooks/useBankingData';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Snowflake, Play, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Cards = () => {
  const { t } = useTranslation();
  const { data: cards, isLoading } = useCards();
  const { data: accounts } = useAccounts();
  const createCard = useCreateCard();
  const toggleFreeze = useToggleCardFreeze();
  const { toast } = useToast();

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

    try {
      await createCard.mutateAsync({ accountId: accounts[0].id });
      toast({
        title: t('cards_page.toasts.create_success_title'),
        description: t('cards_page.toasts.create_success_desc'),
      });
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
          <Button 
            variant="hero" 
            onClick={handleCreateCard}
            disabled={createCard.isPending}
          >
            {createCard.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('cards_page.creating')}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {t('cards_page.create_new_card')}
              </>
            )}
          </Button>
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
                    <Button variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
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
              <Button variant="hero" onClick={handleCreateCard} disabled={createCard.isPending}>
                {createCard.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('cards_page.creating')}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('cards_page.create_first_card')}
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Cards;
