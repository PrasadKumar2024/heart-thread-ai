import { supabase } from '@/integrations/supabase/client';

/** Fetch last 20 messages for a user in a specific mode */
export async function fetchMemory(userId: string, mode: string): Promise<string> {
  const { data } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('user_id', userId)
    .eq('mode', mode)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!data || data.length === 0) return 'No previous conversations.';

  return data
    .reverse()
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');
}

/** Fetch last 5 messages for opening greeting */
export async function fetchRecentForGreeting(userId: string, mode: string): Promise<string | null> {
  const { data } = await supabase
    .from('messages')
    .select('role, content')
    .eq('user_id', userId)
    .eq('mode', mode)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!data || data.length === 0) return null;

  return data
    .reverse()
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');
}

/** Check and track daily message limit */
export async function checkMessageLimit(userId: string): Promise<{ allowed: boolean; isPremium: boolean; count: number }> {
  const { data } = await supabase
    .from('profiles')
    .select('is_premium, messages_today, last_message_date')
    .eq('id', userId)
    .single();

  if (!data) return { allowed: true, isPremium: false, count: 0 };
  if (data.is_premium) return { allowed: true, isPremium: true, count: data.messages_today };

  const today = new Date().toISOString().split('T')[0];
  const lastDate = data.last_message_date;

  if (lastDate !== today) {
    // Reset counter for new day
    await supabase
      .from('profiles')
      .update({ messages_today: 1, last_message_date: today })
      .eq('id', userId);
    return { allowed: true, isPremium: false, count: 1 };
  }

  if (data.messages_today >= 20) {
    return { allowed: false, isPremium: false, count: data.messages_today };
  }

  // Increment counter
  await supabase
    .from('profiles')
    .update({ messages_today: data.messages_today + 1 })
    .eq('id', userId);

  return { allowed: true, isPremium: false, count: data.messages_today + 1 };
}

/** Save a conversation to Supabase */
export async function saveConversation(userId: string, convId: string, mode: string, title: string) {
  await supabase.from('conversations').upsert({
    id: convId,
    user_id: userId,
    mode,
    title,
  });
}

/** Save a message to Supabase */
export async function saveMessage(userId: string, conversationId: string, role: string, content: string, mode: string) {
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    user_id: userId,
    role,
    content,
    mode,
  });
}

/** Update conversation title */
export async function updateConversationTitle(convId: string, title: string) {
  await supabase.from('conversations').update({ title }).eq('id', convId);
}
