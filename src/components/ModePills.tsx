import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { companions, customCompanion, type CompanionMode } from '@/lib/companions';

export function ModePills() {
  const { activeMode, setActiveMode, conversations } = useAppStore();
  const allCompanions = [...companions, customCompanion];

  const handleModeSwitch = (id: CompanionMode) => {
    // setActiveMode now auto-selects the correct conversation for this mode
    setActiveMode(id);
  };

  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-none">
      {allCompanions.map((c) => {
        const isActive = activeMode === c.id;
        return (
          <motion.button
            key={c.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleModeSwitch(c.id)}
            className="flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-xs transition-all duration-300"
            style={{
              backgroundColor: isActive ? `${c.colorHex}20` : 'transparent',
              color: isActive ? c.colorHex : 'hsl(var(--muted-foreground))',
              boxShadow: isActive ? `inset 0 0 0 1px ${c.colorHex}50` : 'inset 0 0 0 1px hsl(var(--border))',
            }}
          >
            <span>{c.emoji}</span>
            <span className="font-medium">{c.subtitle} · {c.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
