import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import solinLogo from '@/assets/solin-logo.png';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-col items-center mb-8">
          <img src={solinLogo} alt="SOLIN" className="w-12 h-12 rounded-xl mb-3" />
          <h1 className="text-2xl font-semibold text-foreground">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-1">Last updated: April 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <Section title="1. Introduction">
            <p>
              This Privacy Policy describes how SOLIN ("we", "our", or "us") collects, uses, and protects
              your personal information when you use our AI companion application. By using SOLIN, you
              consent to the practices described in this policy.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account information:</strong> Name and email address collected at registration.</li>
              <li><strong>Google OAuth data:</strong> If you sign in with Google, we receive your name, email, and profile picture from Google.</li>
              <li><strong>Conversation data:</strong> Messages you send to AI companions are stored securely to provide conversation history and memory features.</li>
              <li><strong>Usage data:</strong> How you interact with the app, including message counts and feature usage.</li>
              <li><strong>Payment information:</strong> Handled securely by Dodo Payments — we never store your card details.</li>
              <li><strong>Device information:</strong> Browser type, device type, and IP address collected automatically.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and improve the AI companion service.</li>
              <li>To authenticate your account and maintain security.</li>
              <li>To process payments and manage subscriptions.</li>
              <li>To send important service updates and notifications.</li>
              <li>We <strong>never sell</strong> your personal data to third parties.</li>
              <li>We <strong>never use</strong> your conversations for advertising purposes.</li>
            </ul>
          </Section>

          <Section title="4. Data Storage and Security">
            <ul className="list-disc pl-5 space-y-2">
              <li>Data is stored securely using industry-standard infrastructure with encryption in transit (HTTPS/TLS) and at rest.</li>
              <li>Access controls and Row Level Security ensure your data is isolated from other users.</li>
              <li>We retain your data as long as your account is active. Upon account deletion, all associated data is permanently removed.</li>
            </ul>
          </Section>

          <Section title="5. Third-Party Services">
            <p>We use the following trusted third-party services, each with their own privacy policies:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Supabase</strong> — database and authentication infrastructure.</li>
              <li><strong>Google OAuth</strong> — sign-in authentication.</li>
              <li><strong>Dodo Payments</strong> — payment processing.</li>
              <li><strong>Google Gemini AI</strong> — generating AI companion responses.</li>
            </ul>
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Access your personal data at any time through your profile.</li>
              <li>Correct inaccurate information in your account settings.</li>
              <li>Delete your account and all associated data permanently.</li>
              <li>Export your conversation data.</li>
              <li>Withdraw consent at any time by deleting your account.</li>
            </ul>
            <p className="mt-3">
              <strong>For EU users (GDPR):</strong> You have additional rights including data portability,
              the right to restrict processing, and the right to lodge a complaint with a supervisory authority.
            </p>
            <p className="mt-2">
              <strong>For California users (CCPA):</strong> You have the right to know what personal information
              is collected, request deletion, and opt out of the sale of personal information (we do not sell your data).
            </p>
          </Section>

          <Section title="7. Conversation Privacy">
            <ul className="list-disc pl-5 space-y-2">
              <li>Your conversations are private and encrypted.</li>
              <li>Conversations are <strong>not shared</strong> with any third party.</li>
              <li>Conversations are <strong>not used</strong> to train AI models.</li>
              <li>You can delete all conversation history at any time.</li>
            </ul>
          </Section>

          <Section title="8. Children's Privacy">
            <p>
              SOLIN is not intended for users under 13 years of age. We do not knowingly collect
              personal information from children under 13. If we become aware that we have collected
              data from a child under 13, we will promptly delete it.
            </p>
          </Section>

          <Section title="9. Cookies and Tracking">
            <ul className="list-disc pl-5 space-y-2">
              <li>We use essential cookies for authentication and session management only.</li>
              <li>We do <strong>not</strong> use advertising or tracking cookies.</li>
              <li>No third-party analytics or tracking scripts are embedded.</li>
            </ul>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify users of significant
              changes via email. Continued use of SOLIN after changes constitutes acceptance of the
              updated policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              For questions about this privacy policy, data deletion requests, or privacy concerns,
              contact us at:{' '}
              <a href="mailto:pk9829922@gmail.com" className="text-primary hover:underline">
                pk9829922@gmail.com
              </a>
            </p>
          </Section>
        </div>

        <footer className="mt-12 border-t border-border pt-6 pb-8 text-center text-xs text-muted-foreground space-y-2">
          <p>© {new Date().getFullYear()} SOLIN. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      {children}
    </section>
  );
}
