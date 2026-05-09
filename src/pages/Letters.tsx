import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Mail, Sparkles, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCompanion, type CompanionMode } from '@/lib/companions';
import { PaywallModal } from '@/components/PaywallModal';
import { toast } from '@/hooks/use-toast';

interface Letter {
  id: string;
  companion_mode: string;
  companion_name: string;
  letter_content: string;
  week_start: string;
  is_read: boolean;
  created_at: string;
}

function FadeInLetter({ text }: { text: string }) {
  const words = text.split(/(\s+)/);
  const total = words.length;
  return (
    <div style={{ color: 'white', lineHeight: 1.8, fontSize: 16, fontFamily: 'Georgia, "Times New Roman", serif', whiteSpace: 'pre-wrap' }}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (i / total) * 2, duration: 0.3 }}
        >
          {w}
        </motion.span>
      ))}
    </div>
  );
}

export default function Letters() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }

      const { data: profile } = await supabase
        .from('profiles').select('is_premium').eq('id', user.id).maybeSingle();
      setIsPremium(!!profile?.is_premium);

      const { data } = await supabase
        .from('letters').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const list = (data || []) as Letter[];
      setLetters(list);
      const newest = list[0];
      if (newest) {
        setActiveLetter(newest);
        if (!newest.is_read) {
          await supabase.from('letters').update({ is_read: true }).eq('id', newest.id);
        }
      }
      setLoading(false);
    })();
  }, [navigate]);

  const openLetter = async (l: Letter) => {
    setActiveLetter(l);
    setShowPast(false);
    if (!l.is_read) {
      await supabase.from('letters').update({ is_read: true }).eq('id', l.id);
      setLetters((prev) => prev.map((x) => x.id === l.id ? { ...x, is_read: true } : x));
    }
  };

  const handleScreenshot = () => {
    setHighlight(true);
    toast({ title: 'Share with someone 💛', description: 'Take a screenshot now!' });
    setTimeout(() => setHighlight(false), 3000);
  };

  const formatWeek = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return `Week of ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0D0D1A' }}>
        <div className="text-muted-foreground text-sm">Loading letters...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0D1A' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-xl font-light tracking-[3px]" style={{ color: '#F5A623' }}>Letters</h1>
          <div className="w-12" />
        </div>

        {!activeLetter && letters.length === 0 && (
          <div className="text-center py-20">
            <Mail className="h-12 w-12 mx-auto mb-4" style={{ color: '#F5A623', opacity: 0.5 }} />
            <p className="text-muted-foreground">No letters yet.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Your companions write to you each Sunday.
            </p>
          </div>
        )}

        {showPast ? (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Past Letters</h2>
            {letters.map((l) => {
              const c = getCompanion(l.companion_mode as CompanionMode);
              return (
                <button
                  key={l.id}
                  onClick={() => openLetter(l)}
                  className="w-full text-left rounded-2xl p-4 transition-transform active:scale-[0.98]"
                  style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(245,166,35,0.2)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{c.emoji}</span>
                    <span style={{ color: c.colorHex, fontWeight: 600 }}>{l.companion_name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{formatWeek(l.week_start)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{l.letter_content.split('\n').find(s => s.trim()) || ''}</p>
                </button>
              );
            })}
            <button
              onClick={() => setShowPast(false)}
              className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to letter
            </button>
          </div>
        ) : activeLetter && (
          <>
            <motion.div
              animate={highlight ? { scale: 1.02, boxShadow: '0 0 40px rgba(245,166,35,0.5)' } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-6 relative"
              style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(245,166,35,0.3)' }}
            >
              <div className="text-center mb-4">
                <div style={{ fontSize: 32 }}>{getCompanion(activeLetter.companion_mode as CompanionMode).emoji}</div>
                <div
                  className="font-medium mt-2"
                  style={{ color: getCompanion(activeLetter.companion_mode as CompanionMode).colorHex }}
                >
                  A letter from {activeLetter.companion_name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{formatWeek(activeLetter.week_start)}</div>
              </div>
              <div className="h-px mb-5" style={{ backgroundColor: '#F5A623', opacity: 0.4 }} />

              {isPremium ? (
                <FadeInLetter text={activeLetter.letter_content} />
              ) : (
                <div className="relative">
                  <div
                    style={{
                      color: 'white', lineHeight: 1.8, fontSize: 16,
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {activeLetter.letter_content.split('\n').slice(0, 3).join('\n')}
                  </div>
                  <div
                    className="mt-2 rounded-xl p-6 text-center"
                    style={{
                      backgroundColor: 'rgba(13,13,26,0.85)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(245,166,35,0.3)',
                    }}
                  >
                    <Lock className="h-6 w-6 mx-auto mb-2" style={{ color: '#F5A623' }} />
                    <p className="text-sm mb-3" style={{ color: 'white' }}>
                      Upgrade to read your full letter ✨
                    </p>
                    <button
                      onClick={() => setPaywallOpen(true)}
                      className="px-6 py-2 rounded-lg font-bold text-sm"
                      style={{ backgroundColor: '#F5A623', color: '#0D0D1A' }}
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={handleScreenshot}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-colors"
                style={{ backgroundColor: '#1A1A2E', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Camera className="h-4 w-4" /> Screenshot this
              </button>
              <button
                onClick={() => setShowPast(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-colors"
                style={{ backgroundColor: '#1A1A2E', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Mail className="h-4 w-4" /> Past Letters
              </button>
            </div>
          </>
        )}
      </div>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
}
