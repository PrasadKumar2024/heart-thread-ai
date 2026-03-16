import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/lib/store";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import type { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const setProfile = useAppStore((s) => s.setProfile);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load profile when session exists
  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from('profiles')
      .select('name, goal, custom_persona, custom_persona_name, is_premium')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            name: data.name || '',
            goal: data.goal || '',
            onboarded: !!data.name,
            customPersona: data.custom_persona || undefined,
            customPersonaName: data.custom_persona_name || undefined,
            isPremium: data.is_premium || false,
          });
        }
      });
  }, [session?.user?.id, setProfile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="font-display text-2xl italic text-primary animate-pulse">solin</div>
      </div>
    );
  }

  if (!session) return <Auth />;

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthGate>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthGate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
