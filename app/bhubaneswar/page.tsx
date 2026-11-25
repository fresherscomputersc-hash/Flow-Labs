import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Bhubaneswar Engineering Studio | The Flow Labs',
  description: 'Digital engineering studio in Infocity, Bhubaneswar. Three founders building web applications, scalable cloud infrastructure, and applied intelligence.',
  alternates: {
    canonical: '/bhubaneswar',
  },
};

export default function BhubaneswarPage() {
  return (
    <div className="pt-28 pb-28 px-4 sm:px-6 max-w-5xl mx-auto space-y-24">
      <section className="max-w-3xl space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-300" />
          <span>Infocity, Bhubaneswar, Odisha</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-normal text-white tracking-tight leading-[1.08]">
          Engineering in Bhubaneswar, delivering globally.
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
          The Flow Labs is an independent founder-led engineering studio based in Bhubaneswar. We design, code, and deploy high-performance software for startups and ambitious teams worldwide with an upfront fixed-scope guarantee.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <div className="font-mono text-xs text-slate-400">Layer 01</div>
          <h3 className="font-display text-xl font-normal text-white">Interfaces</h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Responsive frontends, high-speed Next.js suites, and 60fps interactive web applications with sub-second paint budgets.
          </p>
        </div>
        <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <div className="font-mono text-xs text-slate-400">Layer 02</div>
          <h3 className="font-display text-xl font-normal text-white">Systems</h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            PostgreSQL relational schemas, row-level security, real-time message brokers, and automated billing engines.
          </p>
        </div>
        <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <div className="font-mono text-xs text-slate-400">Layer 03</div>
          <h3 className="font-display text-xl font-normal text-white">Intelligence</h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Vector embeddings, custom AI RAG pipelines, and automated WhatsApp Meta Cloud bots with zero hallucinations.
          </p>
        </div>
      </section>

      <div className="p-8 sm:p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
        <span className="font-mono text-xs text-slate-400">Local and global sprint builds</span>
        <h2 className="font-display text-2xl sm:text-4xl font-normal text-white max-w-xl mx-auto">
          Scope your next build with our founders
        </h2>
        <div className="pt-2">
          <Link
            href="/scoping"
            className="inline-flex items-center gap-2 bg-white text-[#07090E] font-medium text-sm px-6 py-2.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <span>Launch scoping cockpit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
