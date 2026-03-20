import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getCompanion } from '@/lib/companions';
import { streamChat } from '@/lib/chatApi';
import { getSystemPrompt } from '@/lib/systemPrompts';
import { createConversationInDB, saveMessageToDB, updateConversationTitle } from '@/lib/chatHistory';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PaywallModal } from './PaywallModal';

export function ChatInput() {
  const [input, setInput] = useState('');
  const [messagesToday, setMessagesToday] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    activeMode, activeConversationId, createConversation,
    addMessage, updateLastAssistantMessage, setIsTyping, profile,
  } = useAppStore();
  const companion = getCompanion(activeMode);

  // Load message count and premium status
  useEffect(() => {
    const loadStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('messages_today, last_message_date, is_premium')
        .eq('id', user.id)
        .single();
      if (data) {
        const today = new Date().toISOString().split('T')[0];
        if (data.last_message_date === today) {
          setMessagesToday(data.messages_today || 0);
        } else {
          setMessagesToday(0);
        }
        setIsPremium(data.is_premium || false);
      }
    };
    loadStatus();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const incrementMessageCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('profiles')
      .select('messages_today, last_message_date')
      .eq('id', user.id)
      .single();

    let newCount = 1;
    if (data?.last_message_date === today) {
      newCount = (data.messages_today || 0) + 1;
    }

    await supabase.from('profiles').update({
      messages_today: newCount,
      last_message_date: today,
    }).eq('id', user.id);

    setMessagesToday(newCount);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Check free limit
    if (!isPremium && messagesToday >= 20) {
      setPaywallOpen(true);
      return;
    }

    let convId = activeConversationId;
    let isNewConv = false;
    if (!convId) {
      convId = createConversation(activeMode);
      isNewConv = true;
    }

    addMessage(convId, { role: 'user', content: trimmed });
    setInput('');
    setIsTyping(true);

    // Increment message counter
    await incrementMessageCount();

    // Save conversation to DB if new
    if (isNewConv) {
      await createConversationInDB(convId, activeMode);
    }

    // Save user message to DB
    saveMessageToDB(convId, 'user', trimmed, activeMode);

    // Update conversation title if first message
    const conv = useAppStore.getState().conversations.find((c) => c.id === convId);
    if (conv && conv.messages.length === 1) {
      const title = trimmed.slice(0, 40) + (trimmed.length > 40 ? '…' : '');
      updateConversationTitle(convId, title);
    }

    // Get full conversation messages for context
    const updatedConv = useAppStore.getState().conversations.find((c) => c.id === convId);
    const history = (updatedConv?.messages || [])
      .filter((m) => m.content)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const systemPrompt = getSystemPrompt(
      activeMode, profile.name, profile.goal,
      profile.customPersona, profile.customPersonaName
    );

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
        onDone: () => {
          setIsTyping(false);
          saveMessageToDB(convId!, 'assistant', fullContent, activeMode);
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

  const remaining = 20 - messagesToday;

  return (
    <>
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
          {/* Message counter for free users */}
          {!isPremium && (
            <p className={`text-center text-[11px] mt-2 ${remaining <= 2 ? 'text-[#FFD700]' : 'text-muted-foreground'}`}>
              {remaining <= 0
                ? 'Daily limit reached ✨'
                : remaining <= 2
                  ? `${remaining} message${remaining === 1 ? '' : 's'} remaining today ✨`
                  : `${messagesToday} of 20 free messages today`}
            </p>
          )}
        </div>
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}
