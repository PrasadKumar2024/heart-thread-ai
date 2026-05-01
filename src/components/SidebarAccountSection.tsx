import { useCallback, useEffect, useRef, useState } from 'react';
import { MoreVertical, LogOut, User as UserIcon, Shield, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AccountInfo {
  name: string;
  email: string;
  joinedAt: string;
  messagesToday: number;
  premiumStatus: string;
}

export function SidebarAccountSection() {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const profileName = useAppStore((state) => state.profile.name);
  const resetAppState = useAppStore((state) => state.resetAppState);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);

  const loadAccountInfo = useCallback(async () => {
    setIsLoadingInfo(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) { setAccountInfo(null); return; }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, messages_today, is_premium')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      setAccountInfo({
        name: profileData?.name || profileName || user.email?.split('@')[0] || 'Account',
        email: user.email || '',
        joinedAt: user.created_at ? new Date(user.created_at).toLocaleDateString() : '—',
        messagesToday: profileData?.messages_today ?? 0,
        premiumStatus: profileData?.is_premium ? 'Premium' : 'Free',
      });
    } catch (error) {
      console.error('Failed to load account info:', error);
    } finally {
      setIsLoadingInfo(false);
    }
  }, [profileName]);

  useEffect(() => { void loadAccountInfo(); }, [loadAccountInfo]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const displayName = accountInfo?.name || profileName || 'Account';
  const displayEmail = accountInfo?.email || 'Signed in';
  const avatarLetter = (displayName[0] || displayEmail[0] || 'S').toUpperCase();

  const handleOpenProfile = async () => {
    setMenuOpen(false);
    setProfileOpen(true);
    await loadAccountInfo();
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      resetAppState();
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setSignOutOpen(false);
      setMenuOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      if (!data?.success) throw new Error('Deletion failed');

      await supabase.auth.signOut();
      resetAppState();
      setDeleteOpen(false);
      toast.success('Your account has been permanently deleted.');
      navigate('/');
    } catch (err: any) {
      console.error('Delete account error:', err);
      toast.error(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="border-t border-border p-3">
        <div ref={wrapperRef} className="relative">
          {menuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl border border-border bg-card p-1 shadow-xl">
              <button type="button" onClick={handleOpenProfile}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary">
                <UserIcon className="h-4 w-4" /> Profile
              </button>
              <button type="button" onClick={() => { setMenuOpen(false); setSignOutOpen(true); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}

          <div role="button" tabIndex={0} onClick={() => setMenuOpen((o) => !o)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMenuOpen((o) => !o); } }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/70 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card font-display text-sm italic text-primary">
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              aria-label="Open account menu">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="border-border bg-card sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Profile</DialogTitle>
          </DialogHeader>
          {isLoadingInfo ? (
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Name', value: accountInfo?.name || '—' },
                { label: 'Email', value: accountInfo?.email || '—' },
                { label: 'Join date', value: accountInfo?.joinedAt || '—' },
                { label: 'Messages used today', value: String(accountInfo?.messagesToday ?? 0) },
                { label: 'Premium status', value: accountInfo?.premiumStatus || 'Free' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-secondary px-3 py-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-sm text-foreground">{item.value}</p>
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <a href="/privacy-policy" className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors flex-1">
                  <Shield className="h-4 w-4 text-muted-foreground" /> Privacy Policy
                </a>
                <a href="/terms-of-service" className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors flex-1">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Terms
                </a>
              </div>

              <button
                onClick={() => { setProfileOpen(false); setDeleteOpen(true); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors mt-2"
              >
                <Trash2 className="h-4 w-4" /> Delete Account
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sign Out Dialog */}
      <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <DialogContent className="border-border bg-card sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Sign out of SOLIN?</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setSignOutOpen(false)}>Cancel</Button>
            <Button type="button" className="flex-1" onClick={handleSignOut}>Sign out</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteConfirmText(''); }}>
        <DialogContent className="border-border bg-card sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm font-medium text-red-400">⚠️ This action is permanent and cannot be undone.</p>
            </div>
            <p className="text-sm text-foreground/80">The following will be permanently deleted:</p>
            <ul className="list-disc pl-5 text-sm text-foreground/70 space-y-1">
              <li>Your account and profile</li>
              <li>All conversations and messages</li>
              <li>All personal data</li>
            </ul>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Type <strong className="text-foreground">DELETE</strong> to confirm:</p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-red-500/50"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button
                type="button"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                onClick={handleDeleteAccount}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
