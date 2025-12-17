import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useBeneficiaries, useCreateBeneficiary } from '@/hooks/useBankingData';
import { motion } from 'framer-motion';
import { Users, Plus, Star, Globe, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const Beneficiaries = () => {
  const { t } = useTranslation();
  const { data: beneficiaries, isLoading } = useBeneficiaries();
  const createBeneficiary = useCreateBeneficiary();
  const { toast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [iban, setIban] = useState('');
  const [country, setCountry] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !bankName || !accountNumber || !email) {
      toast({
        title: t('beneficiaries_page.toasts.missing_info_title'),
        description: t('beneficiaries_page.toasts.missing_info_desc'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await createBeneficiary.mutateAsync({
        name,
        email,
        bank_name: bankName,
        account_number: accountNumber,
        swift_code: swiftCode || null,
        iban: iban || null,
        country: country || null,
        is_favorite: false,
      });
      
      toast({
        title: t('beneficiaries_page.toasts.success_title'),
        description: t('beneficiaries_page.toasts.success_desc', { name }),
      });
      
      setShowForm(false);
      setName('');
      setEmail('');
      setBankName('');
      setAccountNumber('');
      setSwiftCode('');
      setIban('');
      setCountry('');
    } catch (error) {
      toast({
        title: t('beneficiaries_page.toasts.error_title'),
        description: t('beneficiaries_page.toasts.error_desc'),
        variant: 'destructive',
      });
    }
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
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('beneficiaries_page.title')}</h1>
            <p className="text-muted-foreground">{t('beneficiaries_page.subtitle')}</p>
          </div>
          <Button variant="hero" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('beneficiaries_page.add_beneficiary')}
          </Button>
        </motion.div>

        {/* Add Beneficiary Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">{t('beneficiaries_page.add_new_beneficiary')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('beneficiaries_page.full_name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('beneficiaries_page.full_name_placeholder')}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="beneficiary@example.com"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('beneficiaries_page.bank_name')}</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder={t('beneficiaries_page.bank_name_placeholder')}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('beneficiaries_page.account_number')}</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={t('beneficiaries_page.account_number_placeholder')}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('beneficiaries_page.country')}</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={t('beneficiaries_page.country_placeholder')}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('beneficiaries_page.swift_code')}</label>
                  <input
                    type="text"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    placeholder={t('beneficiaries_page.swift_code_placeholder')}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('beneficiaries_page.iban')}</label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder={t('beneficiaries_page.iban_placeholder')}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('beneficiaries_page.cancel')}</Button>
                <Button type="submit" variant="hero" disabled={createBeneficiary.isPending}>
                  {createBeneficiary.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('beneficiaries_page.adding')}
                    </>
                  ) : (
                    t('beneficiaries_page.add_beneficiary')
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Beneficiaries List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : beneficiaries && beneficiaries.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {beneficiaries.map((ben, index) => (
                <motion.div
                  key={ben.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {ben.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {ben.is_favorite && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                      <button className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{ben.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{ben.bank_name}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t('beneficiaries_page.account_label', { lastFour: ben.account_number.slice(-4) })}
                    </p>
                    {ben.country && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {ben.country}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-card border border-border">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('beneficiaries_page.no_beneficiaries')}</h3>
              <p className="text-muted-foreground mb-4">{t('beneficiaries_page.no_beneficiaries_subtitle')}</p>
              <Button variant="hero" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('beneficiaries_page.add_first_beneficiary')}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Beneficiaries;
