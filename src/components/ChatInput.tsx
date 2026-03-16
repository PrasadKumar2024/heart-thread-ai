import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getCompanion } from '@/lib/companions';
import { streamChat, callChat } from '@/lib/chatApi';
import { getSystemPrompt, getTitlePrompt } from '@/lib/systemPrompts';
import { fetchMemory, checkMessageLimit, saveConversation, saveMessage, updateConversationTitle } from '@/lib/memory';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Props {
  onLimitReached: () => void;
}

export function ChatInput({ onLimitReached }: Props) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    activeMode, activeConversationId, createConversation,
    addMessage, updateLastAssistantMessage, setIsTyping, profile,
    conversations, updateConversationTitle: updateStoreTitle,
  } = useAppStore();
  const companion = getCompanion(activeMode);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    // Check message limit
    const { allowed } = await checkMessageLimit(user.id);
    if (!allowed) {
      onLimitReached();
      return;
    }

    let convId = activeConversationId;
    const isFirstMessage = !convId || !conversations.find(c => c.id === convId)?.messages.some(m => m.role === 'user');

    if (!convId) {
      convId = createConversation(activeMode);
    }

    // Save conversation to DB
    await saveConversation(user.id, convId, activeMode, 'New conversation');

    addMessage(convId, { role: 'user', content: trimmed });
    setInput('');
    setIsTyping(true);

    // Fetch memory (last 20 messages for this mode)
    const memory = await fetchMemory(user.id, activeMode);

    const systemPrompt = getSystemPrompt(
      activeMode, profile.name, profile.goal, memory,
      profile.customPersona, profile.customPersonaName
    );

    // Build message history from current conversation
    const conv = useAppStore.getState().conversations.find((c) => c.id === convId);
    const history = (conv?.messages || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Add empty assistant message for streaming
    addMessage(convId, { role: 'assistant', content: '' });

    let fullContent = '';

    try {
      await streamChat({
        messages: history,
        systemPrompt,
        onDelta: (chunk) => {
          fullContent += chunk;
          updateLastAssistantMessage(convId!, fullContent);
        },
        onDone: async () => {
          setIsTyping(false);
          // Save messages to DB
          try {
            await saveMessage(user.id, convId!, 'user', trimmed, activeMode);
            await saveMessage(user.id, convId!, 'assistant', fullContent, activeMode);
          } catch { /* silent */ }

          // Auto-generate title on first message
          if (isFirstMessage && trimmed) {
            try {
              const title = await callChat({
                messages: [{ role: 'user', content: getTitlePrompt(trimmed) }],
                systemPrompt: 'You generate short titles. Return ONLY the title.',
              });
              if (title) {
                const cleanTitle = title.slice(0, 50);
                updateStoreTitle(convId!, cleanTitle);
                await updateConversationTitle(convId!, cleanTitle);
              }
            } catch { /* silent */ }
          }
        },
        onError: (error) => {
          setIsTyping(false);
          toast.error(error);
        },
      });
    } catch (err) {
      setIsTyping(false);
      toast.error('Failed to connect to AI');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-secondary/50 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="say anything..."
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all duration-300"
            style={{ outlineColor: companion.colorHex }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 disabled:opacity-30"
            style={{
              backgroundColor: input.trim() ? companion.colorHex : 'hsl(var(--muted))',
              color: input.trim() ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
            }}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
