import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Message } from '@/lib/store';
import { getCompanion } from '@/lib/companions';
import { detectEmotion } from '@/lib/emotionDetect';
import { useEffect, useRef, useState } from 'react';

const TYPING_MESSAGES: Record<string, { default: string; sad: string; excited: string }> = {
  kai: { default: 'Kai is thinking... 💛', sad: 'Kai feels that... 💛', excited: 'Kai is hyped! 💛' },
  luna: { default: 'Luna is sitting with that... 💙', sad: 'Luna is with you... 💙', excited: 'Luna is listening... 💙' },
  nova: { default: 'Nova is here with you... 🌙', sad: 'Nova is here with you... 🌙', excited: 'Nova is here with you... 🌙' },
  sage: { default: 'Sage is taking that in... 🌿', sad: 'Sage is taking that in... 🌿', excited: 'Sage is taking that in... 🌿' },
  spark: { default: 'Spark is diving in... ⚡', sad: 'Spark is diving in... ⚡', excited: 'Spark loves this! ⚡' },
};

const TAGLINES: Record<string, string> = {
  kai: 'Your ride-or-die. Always real.',
  luna: 'Here for your hardest moments.',
  nova: 'Quiet company. Always here.',
  sage: 'Ready to listen. No judgment.',
  spark: 'Ready to blow your mind.',
  custom: 'Your person. Always here.',
};

function TypingIndicator({ color, mode, lastUserMsg }: { color: string; mode: string; lastUserMsg?: string }) {
  const emotion = lastUserMsg ? detectEmotion(lastUserMsg) : 'neutral';
  const msgs = TYPING_MESSAGES[mode];
  const customName = useAppStore.getState().profile.customPersonaName;

  let text: string;
  if (mode === 'custom') {
    text = `${customName || 'Your person'} is thinking...`;
  } else if (msgs) {
    text = msgs[emotion === 'neutral' ? 'default' : emotion];
  } else {
    text = 'Thinking...';
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <motion.span
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        className="text-xs text-muted-foreground"
      >
        {text}
      </motion.span>
    </div>
  );
}

function DeliveredText({ companionName }: { companionName: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[10px] text-muted-foreground px-1"
        >
          delivered to {companionName} ✓
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function ChatBubble({
  message,
  modeColor,
  isLastUser,
  companionName,
}: {
  message: Message;
  modeColor: string;
  isLastUser: boolean;
  companionName: string;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ x: isUser ? 20 : -20, opacity: 0, scale: 0.97 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[85%] md:max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isUser && (
          <span className="text-xs font-display italic px-1" style={{ color: modeColor }}>
            {companionName}
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
        {isUser && isLastUser ? (
          <DeliveredText companionName={companionName} />
        ) : (
          <span className="text-[10px] text-muted-foreground px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function ChatMessages() {
  const { activeConversationId, conversations, isTyping, activeMode, historyLoading } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const companion = getCompanion(activeMode);
  const conversation = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages.length, isTyping]);

  // Find last user message for emotion-aware typing
  const lastUserMsg = conversation?.messages
    .filter((m) => m.role === 'user')
    .pop()?.content;

  // Find last user message index for "delivered" indicator
  const lastUserMsgId = (() => {
    if (!conversation) return null;
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      if (conversation.messages[i].role === 'user') return conversation.messages[i].id;
    }
    return null;
  })();

  if (historyLoading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
            className="h-4 w-4 rounded-full mx-auto mb-3"
            style={{ backgroundColor: companion.colorHex }}
          />
          <p className="text-sm text-muted-foreground">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breathing emoji */}
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
              className="text-6xl block mb-4"
            >
              {companion.emoji}
            </motion.span>
            <h2 className="font-display text-3xl italic tracking-tight mb-2" style={{ color: companion.colorHex }}>
              {companion.name}
            </h2>
            <p className="text-muted-foreground text-sm">{TAGLINES[activeMode] || companion.description}</p>
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
            <ChatBubble
              key={msg.id}
              message={msg}
              modeColor={companion.colorHex}
              isLastUser={msg.id === lastUserMsgId}
              companionName={companion.name}
            />
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator color={companion.colorHex} mode={activeMode} lastUserMsg={lastUserMsg} />}
      </div>
    </div>
  );
}
