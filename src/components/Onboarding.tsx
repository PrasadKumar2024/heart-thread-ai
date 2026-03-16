import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { companions, type CompanionMode } from '@/lib/companions';

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const { setProfile, setActiveMode, createConversation } = useAppStore();

  const handleComplete = (companionId: CompanionMode) => {
    setProfile({ name, goal, onboarded: true });
    setActiveMode(companionId);
    createConversation(companionId);
  };

  const pageVariants = {
    enter: { opacity: 0, y: 30 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="font-display text-4xl italic tracking-tight text-foreground mb-2">solin</h1>
                <p className="text-muted-foreground text-sm">someone who actually gets you</p>
              </div>
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">what should I call you?</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="your name"
                  autoFocus
                  className="w-full rounded-2xl bg-card px-5 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 text-lg"
                />
              </div>
              <button
                onClick={() => name.trim() && setStep(1)}
                disabled={!name.trim()}
                className="w-full rounded-2xl bg-primary py-4 text-primary-foreground font-medium transition-all duration-300 disabled:opacity-30"
              >
                continue
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="font-display text-3xl italic tracking-tight text-foreground mb-2">
                  hey {name} 👋
                </h2>
                <p className="text-muted-foreground text-sm">let's start somewhere real</p>
              </div>
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">what's one thing on your mind lately?</label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="anything at all..."
                  rows={3}
                  autoFocus
                  className="w-full resize-none rounded-2xl bg-card px-5 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={() => goal.trim() && setStep(2)}
                disabled={!goal.trim()}
                className="w-full rounded-2xl bg-primary py-4 text-primary-foreground font-medium transition-all duration-300 disabled:opacity-30"
              >
                continue
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="font-display text-3xl italic tracking-tight text-foreground mb-2">
                  who do you want to talk to?
                </h2>
                <p className="text-muted-foreground text-sm">you can always switch later</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {companions.map((c) => (
                  <motion.button
                    key={c.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleComplete(c.id)}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border p-5 transition-all duration-300 hover:border-transparent"
                    style={{
                      '--hover-bg': `${c.colorHex}15`,
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      (e.currentTarget.style.backgroundColor = `${c.colorHex}15`);
                      (e.currentTarget.style.borderColor = `${c.colorHex}40`);
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget.style.backgroundColor = 'transparent');
                      (e.currentTarget.style.borderColor = 'hsl(var(--border))');
                    }}
                  >
                    <span className="text-3xl">{c.emoji}</span>
                    <span className="font-medium text-foreground text-sm">{c.name}</span>
                    <span className="text-xs text-muted-foreground text-center">{c.subtitle}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: step === s ? 24 : 8,
                backgroundColor: step === s ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
