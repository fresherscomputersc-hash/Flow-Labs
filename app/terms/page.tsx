export const metadata = {
  title: 'Terms of Service | The Flow Labs',
  description: 'Terms of Service for The Flow Labs software engineering studio.',
};

export default function TermsPage() {
  return (
    <div className="pt-36 pb-24 px-4 sm:px-6 max-w-3xl mx-auto space-y-8 font-body text-slate-300">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
      <p className="text-sm font-mono text-slate-500">Last updated: November 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          Welcome to <strong>The Flow Labs</strong>. By using our website and services, you agree to these terms.
        </p>
        <h2 className="font-display text-xl font-bold text-white pt-4">1. Studio Commitments</h2>
        <p>
          We operate as a founder-led engineering studio capped at 4 concurrent client builds per month. Every custom build contract includes a locked milestone scope, agreed deliverables, and upfront fixed pricing.
        </p>
        <h2 className="font-display text-xl font-bold text-white pt-4">2. Intellectual Property</h2>
        <p>
          Upon final milestone payment, all custom source code, database schemas, and interface assets developed for client projects are transferred 100% to the client.
        </p>
        <h2 className="font-display text-xl font-bold text-white pt-4">3. Contact</h2>
        <p>
          Inquiries regarding project terms should be directed to <a href="mailto:hello@theflowlabs.online" className="text-neon-cyan underline">hello@theflowlabs.online</a>.
        </p>
      </div>
    </div>
  );
}
