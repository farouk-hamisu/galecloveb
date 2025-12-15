import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart, BarChart3, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Investments = () => {
  const { t } = useTranslation();
  const currencySymbol = t('currency.symbol');

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  // Sample investment data (would be fetched from API in production)
  const portfolio = {
    totalValue: 45750.00,
    totalGain: 3250.00,
    percentGain: 7.65,
  };

  const holdings = [
    { name: t('investments_page.sp500_etf'), symbol: 'VOO', value: 15000, change: 2.3, shares: 35 },
    { name: t('investments_page.apple_inc'), symbol: 'AAPL', value: 8500, change: -0.8, shares: 50 },
    { name: t('investments_page.microsoft_corp'), symbol: 'MSFT', value: 12000, change: 1.5, shares: 30 },
    { name: t('investments_page.bitcoin'), symbol: 'BTC', value: 5250, change: 5.2, shares: 0.08 },
    { name: t('investments_page.gold_etf'), symbol: 'GLD', value: 5000, change: 0.3, shares: 25 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{t('investments_page.title')}</h1>
            <p className="text-muted-foreground">{t('investments_page.subtitle')}</p>
          </div>
          <Button variant="hero">
            <TrendingUp className="w-4 h-4 mr-2" />
            {t('investments_page.buy_assets')}
          </Button>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <PieChart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">{t('investments_page.portfolio_value')}</p>
                <p className="text-3xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span className="font-semibold">+{formatCurrency(portfolio.totalGain)}</span>
                <span className="opacity-75">({portfolio.percentGain}%)</span>
              </div>
              <span className="text-sm opacity-75">{t('investments_page.all_time')}</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{t('investments_page.todays_change')}</p>
            <p className="text-2xl font-bold text-green-500">+{formatCurrency(125.50)}</p>
            <p className="text-sm text-green-500">+0.27%</p>
          </div>
        </motion.div>

        {/* Holdings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card border border-border"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">{t('investments_page.your_holdings')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-4 text-sm font-medium text-muted-foreground">{t('investments_page.asset')}</th>
                  <th className="text-left pb-4 text-sm font-medium text-muted-foreground">{t('investments_page.holdings')}</th>
                  <th className="text-right pb-4 text-sm font-medium text-muted-foreground">{t('investments_page.value')}</th>
                  <th className="text-right pb-4 text-sm font-medium text-muted-foreground">{t('investments_page.change')}</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.symbol} className="border-b border-border last:border-b-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-bold text-foreground">{holding.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{holding.name}</p>
                          <p className="text-sm text-muted-foreground">{holding.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-foreground">{holding.shares} {holding.shares === 1 ? t('investments_page.share') : t('investments_page.shares')}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-semibold text-foreground">{formatCurrency(holding.value)}</span>
                    </td>
                    <td className="py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${
                        holding.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {holding.change >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">{holding.change >= 0 ? '+' : ''}{holding.change}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Investment Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-muted/50 border border-border"
        >
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{t('investments_page.disclaimer_title')}</strong> {t('investments_page.disclaimer_text')}
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Investments;
