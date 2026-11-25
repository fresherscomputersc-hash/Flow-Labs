import Link from 'next/link';
import { ArrowRight, Layers, Database, Cpu } from 'lucide-react';

export const metadata = {
  title: 'Services — Interfaces, Scaled Systems & Applied Intelligence | The Flow Labs',
  description: 'Three core engineering pillars built in-house: Interfaces (Web & Mobile), Systems (Cloud Platforms & PostgreSQL), and Applied Intelligence (AI & Automation). Fixed-price, 4 builds a month.',
};

export default function ServicesPage() {
  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-20">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          Engineering pillars
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium text-white tracking-tight leading-[1.1]">
          Three layers.<br />
          <span className="text-slate-400">One engineering studio.</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          We build digital products from scratch with zero delegation to junior contractors or middlemen. Every line of frontend, cloud infrastructure, and AI code is written in-house by our three founders.
        </p>
      </section>

      {/* Pillar 01: Interfaces */}
      <section id="frontend" className="p-7 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-xs">
              <Layers className="w-3.5 h-3.5" />
              <span>Frontend architecture</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-white">
              Interfaces &amp; design systems
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We design and engineer bespoke web and mobile interfaces that feel tactile, responsive, and immediate. No template bloat — every component is built for speed, accessibility, and fluid spatial micro-interactions.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-400 bg-white/[0.02] p-3.5 rounded-xl border border-white/10 space-y-1 min-w-[200px]">
            <div>Delivery: <strong className="text-white">2–3 weeks</strong></div>
            <div>Sprint cap: <strong className="text-slate-300">Locked scope</strong></div>
            <div>Stack: <strong className="text-white">Next.js 15 + Three.js</strong></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <h3 className="font-medium text-white text-sm">Spatial web experiences</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Interactive 3D geometry, responsive canvas shaders, and hardware-accelerated animations that load in sub-seconds.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <h3 className="font-medium text-white text-sm">Design systems</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Comprehensive Tailwind CSS tokens, obsidian dark themes, fluid typography, and consistent spacing hierarchies.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <h3 className="font-medium text-white text-sm">Sub-second paint times</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              100 Lighthouse performance scores, automatic image optimization, edge CDN caching, and minimal JS bundles.
            </p>
          </div>
        </div>
      </section>

      {/* Pillar 02: Systems */}
      <section id="backend" className="p-7 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-xs">
              <Database className="w-3.5 h-3.5" />
              <span>Cloud &amp; backend systems</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-white">
              Scaled cloud &amp; distributed platforms
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Robust backend foundations built for durability and scale. We construct relational schemas, real-time message streams, authentication boundaries, and automated billing pipelines that stay up under heavy load.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-400 bg-white/[0.02] p-3.5 rounded-xl border border-white/10 space-y-1 min-w-[200px]">
            <div>Delivery: <strong className="text-white">3–4 weeks</strong></div>
            <div>Database: <strong className="text-slate-300">PostgreSQL + RLS</strong></div>
            <div>Uptime SLA: <strong className="text-white">99.98%</strong></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <h3 className="font-medium text-white text-sm">PostgreSQL &amp; Row-Level Security</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Normalized relational schemas, index optimization, real-time change data capture, and bulletproof user tenant isolation.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <h3 className="font-medium text-white text-sm">Distributed message brokers</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Redis caches, queue workers, webhook consumers, and idempotent background event processing.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <h3 className="font-medium text-white text-sm">Automated billing &amp; GST</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Razorpay, Stripe, and custom automated GST invoicing engines with ledger reconciliation.
            </p>
          </div>
        </div>
      </section>

      {/* Pillar 03: Intelligence */}
      <section id="ai" className="p-7 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-xs">
              <Cpu className="w-3.5 h-3.5" />
              <span>Applied intelligence</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-white">
              Autonomous AI workflows &amp; RAG pipelines
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We convert manual business operations into deterministic software workflows. From contextual document retrieval to custom fine-tuned assistant bots integrated directly into WhatsApp and internal tooling.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-400 bg-white/[0.02] p-3.5 rounded-xl border border-white/10 space-y-1 min-w-[200px]">
            <div>Delivery: <strong className="text-white">2–3 weeks</strong></div>
            <div>Model providers: <strong className="text-slate-300">Claude 3.5, OpenAI</strong></div>
            <div>Vector DB: <strong className="text-white">pgvector</strong></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <h3 className="font-medium text-white text-sm">Contextual RAG engines</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              pgvector embeddings, semantic search, hybrid re-ranking, and grounded generation with zero hallucination leaks.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <h3 className="font-medium text-white text-sm">Meta Cloud API WhatsApp bots</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Official WhatsApp Business Cloud integration with autonomous CRM lead capture, dynamic templates, and human handoff.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <h3 className="font-medium text-white text-sm">Autonomous self-healing scripts</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Scheduled background scrapers, data normalizers, error recovery loops, and operational health alerts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
        <h2 className="font-display text-2xl font-medium text-white">
          Ready to scope your engineering sprint?
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Select your requirements in our scoping cockpit for an instant fixed-price estimate and delivery timeline.
        </p>
        <div className="pt-2">
          <Link
            href="/scoping"
            className="inline-flex items-center gap-2 bg-white text-[#07090E] font-medium text-sm px-5 py-2.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <span>Launch scoping cockpit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
