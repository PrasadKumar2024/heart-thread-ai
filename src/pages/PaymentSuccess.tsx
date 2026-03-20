import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-sm text-center"
      >
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          className="text-5xl mb-4"
        >
          ✨
        </motion.p>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome to SOLIN Premium!</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Your companions now remember everything about you.
        </p>
        <button
          onClick={() => navigate('/')}
          className="rounded-2xl bg-[#F5A623] px-8 py-3 text-sm font-semibold text-background transition-all hover:opacity-90 active:scale-[0.97]"
        >
          Start talking to Kai
        </button>
      </motion.div>
    </div>
  );
}
