import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms' }) }),
});

const Signup = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});

  const result = signupSchema.safeParse({ firstName, lastName, email, password, agreeTerms });
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      const field = err.path[0] as string;
      fieldErrors[field] = err.message;
    });
    setErrors(fieldErrors);
    return;
  }

  setLoading(true);

  const res = await fetch("https://national-credit-union-1.onrender.com/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });

  setLoading(false);

  if (!res.ok) {
    const data = await res.json();
    toast({
      title: "Signup failed",
      description: data.error || "Something went wrong",
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Verification code sent",
    description: "A 6-digit code has been sent to your email",
  });

  navigate("/verify-email", {
    state: { email },
  });
};

 
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
                <Link to="/" className="inline-flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xl">N</span>
                  </div>
                </Link>
                <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
                <p className="text-muted-foreground">Start your banking journey with NRBank</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full h-12 pl-12 pr-12 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Must be at least 8 characters</p>
                  {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary" 
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-sm text-destructive">{errors.agreeTerms}</p>}

                <Button variant="hero" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Sign in
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

export default Signup;
