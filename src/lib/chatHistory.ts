import { supabase } from '@/integrations/supabase/client';
import { useAppStore, type Conversation, type Message } from './store';
import type { CompanionMode } from './companions';

export async function loadChatHistory(): Promise<void> {
  const store = useAppStore.getState();
  store.setHistoryLoading(true);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

    const conversations: Conversation[] = convRows.map((c) => ({
      id: c.id,
      mode: c.mode as CompanionMode,
      title: c.title,
      messages: msgsByConv.get(c.id) || [],
      createdAt: new Date(c.created_at),
      isPinned: (c as any).is_pinned || false,
      isArchived: (c as any).is_archived || false,
    }));

    store.setConversations(conversations);

    const activeMode = store.activeMode;
    const modeConv = conversations.find((c) => c.mode === activeMode && !c.isArchived);
    if (modeConv) {
      store.setActiveConversation(modeConv.id);
    }
  } finally {
    store.setHistoryLoading(false);
  }
}

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

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  await supabase.from('conversations').update({ title }).eq('id', id);
}

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

export async function deleteConversationFromDB(id: string): Promise<void> {
  await supabase.from('messages').delete().eq('conversation_id', id);
  await supabase.from('conversations').delete().eq('id', id);
}

export async function updateConversationPinInDB(id: string, isPinned: boolean): Promise<void> {
  await supabase.from('conversations').update({ is_pinned: isPinned } as any).eq('id', id);
}

export async function updateConversationArchiveInDB(id: string, isArchived: boolean): Promise<void> {
  await supabase.from('conversations').update({ is_archived: isArchived } as any).eq('id', id);
}
