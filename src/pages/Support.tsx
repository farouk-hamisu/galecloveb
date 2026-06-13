import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSupportTickets, useCreateSupportTicket } from '@/hooks/useBankingData';
import { motion } from 'framer-motion';
import { HelpCircle, Plus, MessageSquare, Clock, CheckCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Support = () => {
  const { t } = useTranslation();
  const { data: tickets, isLoading } = useSupportTickets();
  const { settings } = useSiteSettings();
  const createTicket = useCreateSupportTicket();
  const { toast } = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');

  const faqData = [
    {
      question: t('support_page.faq_q1'),
      answer: t('support_page.faq_a1')
    },
    {
      question: t('support_page.faq_q2'),
      answer: t('support_page.faq_a2')
    },
    {
      question: t('support_page.faq_q3'),
      answer: t('support_page.faq_a3')
    },
    {
      question: t('support_page.faq_q4'),
      answer: t('support_page.faq_a4')
    },
    {
      question: t('support_page.faq_q5'),
      answer: t('support_page.faq_a5')
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message) {
      toast({
        title: t('support_page.missing_info_title'),
        description: t('support_page.missing_info_subtitle'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTicket.mutateAsync({ subject, message, priority });
      toast({
        title: t('support_page.ticket_submitted_title'),
        description: t('support_page.ticket_submitted_subtitle'),
      });
      setShowForm(false);
      setSubject('');
      setMessage('');
      setPriority('medium');
    } catch (error) {
      toast({
        title: t('support_page.error_title'),
        description: t('support_page.error_subtitle'),
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-green-500/10 text-green-500';
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500';
      case 'high':
        return 'bg-orange-500/10 text-orange-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-foreground mb-1">{t('support_page.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('support_page.subtitle')}</p>
          </div>
          <Button variant="hero" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('support_page.new_ticket')}
          </Button>
        </motion.div>
        
        {/* Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <a href={`mailto:${settings?.support_email || 'support@galecloveb.com'}`} className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer">
            <Mail className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">{t('support_page.email_support')}</h3>
            <p className="text-sm text-muted-foreground">{settings?.support_email || 'support@galecloveb.com'}</p>
          </a>
          <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer">
            <HelpCircle className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">{t('support_page.faq')}</h3>
            <p className="text-sm text-muted-foreground">{t('support_page.faq_subtitle')}</p>
          </div>
        </motion.div>


        {/* FAQ Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border"
        >
            <h2 className="text-sm font-semibold text-foreground mb-4">{t('support_page.faq_title')}</h2>
            <Accordion type="single" collapsible className="w-full">
                {faqData.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{item.question}</AccordionTrigger>
                        <AccordionContent>
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </motion.div>


        {/* New Ticket Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <h2 className="text-sm font-semibold text-foreground mb-6">{t('support_page.submit_ticket_title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('support_page.subject')}</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t('support_page.subject_placeholder')}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t('support_page.priority')}</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">{t('support_page.low')}</option>
                    <option value="medium">{t('support_page.medium')}</option>
                    <option value="high">{t('support_page.high')}</option>
                    <option value="urgent">{t('support_page.urgent')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t('support_page.message')}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('support_page.message_placeholder')}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('support_page.cancel')}</Button>
                <Button type="submit" variant="hero" disabled={createTicket.isPending}>
                  {createTicket.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('support_page.submitting')}
                    </>
                  ) : (
                    t('support_page.submit_ticket')
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Existing Tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">{t('support_page.your_tickets')}</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : tickets && tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(ticket.status)}
                      <div>
                        <h3 className="font-medium text-foreground">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{ticket.message}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">{t('support_page.view')}</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl bg-card border border-border">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-foreground mb-2">{t('support_page.no_tickets_title')}</h3>
              <p className="text-muted-foreground mb-4">{t('support_page.no_tickets_subtitle')}</p>
              <Button variant="hero" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('support_page.submit_first_ticket')}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Support;
