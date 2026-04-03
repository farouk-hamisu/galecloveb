import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowLeftRight, 
  Users, 
  PiggyBank, 
  TrendingUp, 
  FileText, 
  HelpCircle, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Globe,
  Wallet,
  MailOpen,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, useMarkNotificationAsRead } from '@/hooks/useBankingData';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useQueryClient } from '@tanstack/react-query';


interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const queryClient = useQueryClient();

  const unreadNotificationsCount = notifications?.filter(n => !n.is_read).length || 0;

  const handleSignOut = async () => {
    await signOut();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    navigate('/');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead.mutate(notificationId);
    // Optionally navigate to a specific page based on notification type
  };

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard_nav.dashboard'), path: '/dashboard' },
    { icon: CreditCard, label: t('dashboard_nav.accounts'), path: '/accounts' },
    { icon: ArrowLeftRight, label: t('dashboard_nav.transactions'), path: '/transactions' },
    { icon: ArrowLeftRight, label: t('dashboard_nav.transfer'), path: '/transfer' },
    { icon: Wallet, label: t('dashboard_nav.deposits') || 'Deposits', path: '/deposits' },
    { icon: Users, label: t('dashboard_nav.beneficiaries'), path: '/beneficiaries' },
    { icon: CreditCard, label: t('dashboard_nav.cards'), path: '/cards' },
    { icon: PiggyBank, label: t('dashboard_nav.savings'), path: '/savings' },
    { icon: ArrowLeftRight, label: 'Swap', path: '/swap' },
    { icon: FileText, label: 'Tax Refund', path: '/tax-refund' },
    { icon: FileText, label: t('dashboard_nav.statements'), path: '/statements' },
    { icon: HelpCircle, label: t('dashboard_nav.support'), path: '/support' },
    { icon: Settings, label: t('dashboard_nav.settings'), path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">N</span>
              </div>
              <span className="font-bold text-lg text-foreground">NRBank</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground">{t('dashboard_misc.personal_account')}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              {t('dashboard_misc.sign_out')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder={t('dashboard_misc.search_transactions')}
                className="h-10 w-64 pl-10 pr-4 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
          <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <Globe className="w-4 h-4" />
              {i18n.language.toUpperCase()}
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4">
                  <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                  {unreadNotificationsCount > 0 && (
                    <span className="text-xs text-muted-foreground">{unreadNotificationsCount} unread</span>
                  )}
                </div>
                <Separator />
                <ScrollArea className="h-[280px]">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "flex gap-3 p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors",
                          !notification.is_read && "bg-muted/30"
                        )}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex-shrink-0">
                          {notification.is_read ? (
                            <MailOpen className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Mail className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className={cn("text-sm font-medium", !notification.is_read && "text-foreground")}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};


