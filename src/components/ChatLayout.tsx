import { motion } from 'framer-motion';
import { Menu, Pencil } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { getCompanion, companions, customCompanion, type CompanionMode } from '@/lib/companions';
import { AppSidebar } from '@/components/AppSidebar';
import { ModePills } from '@/components/ModePills';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { CustomPersonaEditor } from '@/components/CustomPersonaEditor';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { callChat } from '@/lib/chatApi';
import { getOpeningPrompt } from '@/lib/systemPrompts';
import { fetchRecentForGreeting } from '@/lib/memory';

function DesktopSidebar() {
  const {
    activeMode, setActiveMode,
    conversations, activeConversationId, setActiveConversation,
    createConversation, profile,
  } = useAppStore();
  const [search, setSearch] = useState('');
  const allCompanions = [...companions, customCompanion];

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="h-screen w-[280px] flex flex-col shrink-0"
      style={{
        backgroundColor: 'hsl(var(--sidebar-background))',
        borderRight: '1px solid hsl(var(--sidebar-border))',
      }}
    >
      <div className="p-4 pb-2">
        <h1 className="font-display text-2xl tracking-tight text-foreground">
          <span className="italic">solin</span>
        </h1>
      </div>

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
          onClick={() => createConversation(activeMode)}
          className="flex w-full items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Companions</p>
        <div className="space-y-0.5">
          {allCompanions.map((c) => {
            const isActive = activeMode === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveMode(c.id);
                  const existing = conversations.find((conv) => conv.mode === c.id);
                  if (existing) setActiveConversation(existing.id);
                  else createConversation(c.id);
                }}
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

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">Recent</p>
        <div className="space-y-0.5">
          {filteredConversations.map((conv) => {
            const companion = getCompanion(conv.mode);
            const isActive = activeConversationId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversation(conv.id);
                  setActiveMode(conv.mode);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors truncate"
                style={{
                  backgroundColor: isActive ? 'hsl(var(--sidebar-accent))' : 'transparent',
                  color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--sidebar-foreground))',
                }}
              >
                <span className="text-sm shrink-0">{companion.emoji}</span>
                <span className="truncate">{conv.title}</span>
              </button>
            );
          })}
          {filteredConversations.length === 0 && (
            <p className="text-xs text-muted-foreground px-1">No conversations yet.</p>
          )}
        </div>
      </div>

      {profile.name && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-display text-sm italic">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-foreground">{profile.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatLayout() {
  const { activeMode, activeConversationId, conversations, setSidebarOpen, addMessage, setIsTyping, profile } = useAppStore();
  const companion = getCompanion(activeMode);
  const [personaEditorOpen, setPersonaEditorOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [greetingGenerated, setGreetingGenerated] = useState<Record<string, boolean>>({});

  // Generate opening message when conversation is empty
  const generateOpeningMessage = useCallback(async () => {
    const convId = activeConversationId;
    if (!convId) return;
    const conv = conversations.find(c => c.id === convId);
    if (!conv || conv.messages.length > 0) return;
    if (greetingGenerated[convId]) return;

    setGreetingGenerated(prev => ({ ...prev, [convId]: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const recentMsgs = await fetchRecentForGreeting(user.id, activeMode);
      const prompt = getOpeningPrompt(companion.name, companion.subtitle, profile.name, recentMsgs || undefined);

      setIsTyping(true);
      const greeting = await callChat({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You generate greetings in character. Return ONLY the greeting. No quotes.',
      });

      if (greeting) {
        addMessage(convId, { role: 'assistant', content: greeting });
      }
    } catch {
      // Silent fail for greetings
    } finally {
      setIsTyping(false);
    }
  }, [activeConversationId, activeMode, conversations, companion, profile.name, greetingGenerated, addMessage, setIsTyping]);

  useEffect(() => {
    if (activeConversationId) {
      generateOpeningMessage();
    }
  }, [activeConversationId, generateOpeningMessage]);

  // Custom person paywall for non-premium users
  const handleCustomPersona = () => {
    if (activeMode === 'custom' && !profile.isPremium) {
      setUpgradeOpen(true);
      return;
    }
    setPersonaEditorOpen(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <motion.div
        animate={{ backgroundColor: `${companion.colorHex}05` }}
        transition={{ duration: 1 }}
        className="fixed inset-0 pointer-events-none"
      />

      <div className="hidden md:block">
        <DesktopSidebar />
      </div>

      <div className="md:hidden">
        <AppSidebar />
      </div>

      <div className="relative flex flex-1 flex-col min-w-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors md:hidden"
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
          {activeMode === 'custom' && (
            <button
              onClick={handleCustomPersona}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              title="Edit persona"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>

        <ChatMessages />

        <div className="border-t border-border px-4">
          <ModePills />
        </div>

        <ChatInput onLimitReached={() => setUpgradeOpen(true)} />
      </div>

      <CustomPersonaEditor open={personaEditorOpen} onOpenChange={setPersonaEditorOpen} />
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
