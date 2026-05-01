import { motion } from 'framer-motion';
import { Menu, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getCompanion } from '@/lib/companions';
import { AppSidebar } from '@/components/AppSidebar';
import { ModePills } from '@/components/ModePills';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { CustomPersonaEditor } from './CustomPersonaEditor';

export function ChatLayout() {
  const { activeMode, setSidebarOpen } = useAppStore();
  const companion = getCompanion(activeMode);
  const [personaEditorOpen, setPersonaEditorOpen] = useState(false);
  const showModeBar = activeMode !== 'custom';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <motion.div
        animate={{ backgroundColor: `${companion.colorHex}05` }}
        transition={{ duration: 1 }}
        className="fixed inset-0 pointer-events-none"
      />

      <AppSidebar />

      <div className="relative flex flex-1 flex-col min-w-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="font-display text-lg italic tracking-tight" style={{ color: companion.colorHex }}>
                {companion.name}
              </h2>
              <p className="text-xs text-muted-foreground">{companion.subtitle}</p>
            </div>
          </div>
          {/* Personalise button — only in custom mode */}
          {activeMode === 'custom' && (
            <button
              onClick={() => setPersonaEditorOpen(true)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Personalise
            </button>
          )}
        </div>

        <ChatMessages />

        {showModeBar && (
          <div className="border-t border-border px-4">
            <ModePills />
          </div>
        )}

        <ChatInput />
      </div>

      {/* Persona editor from chat header */}
      <CustomPersonaEditor open={personaEditorOpen} onOpenChange={setPersonaEditorOpen} />
    </div>
  );
}
