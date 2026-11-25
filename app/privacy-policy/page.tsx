export const metadata = {
  title: 'Privacy Policy | The Flow Labs',
  description: 'Privacy Policy for The Flow Labs. Zero tracking cookies, zero analytics surveillance.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="pt-36 pb-24 px-4 sm:px-6 max-w-3xl mx-auto space-y-8 font-body text-slate-300">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
      <p className="text-sm font-mono text-slate-500">Last updated: November 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          At <strong>The Flow Labs</strong>, we respect your privacy. We do not use third-party tracking cookies or surveillance analytics.
        </p>
        <h2 className="font-display text-xl font-bold text-white pt-4">1. Data We Collect</h2>
        <p>
          When you submit an inquiry through our Project Scoping Cockpit or email us, we collect your name, contact information (email or WhatsApp number), and the project details you voluntarily provide.
        </p>
        <h2 className="font-display text-xl font-bold text-white pt-4">2. How We Use Data</h2>
        <p>
          We use this data solely to prepare architecture estimates, communicate about your software build, and manage active client deliverables. We never sell, rent, or trade your contact information.
        </p>
        <h2 className="font-display text-xl font-bold text-white pt-4">3. Contact</h2>
        <p>
          For any privacy questions, email us at <a href="mailto:hello@theflowlabs.online" className="text-neon-cyan underline">hello@theflowlabs.online</a>.
        </p>
      </div>
    </div>
  );
}
