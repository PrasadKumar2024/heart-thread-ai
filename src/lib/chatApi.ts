const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

type Msg = { role: 'user' | 'assistant'; content: string };

export async function streamChat({
  messages,
  systemPrompt,
  onDelta,
  onDone,
  onError,
  timeoutMs = 30000,
}: {
  messages: Msg[];
  systemPrompt: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  timeoutMs?: number;
}) {
  const controller = new AbortController();
  let gotAnyDelta = false;
  let settled = false;
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const finishError = (message: string) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeoutId);
    onError(message);
  };

  const finishDone = () => {
    if (settled) return;
    settled = true;
    clearTimeout(timeoutId);
    onDone();
  };

  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, systemPrompt }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({ error: 'Unknown error' }));
      finishError(data.error || `Something went wrong. Try again.`);
      return;
    }

    if (!resp.body) {
      finishError('Something went wrong. Try again.');
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.error) {
            finishError('Something went wrong. Try again.');
            streamDone = true;
            break;
          }
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            gotAnyDelta = true;
            onDelta(content);
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.error) {
            finishError('Something went wrong. Try again.');
            return;
          }
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            gotAnyDelta = true;
            onDelta(content);
          }
        } catch { /* ignore */ }
      }
    }

    if (!gotAnyDelta) {
      finishError('Something went wrong. Try again.');
      return;
    }
    finishDone();
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      finishError('Taking too long. Try again.');
    } else {
      finishError('Something went wrong. Try again.');
    }
  }
}
