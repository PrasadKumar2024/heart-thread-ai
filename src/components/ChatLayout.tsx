import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getCompanion } from '@/lib/companions';
import { AppSidebar } from '@/components/AppSidebar';
import { ModePills } from '@/components/ModePills';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';

export function ChatLayout() {
  const { activeMode, setSidebarOpen } = useAppStore();
  const companion = getCompanion(activeMode);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Ambient glow */}
      <motion.div
        animate={{ backgroundColor: `${companion.colorHex}05` }}
        transition={{ duration: 1 }}
        className="fixed inset-0 pointer-events-none"
      />

      {/* Sidebar (desktop always visible via CSS, mobile via state) */}
      <div className="hidden md:block">
        <div
          className="h-screen w-[280px] flex flex-col"
          style={{
            backgroundColor: 'hsl(var(--sidebar-background))',
            borderRight: '1px solid hsl(var(--sidebar-border))',
          }}
        >
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <AppSidebar />
      </div>

      {/* Main chat area */}
      <div className="relative flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h2 className="font-display text-lg italic tracking-tight text-foreground" style={{ color: companion.colorHex }}>
              {companion.name}
            </h2>
            <p className="text-xs text-muted-foreground">{companion.subtitle}</p>
          </div>
        </div>

        {/* Mode pills */}
        <div className="border-b border-border px-4">
          <ModePills />
        </div>

        {/* Messages */}
        <ChatMessages />

        {/* Input */}
        <ChatInput />
      </div>
    </div>
  );
}

/* Inline sidebar content for desktop (non-animated) */
function SidebarContent() {
  const {
    activeMode, setActiveMode,
    conversations, activeConversationId, setActiveConversation,
    createConversation, profile,
  } = useAppStore();

  const allCompanions = [...(await import('@/lib/companions')).companions, (await import('@/lib/companions')).customCompanion];

  // This needs to be a proper sync component - let me restructure
  return null;
}
