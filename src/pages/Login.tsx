import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, user, isAdmin, loading: authLoading} = useAuth(); 
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const loginSchema = z.object({
    email: z.string().email(t('login_page.invalid_email_error')),
    password: z.string().min(6, t('login_page.password_length_error')),
  });

  /**
   * 🔐 SINGLE source of truth for redirects after login
   */
  useEffect(() => {
  if (authLoading) return;
  if (!user) return;

  if (!user.email_confirmed_at) {
    navigate('/verify-email', { replace: true });
    return;
  }

  navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
}, [user, isAdmin, authLoading, navigate]);
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      setLoading(false);
      toast({
        title: t('login_page.sign_in_failed'),
        description:
          error.message === 'Invalid login credentials'
            ? t('login_page.invalid_credentials')
            : error.message,
        variant: 'destructive',
      });
      return;
    }

    // After signing in, check if user is admin
    const { data: { user: signedInUser } } = await supabase.auth.getUser();
    
    if (signedInUser) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', signedInUser.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleData) {
        // User is admin, sign them out and show error
        await supabase.auth.signOut();
        setLoading(false);
        toast({
          title: "Access Denied",
          description: "Administrators must use the dedicated admin login page.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(false);
    toast({
      title: t('login_page.welcome_toast'),
      description: t('login_page.login_success_toast'),
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Navbar />
      <main className="pt-24 lg:pt-32 pb-20 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-card rounded-3xl p-8 lg:p-10 shadow-xl">
              <div className="text-center mb-8">
               {/* Logo */}
          <Link to="/" className="flex items-center justify-center mb-6">
  <img
    src= "/logo.PNG"
    alt="Galecloveb Logo"
    className="h-24 w-auto object-contain"
  />
</Link>

                                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {t('login_page.welcome_back')}
                </h1>
                <p className="text-muted-foreground">
                  {t('login_page.sign_in_account')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('login_page.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('login_page.enter_email')}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('login_page.password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('login_page.enter_password')}
                      className="w-full h-12 pl-12 pr-12 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('login_page.signing_in')}
                    </>
                  ) : (
                    t('login_page.sign_in')
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  {t('login_page.no_account')}{' '}
                  <Link
                    to="/signup"
                    className="text-primary font-semibold hover:underline"
                  >
                    {t('login_page.sign_up')}
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Login;
