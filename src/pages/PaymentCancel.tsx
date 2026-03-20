import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-sm text-center"
      >
        <p className="text-4xl mb-4">💬</p>
        <h1 className="text-xl font-semibold text-foreground mb-2">No worries</h1>
        <p className="text-sm text-muted-foreground mb-8">
          You still have your free conversations today.
        </p>
        <button
          onClick={() => navigate('/')}
          className="rounded-2xl bg-secondary px-8 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-[0.97]"
        >
          Continue with free plan
        </button>
      </motion.div>
    </div>
  );
}
