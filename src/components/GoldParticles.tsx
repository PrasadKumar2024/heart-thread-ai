import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function GoldParticles({ show }: { show: boolean }) {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      size: 3 + Math.random() * 4,
      duration: 1 + Math.random() * 0.5,
    }))
  );

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: '100vh', x: `${p.x}vw` }}
            animate={{ opacity: [0, 0.8, 0], y: '-10vh' }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: '#F5A623',
              boxShadow: '0 0 6px #F5A62380',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
