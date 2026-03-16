import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Message } from '@/lib/store';
import { getCompanion } from '@/lib/companions';
import { useEffect, useRef } from 'react';

function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground">
        {getCompanion(useAppStore.getState().activeMode).name} is thinking...
      </span>
    </div>
  );
}

function ChatBubble({ message, modeColor }: { message: Message; modeColor: string }) {
  const isUser = message.role === 'user';
  const companion = getCompanion(useAppStore.getState().activeMode);

  return (
    <motion.div
      initial={{ x: isUser ? 20 : -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[85%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isUser && (
          <span className="text-xs font-display italic px-1" style={{ color: modeColor }}>
            {companion.name}
          </span>
        )}
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed text-pretty"
          style={
            isUser
              ? { backgroundColor: 'hsl(var(--card))' }
              : {
                  backgroundColor: `${modeColor}10`,
                  borderLeft: `2px solid ${modeColor}`,
                }
          }
        >
          <p className="text-foreground">{message.content}</p>
        </div>
        <span className="text-[10px] text-muted-foreground px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

export function ChatMessages() {
  const { activeConversationId, conversations, isTyping, activeMode } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const companion = getCompanion(activeMode);
  const conversation = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages.length, isTyping]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-6xl block mb-4">{companion.emoji}</span>
            <h2 className="font-display text-3xl italic tracking-tight mb-2 text-foreground">
              {companion.name}
            </h2>
            <p className="text-muted-foreground text-sm">{companion.description}</p>
            <p className="text-muted-foreground/60 text-xs mt-4">say anything to start...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
      <div className="mx-auto max-w-3xl">
        <AnimatePresence mode="popLayout">
          {conversation.messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} modeColor={companion.colorHex} />
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator color={companion.colorHex} />}
      </div>
    </div>
  );
}
