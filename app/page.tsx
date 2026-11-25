import Link from 'next/link';
import { ArrowRight, Layers, Database, Cpu } from 'lucide-react';
import { HeroFlowBackground } from '@/components/3d/HeroFlowBackground';

export default function HomePage() {
  return (
    <div className="pt-24 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-24">
      
      {/* ================= 1. HERO SECTION (INTEGRATED FLUID 3D ANIMATION) ================= */}
      <section className="relative text-center max-w-3xl mx-auto pt-6 sm:pt-14 pb-4">
        {/* 3D Flow Background Canvas (spans hero, no separate box) */}
        <HeroFlowBackground />

        {/* Studio Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-6 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="font-mono text-xs text-slate-300">
            Founder-led studio · 4 builds a month · 100% in-house
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-display text-4xl sm:text-6xl font-medium tracking-tight text-white leading-[1.1] mb-5">
          Engineering interfaces, scaled systems &amp;{' '}
          <span className="text-slate-400">applied intelligence.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-9">
          A three-person engineering studio building digital products for ambitious teams. Zero account managers, fixed sprint pricing, and direct collaboration with the founders writing your code.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <Link
            href="/scoping"
            className="inline-flex items-center gap-2 bg-white text-[#07090E] font-medium text-sm px-5 py-2.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <span>Launch scoping cockpit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium text-sm px-5 py-2.5 rounded-full border border-white/10 transition-colors backdrop-blur-sm"
          >
            <span>Inspect case studies</span>
          </Link>
        </div>

        {/* Studio Telemetry HUD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
          <div className="text-center p-2.5">
            <div className="font-display text-2xl font-medium text-white tracking-tight">0%</div>
            <div className="font-mono text-[11px] text-slate-400 mt-0.5">Outsourced code</div>
          </div>
          <div className="text-center p-2.5 border-l border-white/5">
            <div className="font-display text-2xl font-medium text-white tracking-tight">4<span className="text-xs text-slate-400">/mo</span></div>
            <div className="font-mono text-[11px] text-slate-400 mt-0.5">Production cap</div>
          </div>
          <div className="text-center p-2.5 border-l border-white/5">
            <div className="font-display text-2xl font-medium text-white tracking-tight">3</div>
            <div className="font-mono text-[11px] text-slate-400 mt-0.5">Founders building</div>
          </div>
          <div className="text-center p-2.5 border-l border-white/5">
            <div className="font-display text-2xl font-medium text-white tracking-tight">48<span className="text-xs text-slate-400">h</span></div>
            <div className="font-mono text-[11px] text-slate-400 mt-0.5">Direct scoping SLA</div>
          </div>
        </div>

      </section>

      {/* ================= 2. SERVICES HIGHLIGHT ================= */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <span className="font-mono text-xs text-slate-400 font-medium">Architecture</span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-white mt-1">Three engineering layers. One studio.</h2>
            <p className="text-slate-400 text-sm max-w-xl mt-1.5">
              Every product spans three connected layers, built from first principles with zero subcontracting.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <span>Explore all services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Frontend */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
              <Layers className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[11px] text-slate-400">Frontend</span>
              <h3 className="font-display text-lg font-medium text-white">Interfaces &amp; design systems</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Fast web applications built with TypeScript, micro-interactions, responsive fluid typography, and sub-second paint times.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['TypeScript', 'Next.js 15', 'Tailwind', 'Three.js'].map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[11px] text-slate-400">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Backend */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
              <Database className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[11px] text-slate-400">Backend</span>
              <h3 className="font-display text-lg font-medium text-white">Scaled cloud &amp; systems</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Relational PostgreSQL schemas, secure row-level policies, real-time message brokers, and APIs designed for scale.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['PostgreSQL', 'FastAPI', 'Supabase', 'Docker', 'Redis'].map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[11px] text-slate-400">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Intelligence */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[11px] text-slate-400">Intelligence</span>
              <h3 className="font-display text-lg font-medium text-white">Applied AI &amp; automation</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Production LLM workflows, vector embeddings, fine-tuned tool calling, and business process automation pipelines.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Claude 3.5', 'pgvector', 'RAG pipelines', 'Meta Cloud API'].map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[11px] text-slate-400">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. FEATURED WORK ================= */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <span className="font-mono text-xs text-slate-400 font-medium">Portfolio</span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-white mt-1">Shipped software operating live.</h2>
            <p className="text-slate-400 text-sm max-w-xl mt-1.5">
              Production platforms handling real users, transactions, and operational workflows.
            </p>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <span>View all case studies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Droovee */}
          <div className="md:col-span-8 p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400">Client flagship · Mobility</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Live in production
              </span>
            </div>
            <h3 className="font-display text-xl font-medium text-white">Droovee — On-Demand Chauffeur Platform</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Full-stack multi-role web platform powering premium chauffeur reservations. Features real-time distance calculations, dynamic pricing algorithms, customer self-service portal, and fleet dispatch.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {['Next.js 15', 'Supabase Realtime', 'Dynamic Invoicing', 'PostgreSQL'].map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[11px] text-slate-400">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Drishti */}
          <div className="md:col-span-4 p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400">Lab prototype</span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-[10px] font-mono">
                Telemetry
              </span>
            </div>
            <h3 className="font-display text-xl font-medium text-white">Drishti AI</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Autonomous multi-stream computer vision telemetry system for physical inspection and real-time anomaly detection.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {['YOLOv8', 'FastAPI', 'WebRTC'].map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[11px] text-slate-400">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. FOUNDERS ================= */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <span className="font-mono text-xs text-slate-400 font-medium">Leadership</span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-white mt-1">Three founders. Zero account layers.</h2>
            <p className="text-slate-400 text-sm max-w-xl mt-1.5">
              Direct access to the engineers writing your code. Capped at 4 concurrent builds a month.
            </p>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <span>Read our manifesto</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-slate-300">
                SR
              </div>
              <div>
                <div className="font-medium text-white text-sm">Smruti Ranjan</div>
                <div className="font-mono text-[11px] text-slate-400">Founder · Systems &amp; AI</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Architects high-throughput backends, distributed PostgreSQL schemas, and custom AI inference pipelines.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-slate-300">
                BW
              </div>
              <div>
                <div className="font-medium text-white text-sm">Biswash</div>
                <div className="font-mono text-[11px] text-slate-400">Co-founder · Cloud infra</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Oversees cloud infrastructure, continuous deployment reliability, and enterprise platform security.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-slate-300">
                AP
              </div>
              <div>
                <div className="font-medium text-white text-sm">Arpita</div>
                <div className="font-mono text-[11px] text-slate-400">Co-founder · Interfaces &amp; UX</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Crafts responsive user experiences, interactive 3D web applications, and precision design systems.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 5. SCOPING COCKPIT TEASER ================= */}
      <section className="p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-5">
        <span className="font-mono text-xs text-slate-400">
          Studio tool
        </span>
        <h2 className="font-display text-2xl sm:text-4xl font-medium text-white max-w-xl mx-auto">
          Project Scoping Cockpit
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
          Configure your product requirements, select architectural modules, and synthesize real-time cost and timeline estimates with an upfront fixed-price guarantee.
        </p>
        <div className="pt-2">
          <Link
            href="/scoping"
            className="inline-flex items-center gap-2 bg-white text-[#07090E] font-medium text-sm px-6 py-2.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <span>Open scoping cockpit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ================= 6. ENGINEERING BLOG ================= */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <span className="font-mono text-xs text-slate-400 font-medium">Perspectives</span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-white mt-1">Engineering articles</h2>
            <p className="text-slate-400 text-sm max-w-xl mt-1.5">
              Direct perspectives on software architecture, AI automation, and shipping products.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <span>Read all articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/blog/how-to-plan-a-website-for-a-new-startup"
            className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors space-y-2.5 block"
          >
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300">Web strategy</span>
              <span className="text-slate-500">6 min read</span>
            </div>
            <h3 className="font-display text-base font-medium text-white">
              How to Plan a Website for a New Startup
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              How to plan a startup website that actually gets you customers: primary jobs, must-have pages, and conversion copy.
            </p>
          </Link>

          <Link
            href="/blog/custom-software-vs-ready-made-software"
            className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors space-y-2.5 block"
          >
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300">Systems</span>
              <span className="text-slate-500">8 min read</span>
            </div>
            <h3 className="font-display text-base font-medium text-white">
              Custom Software vs Ready-Made Software
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Custom software versus off-the-shelf SaaS compared honestly: long-term cost curves and the five questions that decide it.
            </p>
          </Link>

          <Link
            href="/blog/ai-automation-for-small-businesses"
            className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors space-y-2.5 block"
          >
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300">Applied AI</span>
              <span className="text-slate-500">5 min read</span>
            </div>
            <h3 className="font-display text-base font-medium text-white">
              How Small Businesses Can Use AI Automation
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI automation explained practically: what to automate first, what to leave to humans, and realistic cost benchmarks.
            </p>
          </Link>
        </div>
      </section>

    </div>
  );
}
