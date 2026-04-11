import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getCompanion } from '@/lib/companions';

export function ModeTransition() {
  const { activeMode } = useAppStore();
  const [showWash, setShowWash] = useState(false);
  const [prevMode, setPrevMode] = useState(activeMode);
  const companion = getCompanion(activeMode);

  useEffect(() => {
    if (activeMode !== prevMode) {
      setShowWash(true);
      setPrevMode(activeMode);
      const t = setTimeout(() => setShowWash(false), 400);
      return () => clearTimeout(t);
    }
  }, [activeMode, prevMode]);

  return (
    <AnimatePresence>
      {showWash && (
        <motion.div
          key={activeMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="pointer-events-none fixed inset-0 z-40"
          style={{ backgroundColor: companion.colorHex }}
        />
      )}
    </AnimatePresence>
  );
}
