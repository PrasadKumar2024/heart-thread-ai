import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Brain, BookOpen, Mail, Zap, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';
import solinLogo from '@/assets/solin-logo.png';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaywallModal({ open, onClose }: PaywallModalProps) {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null);

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in first');
        return;
      }

      const { data, error } = await supabase.functions.invoke('dodo-checkout', {
        body: { plan },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Could not create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const benefits = [
    { icon: Sparkles, text: 'Unlimited conversations every day' },
    { icon: Brain, text: 'Full memory — companions remember everything' },
    { icon: BookOpen, text: 'Full conversation history forever' },
    { icon: Mail, text: 'Weekly personal reflection every Sunday' },
    { icon: Zap, text: 'Unlimited Spark — endless discoveries' },
    { icon: User, text: 'Create unlimited custom companions' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <img src={solinLogo} alt="SOLIN" className="w-12 h-12 rounded-xl mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-foreground">You've reached your daily limit</h2>
              <p className="text-sm text-muted-foreground mt-1">Upgrade to keep the conversation going</p>
            </div>

            <div className="space-y-2.5 mb-6">
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-foreground/80">
                  <Icon className="h-4 w-4 shrink-0 text-[#FFD700]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Monthly */}
              <button
                onClick={() => handleCheckout('monthly')}
                disabled={!!loading}
                className="flex flex-col items-center rounded-2xl border border-border bg-secondary p-4 transition-all hover:border-[#FFD700]/40 active:scale-[0.97]"
              >
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly</span>
                <span className="text-2xl font-bold text-foreground mt-1">$9.99</span>
                <span className="text-xs text-muted-foreground">/month</span>
                <span className="mt-3 w-full rounded-xl bg-foreground/10 py-2 text-xs font-medium text-foreground">
                  {loading === 'monthly' ? 'Loading…' : 'Start Monthly'}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1.5">Cancel anytime</span>
              </button>

              {/* Yearly */}
              <button
                onClick={() => handleCheckout('yearly')}
                disabled={!!loading}
                className="relative flex flex-col items-center rounded-2xl border-2 border-[#FFD700]/50 bg-[#FFD700]/5 p-4 transition-all hover:border-[#FFD700]/70 active:scale-[0.97]"
              >
                <span className="absolute -top-2.5 rounded-full bg-[#FFD700] px-2.5 py-0.5 text-[10px] font-bold text-background uppercase">
                  🔥 Best Value
                </span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Yearly</span>
                <span className="text-2xl font-bold text-foreground mt-1">$89.99</span>
                <span className="text-xs text-muted-foreground">/year</span>
                <span className="mt-3 w-full rounded-xl bg-[#FFD700] py-2 text-xs font-bold text-background">
                  {loading === 'yearly' ? 'Loading…' : 'Start Yearly'}
                </span>
                <span className="text-[10px] text-[#FFD700] mt-1.5">Save $29.89 — 2 months free</span>
              </button>
            </div>

            <div className="text-center space-y-1">
              <p className="text-[10px] text-muted-foreground">Secure payment by Dodo Payments · Cancel anytime from your profile</p>
              <p className="text-[10px] text-muted-foreground">
                By upgrading you agree to our{' '}
                <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
              </p>
              <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
