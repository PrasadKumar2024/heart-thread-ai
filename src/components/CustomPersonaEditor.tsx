import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      toast.success('Persona saved!');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg italic text-foreground">Describe your person</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            value={personaName}
            onChange={(e) => setPersonaName(e.target.value)}
            placeholder="Name (e.g. Alex)"
            className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="Example: Your name is Alex. You treat me like a best friend. You are funny and a little sarcastic. You love music and always check on me."
            rows={6}
            className="w-full resize-none rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
