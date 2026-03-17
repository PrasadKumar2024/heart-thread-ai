import { supabase } from '@/integrations/supabase/client';
import { useAppStore, type Conversation, type Message } from './store';
import type { CompanionMode } from './companions';

/**
 * Load all conversations and messages for the current user from the database.
 */
export async function loadChatHistory(): Promise<void> {
  const store = useAppStore.getState();
  store.setHistoryLoading(true);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch all conversations
    const { data: convRows, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (convError) {
      console.error('Failed to load conversations:', convError);
      return;
    }

    if (!convRows || convRows.length === 0) {
      store.setConversations([]);
      return;
    }

    // Fetch all messages for these conversations
    const convIds = convRows.map((c) => c.id);
    const { data: msgRows, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Failed to load messages:', msgError);
      return;
    }

    // Group messages by conversation_id
    const msgsByConv = new Map<string, Message[]>();
    for (const m of msgRows || []) {
      const list = msgsByConv.get(m.conversation_id) || [];
      list.push({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at),
      });
      msgsByConv.set(m.conversation_id, list);
    }

    // Build Conversation objects
    const conversations: Conversation[] = convRows.map((c) => ({
      id: c.id,
      mode: c.mode as CompanionMode,
      title: c.title,
      messages: msgsByConv.get(c.id) || [],
      createdAt: new Date(c.created_at),
    }));

    store.setConversations(conversations);

    // Auto-select the most recent conversation for the active mode
    const activeMode = store.activeMode;
    const modeConv = conversations.find((c) => c.mode === activeMode);
    if (modeConv) {
      store.setActiveConversation(modeConv.id);
    }
  } finally {
    store.setHistoryLoading(false);
  }
}

/**
 * Create a conversation in Supabase and return the id.
 */
export async function createConversationInDB(id: string, mode: CompanionMode): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('conversations').insert({
    id,
    user_id: user.id,
    mode,
    title: 'New conversation',
  });
}

/**
 * Update conversation title in Supabase.
 */
export async function updateConversationTitle(id: string, title: string): Promise<void> {
  await supabase.from('conversations').update({ title }).eq('id', id);
}

/**
 * Save a message to the database.
 */
export async function saveMessageToDB(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  mode: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('messages').insert({
    conversation_id: conversationId,
    user_id: user.id,
    role,
    content,
    mode,
  });
}
