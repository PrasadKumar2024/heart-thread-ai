import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, MessageCircle, Brain, Calendar } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const benefits = [
  { icon: MessageCircle, label: 'Unlimited messages' },
  { icon: Brain, label: 'Full memory — always remembers you' },
  { icon: Sparkles, label: 'Custom companion with memory' },
  { icon: Calendar, label: 'Weekly emotional summary' },
];

export function UpgradeModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl italic text-foreground text-center">
            You've reached your daily limit
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground text-center">
          Free accounts get 20 messages per day. Upgrade to keep talking.
        </p>
        <div className="space-y-3 my-4">
          {benefits.map((b) => (
            <div key={b.label} className="flex items-center gap-3 text-sm text-foreground">
              <b.icon className="h-4 w-4 text-primary shrink-0" />
              <span>{b.label}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            // TODO: Dodo Payments integration
            onOpenChange(false);
          }}
          className="w-full rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Upgrade — $9.99/month
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Come back tomorrow for 20 more free messages
        </p>
      </DialogContent>
    </Dialog>
  );
}
