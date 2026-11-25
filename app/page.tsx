import Link from 'next/link';
import { ArrowRight, Layers, Database, Cpu, Terminal, Shield } from 'lucide-react';
import { HeroFlowBackground } from '@/components/3d/HeroFlowBackground';

export default function HomePage() {
  return (
    <div className="pt-24 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-32">
      
      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative text-center max-w-4xl mx-auto pt-8 sm:pt-16 pb-6">
        {/* Integrated 3D ambient particle wave canvas */}
        <HeroFlowBackground />

        {/* Studio Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="font-mono text-xs text-slate-300">
            Four production builds a month. 100% in-house.
          </span>
        </div>

        {/* Hero Headline (Solid, un-accented, authoritative typography) */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white leading-[1.08] mb-6">
          Engineering interfaces, scaled systems, and applied intelligence.
        </h1>

        {/* Subtitle with bounded line length */}
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
          We are a three-person engineering studio building digital products for ambitious teams. Zero account managers, fixed sprint pricing, and direct collaboration with the founders writing your code.
        </p>

        {/* Action CTAs (Clean, solid, no hover jump or glow) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <Link
            href="/scoping"
            className="inline-flex items-center gap-2 bg-white text-[#07090E] font-medium text-sm px-6 py-2.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <span>Scope your project</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium text-sm px-6 py-2.5 rounded-full border border-white/10 transition-colors"
          >
            <span>View shipped work</span>
          </Link>
        </div>

        {/* Studio Commitments (Clean horizontal telemetry, tabular figures) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
          <div className="text-left px-3 py-1">
            <div className="font-display text-2xl font-normal text-white">0%</div>
            <div className="text-xs text-slate-400 mt-0.5">Outsourced code</div>
          </div>
          <div className="text-left px-3 py-1 border-l border-white/5">
            <div className="font-display text-2xl font-normal text-white">4 / mo</div>
            <div className="text-xs text-slate-400 mt-0.5">Production cap</div>
          </div>
          <div className="text-left px-3 py-1 border-l border-white/5">
            <div className="font-display text-2xl font-normal text-white">3</div>
            <div className="text-xs text-slate-400 mt-0.5">Founders on duty</div>
          </div>
          <div className="text-left px-3 py-1 border-l border-white/5">
            <div className="font-display text-2xl font-normal text-white">48h</div>
            <div className="text-xs text-slate-400 mt-0.5">Direct scoping SLA</div>
          </div>
        </div>

      </section>

      {/* ================= 2. ASYMMETRIC SERVICES BREAKDOWN ================= */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Studio Architecture Philosophy */}
          <div className="lg:col-span-5 space-y-5">
            <span className="font-mono text-xs text-slate-400">Engineering layers</span>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-white leading-tight">
              A cohesive architecture stack. Built by one team.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Most projects fail in the handoff between frontend designers and backend contractors. We build the full vertical stack under one roof — ensuring database schemas, APIs, and user interfaces evolve in sync.
            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                <span>Read detailed architecture specs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Layer Stack */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Layer 1 */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-white">Interfaces &amp; Design Systems</h3>
                </div>
                <span className="font-mono text-xs text-slate-500">Next.js 15, Three.js</span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Tactile web applications built with micro-interactions, responsive typography, and sub-second paint times. No template bloat.
              </p>
            </div>

            {/* Layer 2 */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-white">Cloud Platforms &amp; Relational Schemas</h3>
                </div>
                <span className="font-mono text-xs text-slate-500">PostgreSQL, Supabase RLS</span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Normalized database schemas, row-level security boundaries, background queue workers, and automated GST billing pipelines.
              </p>
            </div>

            {/* Layer 3 */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-white">Applied Intelligence &amp; Autonomous Flows</h3>
                </div>
                <span className="font-mono text-xs text-slate-500">Claude 3.5, pgvector</span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Contextual RAG engines, vector search, Meta WhatsApp Cloud bots, and self-healing backend cron automation.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 3. PRODUCTION WORK SPOTLIGHT ================= */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-slate-400">Production cases</span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-white mt-1">
              Shipped software handling real transactions.
            </h2>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <span>View all case studies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Featured Case Study: Droovee */}
        <div className="p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-mono text-xs text-slate-400">Urban mobility platform</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live in production
            </span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-medium text-white">
            Droovee — On-Demand Chauffeur &amp; Fleet Operations Platform
          </h3>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            A complete multi-tenant digital transportation operating system powering premium chauffeur reservations. Features real-time distance calculation algorithms, driver assignment matrices, customer self-service, and automated GST invoicing.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Role</span>
              <strong className="text-white text-xs">Full Architecture</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Latency</span>
              <strong className="text-slate-300 text-xs">&lt; 120ms P95</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Database</span>
              <strong className="text-white text-xs">PostgreSQL + RLS</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Stack</span>
              <strong className="text-slate-300 text-xs">Next.js 15, Supabase</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. FOUNDERS & DIRECT ACCESS ================= */}
      <section className="space-y-6">
        <div>
          <span className="font-mono text-xs text-slate-400">Team</span>
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-white mt-1">
            Three founders. Direct engineering communication.
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mt-1.5">
            When you build with The Flow Labs, you work directly with the three founding engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white">
                SR
              </div>
              <div>
                <div className="font-medium text-white text-sm">Smruti Ranjan</div>
                <div className="text-xs text-slate-400">Founder, Systems and AI</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Architects high-throughput backends, distributed PostgreSQL schemas, and custom AI inference pipelines.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white">
                BW
              </div>
              <div>
                <div className="font-medium text-white text-sm">Biswash</div>
                <div className="text-xs text-slate-400">Co-founder, Cloud Systems</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Oversees cloud infrastructure, continuous deployment reliability, and enterprise platform security.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white">
                AP
              </div>
              <div>
                <div className="font-medium text-white text-sm">Arpita</div>
                <div className="text-xs text-slate-400">Co-founder, Interfaces and Design</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Crafts responsive user experiences, interactive 3D web applications, and precision design systems.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 5. SCOPING CALLOUT ================= */}
      <section className="p-8 sm:p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
        <span className="font-mono text-xs text-slate-400">Project Scoping Cockpit</span>
        <h2 className="font-display text-2xl sm:text-4xl font-medium text-white max-w-xl mx-auto">
          Calculate your build investment in seconds
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
          Select your architectural modules and synthesize an upfront fixed-price quote with guaranteed sprint delivery.
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

    </div>
  );
}
