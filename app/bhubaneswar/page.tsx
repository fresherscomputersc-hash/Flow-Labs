import Link from 'next/link';
import { MapPin, Code2, Cpu, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Bhubaneswar Engineering Studio | The Flow Labs',
  description: 'Digital engineering studio in Infocity, Bhubaneswar. Three founders building web applications, scalable cloud infrastructure and applied intelligence.',
};

export default function BhubaneswarPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 max-w-5xl mx-auto space-y-16">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neon-cyan font-mono text-xs uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" />
          <span>Infocity · Bhubaneswar · Odisha</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight">
          Engineering in Bhubaneswar.<br />
          <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
            Delivering globally.
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          The Flow Labs is an independent founder-led engineering studio based in Bhubaneswar. We design, code, and deploy high-performance software for startups and ambitious teams worldwide.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-3">
          <h3 className="font-display text-lg font-bold text-white">Interfaces</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Kinetic frontends, high-speed Next.js suites, and 60fps ThreeUI spatial web applications.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-3">
          <h3 className="font-display text-lg font-bold text-white">Systems</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            PostgreSQL relational schemas, row-level security, real-time message brokers, and enterprise APIs.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-3">
          <h3 className="font-display text-lg font-bold text-white">Intelligence</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Vector embeddings, custom AI RAG pipelines, and automated WhatsApp Meta Cloud bots.
          </p>
        </div>
      </section>

      <div className="text-center pt-8">
        <Link
          href="/scoping"
          className="inline-flex items-center gap-2 bg-white text-[#07090E] font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-slate-200 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.25)]"
        >
          <span>Scope Your Next Build &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
