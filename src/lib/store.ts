import { create } from 'zustand';
import type { CompanionMode } from './companions';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  mode: CompanionMode;
  title: string;
  messages: Message[];
  createdAt: Date;
  isPinned?: boolean;
  isArchived?: boolean;
}

interface UserProfile {
  name: string;
  goal: string;
  onboarded: boolean;
  customPersona?: string;
  customPersonaName?: string;
}

interface AppState {
  profile: UserProfile;
  setProfile: (p: Partial<UserProfile>) => void;

  activeMode: CompanionMode;
  setActiveMode: (mode: CompanionMode) => void;

  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;
  createConversation: (mode: CompanionMode) => string;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateLastAssistantMessage: (conversationId: string, content: string) => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  togglePinConversation: (id: string) => void;
  toggleArchiveConversation: (id: string) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;

  historyLoading: boolean;
  setHistoryLoading: (loading: boolean) => void;

  setConversations: (conversations: Conversation[]) => void;
  resetAppState: () => void;
}

let msgCounter = 0;

export const useAppStore = create<AppState>((set, get) => ({
  profile: { name: '', goal: '', onboarded: false },
  setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

  activeMode: 'kai',
  setActiveMode: (mode) => {
    const state = get();
    const modeConv = state.conversations.find((c) => c.mode === mode && !c.isArchived);
    set({
      activeMode: mode,
      activeConversationId: modeConv ? modeConv.id : null,
    });
  },

  conversations: [],
  activeConversationId: null,
  setActiveConversation: (id) => set({ activeConversationId: id }),

  createConversation: (mode) => {
    const id = crypto.randomUUID();
    set((s) => ({
      conversations: [
        { id, mode, title: 'New conversation', messages: [], createdAt: new Date(), isPinned: false, isArchived: false },
        ...s.conversations,
      ],
      activeConversationId: id,
      activeMode: mode,
    }));
    return id;
  },

  addMessage: (conversationId, message) => {
    msgCounter++;
    const msg: Message = { ...message, id: `msg-${msgCounter}`, timestamp: new Date() };
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, msg],
              title: c.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 40) + (message.content.length > 40 ? '…' : '')
                : c.title,
            }
          : c
      ),
    }));
  },

  updateLastAssistantMessage: (conversationId, content) => {
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        const msgs = [...c.messages];
        const last = msgs[msgs.length - 1];
        if (last?.role === 'assistant') {
          msgs[msgs.length - 1] = { ...last, content };
        }
        return { ...c, messages: msgs };
      }),
    }));
  },

  renameConversation: (id, title) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, title } : c
      ),
    }));
  },

  deleteConversation: (id) => {
    set((s) => {
      const newConvs = s.conversations.filter((c) => c.id !== id);

      if (s.activeConversationId !== id) {
        return {
          conversations: newConvs,
        };
      }

      const fallbackConversation = newConvs[0] ?? null;

      return {
        conversations: newConvs,
        activeConversationId: fallbackConversation?.id ?? null,
        activeMode: fallbackConversation?.mode ?? s.activeMode,
      };
    });
  },

  togglePinConversation: (id) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, isPinned: !c.isPinned } : c
      ),
    }));
  },

  toggleArchiveConversation: (id) => {
    set((s) => {
      const conv = s.conversations.find((c) => c.id === id);
      const newArchived = !conv?.isArchived;
      return {
        conversations: s.conversations.map((c) =>
          c.id === id ? { ...c, isArchived: newArchived } : c
        ),
        activeConversationId: s.activeConversationId === id && newArchived ? null : s.activeConversationId,
      };
    });
  },

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  isTyping: false,
  setIsTyping: (typing) => set({ isTyping: typing }),

  historyLoading: false,
  setHistoryLoading: (loading) => set({ historyLoading: loading }),

  setConversations: (conversations) => set({ conversations }),

  resetAppState: () => {
    msgCounter = 0;
    set({
      profile: { name: '', goal: '', onboarded: false },
      activeMode: 'kai',
      conversations: [],
      activeConversationId: null,
      sidebarOpen: false,
      isTyping: false,
      historyLoading: false,
    });
  },
}));
