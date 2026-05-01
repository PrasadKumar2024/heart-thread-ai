import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import solinLogo from '@/assets/solin-logo.png';

interface Confetto {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [pieces, setPieces] = useState<Confetto[]>([]);

  useEffect(() => {
    const arr: Confetto[] = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 1.5,
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden p-6"
      style={{ backgroundColor: '#0D0D1A' }}
    >
      {/* Gold confetti */}
      <div className="pointer-events-none absolute inset-0">
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            initial={{ y: -40, opacity: 1, rotate: p.rotate }}
            animate={{ y: '110vh', opacity: 0, rotate: p.rotate + 360 }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
            className="absolute block rounded-sm"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              backgroundColor: '#F5A623',
              boxShadow: '0 0 8px rgba(245,166,35,0.6)',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 max-w-sm text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto mb-6"
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            boxShadow: '0 0 40px 8px rgba(245,166,35,0.45)',
          }}
        >
          <img src={solinLogo} alt="SOLIN" className="w-full h-full rounded-3xl" />
        </motion.div>

        <h1
          className="text-2xl font-semibold mb-3"
          style={{ color: '#F5A623' }}
        >
          Welcome to Premium ✨
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Your companions now remember everything about you.
          <br />
          No limits. Ever.
        </p>
        <button
          onClick={() => navigate('/')}
          className="rounded-2xl px-8 py-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
          style={{ backgroundColor: '#F5A623', color: '#0D0D1A' }}
        >
          Start talking to Kai
        </button>
        <p className="text-[11px] text-muted-foreground mt-5">
          Check your email for receipt
        </p>
      </motion.div>
    </div>
  );
}
