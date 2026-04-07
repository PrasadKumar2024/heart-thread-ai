import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import solinLogo from '@/assets/solin-logo.png';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src={solinLogo} alt="SOLIN" className="w-8 h-8 rounded-lg" />
          <span className="text-sm font-light tracking-[3px]" style={{ color: '#F5A623' }}>SOLIN</span>
        </div>

        <h1 className="text-2xl font-semibold mb-1">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <Section title="1. Who We Are">
            <p>SOLIN is an AI emotional companion app. We are operated by Prasad Kumar.</p>
            <p>Contact: <a href="mailto:pk9829922@gmail.com" className="text-primary hover:underline">pk9829922@gmail.com</a></p>
          </Section>

          <Section title="2. What Data We Collect">
            <ul className="list-disc pl-5 space-y-1">
              <li>Name and email address (at signup)</li>
              <li>Conversation messages you send</li>
              <li>Payment information (processed securely by Dodo Payments — we never store card details)</li>
              <li>Usage data (messages count, last active date)</li>
              <li>Device and browser information</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide the AI companion service</li>
              <li>To remember your conversation history</li>
              <li>To process your subscription payment</li>
              <li>To improve the app experience</li>
              <li>We never sell your data to anyone</li>
            </ul>
          </Section>

          <Section title="4. Third Party Services">
            <p>We use these trusted services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Google Gemini AI (powers conversations)</li>
              <li>Dodo Payments (processes payments)</li>
              <li>Supabase (stores data securely)</li>
              <li>Lovable (app hosting)</li>
            </ul>
          </Section>

          <Section title="5. Data Storage and Security">
            <p>Your data is stored securely. All connections are encrypted (HTTPS). We follow industry standard security practices.</p>
          </Section>

          <Section title="6. Your Rights">
            <p>You can request:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access to your data</li>
              <li>Deletion of your account and data</li>
              <li>Export of your conversation history</li>
            </ul>
            <p>Contact us at <a href="mailto:pk9829922@gmail.com" className="text-primary hover:underline">pk9829922@gmail.com</a></p>
          </Section>

          <Section title="7. Conversation Data">
            <p>Your conversations with AI companions are stored to provide memory features. Premium users retain full history. You can delete conversations anytime.</p>
          </Section>

          <Section title="8. Payments">
            <p>Payments are handled by Dodo Payments. We never see or store your card details. Subscriptions can be cancelled anytime.</p>
          </Section>

          <Section title="9. Children">
            <p>SOLIN is not intended for users under 13 years of age.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this policy. We will notify users of major changes. Continued use means you accept changes.</p>
          </Section>

          <Section title="11. Contact">
            <p>Email: <a href="mailto:pk9829922@gmail.com" className="text-primary hover:underline">pk9829922@gmail.com</a></p>
          </Section>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 SOLIN · <a href="mailto:pk9829922@gmail.com" className="hover:underline">pk9829922@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-medium text-foreground mb-2">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
