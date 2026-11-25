import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Bhubaneswar Engineering Studio | The Flow Labs',
  description: 'Digital engineering studio in Infocity, Bhubaneswar. Three founders building web applications, scalable cloud infrastructure and applied intelligence.',
};

export default function BhubaneswarPage() {
  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-5xl mx-auto space-y-16">
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <MapPin className="w-3.5 h-3.5" />
          <span>Infocity · Bhubaneswar · Odisha</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium text-white tracking-tight leading-[1.1]">
          Engineering in Bhubaneswar.<br />
          <span className="text-slate-400">Delivering globally.</span>
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          The Flow Labs is an independent founder-led engineering studio based in Bhubaneswar. We design, code, and deploy high-performance software for startups and ambitious teams worldwide.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <h3 className="font-display text-lg font-medium text-white">Interfaces</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Responsive frontends, high-speed Next.js suites, and 60fps interactive web applications.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <h3 className="font-display text-lg font-medium text-white">Systems</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            PostgreSQL relational schemas, row-level security, real-time message brokers, and enterprise APIs.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <h3 className="font-display text-lg font-medium text-white">Intelligence</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Vector embeddings, custom AI RAG pipelines, and automated WhatsApp Meta Cloud bots.
          </p>
        </div>
      </section>

      <div className="text-center pt-4">
        <Link
          href="/scoping"
          className="inline-flex items-center gap-2 bg-white text-[#07090E] font-medium text-sm px-5 py-2.5 rounded-full hover:bg-slate-200 transition-colors"
        >
          <span>Scope your next build</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
