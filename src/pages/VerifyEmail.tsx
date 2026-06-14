import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Mail, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';


const VerifyEmail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signIn } = useAuth();

 

  const email = location.state?.email;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
const RESEND_COOLDOWN = 60; // seconds

const [resendTimer, setResendTimer] = useState<number>(() => {
  const saved = localStorage.getItem(`resend_timer_${email}`);
  return saved ? Number(saved) : 0;
});

const [resending, setResending] = useState(false);
 

useEffect(() => {
  if (resendTimer <= 0) {
    localStorage.removeItem(`resend_timer_${email}`);
    return;
  }

  localStorage.setItem(`resend_timer_${email}`, resendTimer.toString());

  const interval = setInterval(() => {
    setResendTimer((t) => t - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [resendTimer, email]);



  if (!email) {
    navigate('/signup');
    return null;
  }
const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  if (otp.length !== 6) return;

  setLoading(true);

  const res = await fetch("https://galecloveb.onrender.com/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  setLoading(false);

  const data = await res.json();

  if (!res.ok) {
    toast({
      title: t('verify_email_page.verification_failed'),
      description: data.error || t('verify_email_page.invalid_code'),
      variant: "destructive",
    });
    return;
  }

  // ✅ CUSTOM AUTH SESSION (NOT SUPABASE)
  localStorage.setItem("auth_token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  toast({
    title: t('verify_email_page.email_verified'),
    description: t('verify_email_page.welcome'),
  });

  navigate("/dashboard");
};
const handleResend = async () => {
  if (resendTimer > 0 || resending) return;

  try {
    setResending(true);

    const res = await fetch("https://galecloveb.onrender.com/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      throw new Error("Failed to resend code");
    }

    toast({
      title: t('verify_email_page.code_resent'),
      description: t('verify_email_page.check_inbox'),
    });

    setResendTimer(RESEND_COOLDOWN);
  } catch (err) {
    toast({
      title: t('verify_email_page.resend_failed'),
      description: t('verify_email_page.try_again_later'),
      variant: "destructive",
    });
  } finally {
    setResending(false);
  }
};

  

  
  return (
    <div className="min-h-screen bg-hero">
      <Navbar />
      <main className="pt-24 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full px-4"
        >
          <div className="bg-card rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl mx-auto flex items-center justify-center mb-4">
                <Mail className="text-primary-foreground w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('verify_email_page.title')}</h1>
              <p className="text-muted-foreground text-sm">
                {t('verify_email_page.subtitle')}
              </p>
              <p className="font-medium text-foreground mt-1">{email}</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full h-14 text-center text-2xl tracking-widest rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary"
                placeholder="••••••"
              />

              <Button variant="hero" size="lg" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('verify_email_page.verifying')}
                  </>
                ) : (
                  t('verify_email_page.confirm_code')
                )}
              </Button>
            </form>
<p className="mt-6 text-center text-sm text-muted-foreground">
  {t('verify_email_page.no_code')}{' '}
  <button
    disabled={resendTimer > 0 || resending}
    onClick={handleResend}
    className={`font-medium ${
      resendTimer > 0
        ? 'text-muted-foreground cursor-not-allowed'
        : 'text-primary hover:underline'
    }`}
  >
    {resendTimer > 0
      ? t('verify_email_page.resend_in', { resendTimer })
      : resending
      ? t('verify_email_page.resending')
      : t('verify_email_page.resend')}
  </button>
</p>
            

      </div>
        </motion.div>
      </main>
    </div>
  );
};

export default VerifyEmail;

