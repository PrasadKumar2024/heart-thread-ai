import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import solinLogo from '@/assets/solin-logo.png';

export default function Terms() {
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

        <h1 className="text-2xl font-semibold mb-1">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <Section title="1. Acceptance">
            <p>By using SOLIN you agree to these terms. If you disagree, please do not use the app.</p>
          </Section>

          <Section title="2. What SOLIN Is">
            <p>SOLIN is an AI companion app for emotional support and conversation. It is <strong className="text-foreground">NOT</strong> a substitute for professional mental health treatment or therapy.</p>
            <p>If you are in crisis, please contact a mental health professional or emergency services immediately.</p>
          </Section>

          <Section title="3. Your Account">
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate information</li>
              <li>You are responsible for your account</li>
              <li>You must be at least 13 years old</li>
              <li>One account per person</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use SOLIN for illegal purposes</li>
              <li>Share harmful or abusive content</li>
              <li>Attempt to hack or disrupt the app</li>
              <li>Create multiple accounts to circumvent free message limits</li>
              <li>Resell or redistribute the service</li>
            </ul>
          </Section>

          <Section title="5. Subscription and Payments">
            <ul className="list-disc pl-5 space-y-1">
              <li>Free plan: 20 messages per day</li>
              <li>Premium plan: $9.99/month or $89.99/year</li>
              <li>Payments processed by Dodo Payments</li>
              <li>Subscriptions auto-renew until cancelled</li>
              <li>Cancel anytime from your profile</li>
            </ul>
          </Section>

          <Section title="6. Refund Policy">
            <p>Refunds are available within 7 days of initial purchase if you are not satisfied. Contact us at <a href="mailto:pk9829922@gmail.com" className="text-primary hover:underline">pk9829922@gmail.com</a></p>
          </Section>

          <Section title="7. AI Conversations">
            <p>Conversations are powered by Google Gemini AI. Responses are AI-generated and may not always be accurate. SOLIN companions are not real people. Do not make important life decisions based solely on AI responses.</p>
          </Section>

          <Section title="8. Mental Health Disclaimer">
            <p>SOLIN provides emotional support through AI conversation only. We are not licensed therapists. We are not a crisis service. In emergencies, call your local emergency number or crisis line.</p>
          </Section>

          <Section title="9. Intellectual Property">
            <p>SOLIN app, logo, and content are owned by Prasad Kumar. Your conversation content belongs to you.</p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>SOLIN is provided as-is. We are not liable for any damages arising from use of the app. Maximum liability is limited to the amount you paid in the last 30 days.</p>
          </Section>

          <Section title="11. Termination">
            <p>We may suspend accounts that violate these terms. You may delete your account anytime.</p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>We may update these terms. Continued use means acceptance.</p>
          </Section>

          <Section title="13. Contact">
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
