import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  useEffect(() => {
    if (authLoading) return;
    if (user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
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
        title: "Sign-in failed",
        description:
          error.message === "Invalid login credentials"
            ? "Incorrect email or password"
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

      if (!roleData) {
        // User is NOT an admin, sign them out and show error
        await supabase.auth.signOut();
        setLoading(false);
        toast({
          title: "Access Denied",
          description: "This portal is strictly for administrators.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(false);
    toast({
      title: "Welcome back, Admin!",
      description: "You have successfully signed in to the admin portal.",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Galecloveb</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">
              Back to Site
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 lg:p-14 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                Admin Gateway
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Please enter your administrator credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Admin Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@galecloveb.com"
                    className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-primary focus:ring-0 transition-all outline-none"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-destructive mt-1 ml-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Master Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 pl-12 pr-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-primary focus:ring-0 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-destructive mt-1 ml-1">{errors.password}</p>
                )}
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/25"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Authenticate"
                )}
              </Button>
            </form>
          </div>
          
          <p className="text-center mt-10 text-slate-400 text-sm font-medium">
            &copy; 2026 Galecloveb Systems. Restricted Access.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminLogin;

