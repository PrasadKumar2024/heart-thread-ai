import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Conversation } from '@/lib/store';
import { companions, customCompanion, getCompanion } from '@/lib/companions';
import { Search, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { ConversationContextMenu } from './ConversationContextMenu';
import { SidebarAccountSection } from './SidebarAccountSection';

export function AppSidebar() {
  const {
    sidebarOpen, setSidebarOpen, activeMode, setActiveMode,
    conversations, activeConversationId, setActiveConversation,
    createConversation,
  } = useAppStore();
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState<{ conv: Conversation; pos: { x: number; y: number } } | null>(null);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleNewChat = () => {
    createConversation(activeMode);
    setSidebarOpen(false);
  };

  const handleSelectCompanion = (id: typeof activeMode) => {
    setActiveMode(id);
    const existing = conversations.find((c) => c.mode === id && !c.isArchived);
    if (!existing) createConversation(id);
    setSidebarOpen(false);
  };

  const handleContextMenu = (e: React.MouseEvent, conv: Conversation) => {
    e.preventDefault();
    setContextMenu({ conv, pos: { x: e.clientX, y: e.clientY } });
  };

  const renderConvButton = (conv: Conversation) => {
    const companion = getCompanion(conv.mode);
    const isActive = activeConversationId === conv.id;
    return (
      <button
        key={conv.id}
        onClick={() => {
          setActiveConversation(conv.id);
          setActiveMode(conv.mode);
          setSidebarOpen(false);
        }}
        onContextMenu={(e) => handleContextMenu(e, conv)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors truncate group"
        style={{
          backgroundColor: isActive ? 'hsl(var(--sidebar-accent))' : 'transparent',
          color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--sidebar-foreground))',
        }}
      >
        <span className="text-sm shrink-0">{companion.emoji}</span>
        <span className="truncate flex-1 text-left">{conv.title}</span>
      </button>
    );
  };

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed inset-y-0 left-0 z-50 flex w-[80vw] max-w-sm flex-col"
        style={{
          backgroundColor: 'hsl(var(--sidebar-background))',
          borderRight: '1px solid hsl(var(--sidebar-border))',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h1 className="font-display text-2xl tracking-tight text-foreground">
            <span className="italic">solin</span>
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search + New Chat */}
        <div className="px-3 pb-2 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl bg-secondary pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={handleNewChat}
            className="flex w-full items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        {/* My Person */}
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">My Person</p>
          <button
            onClick={() => handleSelectCompanion('custom')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300"
            style={{
              backgroundColor: activeMode === 'custom' ? `${customCompanion.colorHex}15` : 'transparent',
              borderLeft: activeMode === 'custom' ? `2px solid ${customCompanion.colorHex}` : '2px solid transparent',
              color: activeMode === 'custom' ? customCompanion.colorHex : 'hsl(var(--sidebar-foreground))',
            }}
          >
            <span className="text-lg">{customCompanion.emoji}</span>
            <span className="font-medium">My Person</span>
          </button>
        </div>

        {/* Companions */}
        <div className="px-3 py-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Companions</p>
          <div className="space-y-0.5">
            {companions.map((c) => {
              const isActive = activeMode === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectCompanion(c.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? `${c.colorHex}15` : 'transparent',
                    borderLeft: isActive ? `2px solid ${c.colorHex}` : '2px solid transparent',
                    color: isActive ? c.colorHex : 'hsl(var(--sidebar-foreground))',
                  }}
                >
                  <span className="text-lg">{c.emoji}</span>
                  <div className="text-left">
                    <span className="block font-medium">{c.name}</span>
                    <span className="block text-xs opacity-60">{c.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upgrade Banner — free users only */}
        <UpgradeBanner />

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Recent</p>
          <div className="space-y-0.5">
            {filteredConversations.map(renderConvButton)}
            {filteredConversations.length === 0 && (
              <p className="text-xs text-muted-foreground px-1">No conversations yet.</p>
            )}
          </div>
        </div>

        <SidebarAccountSection />
      </motion.aside>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-[199]" onClick={() => setContextMenu(null)} />
            <ConversationContextMenu
              conversation={contextMenu.conv}
              position={contextMenu.pos}
              onClose={() => setContextMenu(null)}
            />
          </>
        )}
      </AnimatePresence>

    </>
  );
}
