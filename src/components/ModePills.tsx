import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { companions, customCompanion, type CompanionMode } from '@/lib/companions';

export function ModePills() {
  const { activeMode, setActiveMode, createConversation, activeConversationId, conversations } = useAppStore();
  const allCompanions = [...companions, customCompanion];

  const handleModeSwitch = (id: CompanionMode) => {
    setActiveMode(id);
    // Check if current conversation matches mode, if not create new
    const current = conversations.find((c) => c.id === activeConversationId);
    if (!current || current.mode !== id) {
      const existing = conversations.find((c) => c.mode === id);
      if (existing) {
        useAppStore.getState().setActiveConversation(existing.id);
      } else {
        createConversation(id);
      }
    }
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
            className="flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-all duration-300"
            style={{
              backgroundColor: isActive ? `${c.colorHex}20` : 'transparent',
              color: isActive ? c.colorHex : 'hsl(var(--muted-foreground))',
              boxShadow: isActive ? `inset 0 0 0 1px ${c.colorHex}50` : 'inset 0 0 0 1px hsl(var(--border))',
            }}
          >
            <span>{c.emoji}</span>
            <span className="font-medium">{c.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
