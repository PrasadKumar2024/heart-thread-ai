import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMPANION_NAMES: Record<string, string> = {
  kai: "Kai", luna: "Luna", nova: "Nova", sage: "Sage", spark: "Spark",
};

const PERSONALITY_GUIDE = `
COMPANION PERSONALITIES IN LETTERS:
Kai writes like: Casual, warm, uses "ngl" and "fr", notices things, hypes them up, asks one question at end.
Luna writes like: Soft, gentle, honors their feelings, never rushes, pure warmth, makes them feel deeply seen.
Nova writes like: Quiet, present, notices small things they mentioned, makes ordinary moments feel meaningful.
Sage writes like: Calm, wise, reflects what they processed, honors the release, one gentle observation.
Spark writes like: Curious, excited, connects their conversations to something bigger, leaves them thinking.

CRITICAL RULES:
— NEVER be generic
— NEVER write something that could apply to anyone else
— Every letter must reference something SPECIFIC they said
— Make them feel: 'this was written just for me'
— If they had a hard week: honor that without fixing it
— If they had a good week: celebrate it genuinely`;

function getMondayOfWeek(d = new Date()): string {
  const date = new Date(d);
  const day = date.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
}

async function generateLetter(companionName: string, userName: string, messages: string): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

  const systemPrompt = `You are ${companionName}.
Write a deeply personal letter to ${userName} based on what they shared with you this week.
The letter must:
— Feel like it came from a real friend
— Reference at least 2-3 SPECIFIC things they actually said this week
— Notice a pattern or something deeper you observed
— Show genuine care and warmth
— Be 150-200 words maximum
— Feel handwritten not typed
— End with your signature

Format exactly like this:
Hey ${userName},

[Letter body — warm, personal, specific to their conversations]

[One final line that shows you were really listening]

— ${companionName}

${PERSONALITY_GUIDE}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: `Here are ${userName}'s messages from this week:\n\n${messages}` }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.9 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

async function processUser(supabase: any, userId: string, weekStart: string, sevenDaysAgo: string) {
  // Skip if letter already exists for this week
  const { data: existing } = await supabase
    .from("letters").select("id").eq("user_id", userId).eq("week_start", weekStart).maybeSingle();
  if (existing) return { userId, status: "skipped" };

  // Find most-used companion this week
  const { data: msgs } = await supabase
    .from("messages").select("mode, content, role, created_at")
    .eq("user_id", userId).eq("role", "user")
    .gte("created_at", sevenDaysAgo).order("created_at", { ascending: false });

  if (!msgs || msgs.length === 0) return { userId, status: "no_messages" };

  const counts: Record<string, number> = {};
  for (const m of msgs) {
    if (m.mode && COMPANION_NAMES[m.mode]) counts[m.mode] = (counts[m.mode] || 0) + 1;
  }
  const topMode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!topMode) return { userId, status: "no_companion" };

  const companionName = COMPANION_NAMES[topMode];
  const last20 = msgs.filter((m) => m.mode === topMode).slice(0, 20)
    .map((m) => `- ${m.content}`).reverse().join("\n");

  const { data: profile } = await supabase
    .from("profiles").select("name").eq("id", userId).maybeSingle();
  const userName = profile?.name || "friend";

  const letterContent = await generateLetter(companionName, userName, last20);
  if (!letterContent) return { userId, status: "empty_letter" };

  await supabase.from("letters").insert({
    user_id: userId,
    companion_mode: topMode,
    companion_name: companionName,
    letter_content: letterContent,
    week_start: weekStart,
    is_read: false,
  });
  return { userId, status: "created", companion: companionName };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const weekStart = getMondayOfWeek();
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    let userIds: string[] = [];
    let singleUserMode = false;

    // Manual trigger: pass { user_id } to generate for one user
    let body: any = {};
    try { body = await req.json(); } catch (_) {}
    if (body?.user_id) {
      userIds = [body.user_id];
      singleUserMode = true;
    } else {
      const { data: active } = await supabase
        .from("messages").select("user_id")
        .gte("created_at", sevenDaysAgo);
      userIds = [...new Set((active || []).map((r: any) => r.user_id))];
    }

    const results = [];
    for (const uid of userIds) {
      try {
        results.push(await processUser(supabase, uid, weekStart, sevenDaysAgo));
      } catch (e: any) {
        results.push({ userId: uid, status: "error", error: e.message });
      }
    }

    return new Response(JSON.stringify({ ok: true, count: results.length, results, singleUserMode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
