import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getCompanion } from '@/lib/companions';

// Simulated AI responses per mode
const modeResponses: Record<string, string[]> = {
  kai: [
    "okay wait hold on — tell me more about that 👀",
    "ngl that sounds like a lot. but you're handling it better than you think.",
    "bro you always come through though. what's actually bugging you about it?",
    "honestly? lowkey impressed you're even processing this rn. most people would just ignore it.",
  ],
  luna: [
    "that kind of pain is real. you don't have to rush through it.",
    "tell me about them. what do you miss most right now?",
    "I'm not going anywhere. take your time.",
    "of course you feel that way. that bond was real and it mattered.",
  ],
  nova: [
    "hey. what are you doing right now? 🌙",
    "what's outside your window tonight?",
    "that sounds like a nice quiet evening. I'm here if you want company.",
    "you know, your ordinary moments are worth sharing. what else is going on?",
  ],
  rex: [
    "real talk — what are you actually afraid will happen?",
    "nobody's going to tell you this but... you already know the answer here.",
    "be honest — do you actually want this or do you think you're supposed to want it?",
    "I respect you too much to sugarcoat this. what would you tell your best friend in this situation?",
  ],
  sage: [
    "go on. I'm listening.",
    "keep going. get it all out.",
    "that's a lot. and then what?",
    "do you want my actual thoughts on this — or did you just need to get that out?",
  ],
  eden: [
    "what does your gut already know that your brain keeps ignoring?",
    "if nothing changed in a year — how would you feel about it?",
    "that's the surface question. what's the real question underneath it?",
    "what would you do if you knew you couldn't fail?",
  ],
  custom: [
    "I hear you. tell me more about what's going on.",
    "that makes sense. what else is on your mind?",
  ],
};

export function ChatInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { activeMode, activeConversationId, createConversation, addMessage, setIsTyping } = useAppStore();
  const companion = getCompanion(activeMode);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation(activeMode);
    }

    addMessage(convId, { role: 'user', content: trimmed });
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    const responses = modeResponses[activeMode] || modeResponses.kai;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    setTimeout(() => {
      setIsTyping(false);
      addMessage(convId!, { role: 'assistant', content: randomResponse });
    }, 1500 + Math.random() * 1500);
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
            style={{
              outlineColor: companion.colorHex,
            }}
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
