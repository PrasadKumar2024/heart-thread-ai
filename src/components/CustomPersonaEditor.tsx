import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomPersonaEditor({ open, onOpenChange }: Props) {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const [persona, setPersona] = useState(profile.customPersona || '');
  const [personaName, setPersonaName] = useState(profile.customPersonaName || 'My Person');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPersona(profile.customPersona || '');
      setPersonaName(profile.customPersonaName || 'My Person');
    }
  }, [open, profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ custom_persona: persona, custom_persona_name: personaName })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ customPersona: persona, customPersonaName: personaName });
      toast.success('Your person has been updated ✨');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="font-display text-lg italic text-foreground">Personalise Your Person</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Describe who you want them to be. The more detail you give, the more real they feel.
          </p>
          <input
            value={personaName}
            onChange={(e) => setPersonaName(e.target.value)}
            placeholder="Name (e.g. Alex)"
            className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder={"Example: Your name is Alex.\nYou're my honest best friend.\nYou're funny and sarcastic\nbut genuinely caring.\nYou give it to me straight\nwithout being harsh."}
            rows={8}
            className="w-full resize-none rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Apply'}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Your person remembers everything you've shared with them.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
