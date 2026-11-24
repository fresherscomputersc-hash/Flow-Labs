import Link from 'next/link';
import { ArrowRight, Layers, Database, Cpu, ShieldCheck, Zap, Users, Clock } from 'lucide-react';
import { HeroFlowCanvas } from '@/components/3d/HeroFlowCanvas';

export default function HomePage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-28">
      
      {/* ================= 1. HERO SECTION ================= */}
      <section className="text-center max-w-4xl mx-auto pt-6 sm:pt-10">
        
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md mb-6">
          <span className="w-2 h-2 rounded-full bg-neon-emerald animate-radar shadow-[0_0_8px_#10B981]"></span>
          <span className="font-mono text-xs uppercase tracking-wider text-neon-cyan font-medium">
            Founder-Led Studio · 4 Builds / Month · 100% In-House
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6">
          Engineering interfaces, scaled systems &amp;{' '}
          <span className="bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent">
            applied intelligence.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          A three-person engineering studio building digital products for ambitious teams. Zero account layers, fixed pricing, and direct collaboration with the founders writing your code.
        </p>

        {/* 3D SPATIAL FLOW ENGINE (HERO ONLY) */}
        <HeroFlowCanvas />

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 mb-14">
          <Link
            href="/scoping"
            className="inline-flex items-center gap-2 bg-white text-[#07090E] font-semibold text-sm px-6 py-3 rounded-full hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_4px_20px_rgba(255,255,255,0.25)]"
          >
            <span>Launch Scoping Cockpit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium text-sm px-6 py-3 rounded-full border border-white/10 backdrop-blur-md transition-all hover:scale-105"
          >
            <span>Inspect Case Studies</span>
          </Link>
        </div>

        {/* Studio Telemetry HUD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
          <div className="text-center p-3">
            <div className="font-display text-2xl sm:text-3xl font-bold text-white">0%</div>
            <div className="font-mono text-xs text-slate-400 uppercase tracking-wider mt-1">Outsourced Code</div>
          </div>
          <div className="text-center p-3 border-l border-white/10">
            <div className="font-display text-2xl sm:text-3xl font-bold text-white">4<span className="text-sm text-neon-cyan">/mo</span></div>
            <div className="font-mono text-xs text-slate-400 uppercase tracking-wider mt-1">Production Cap</div>
          </div>
          <div className="text-center p-3 border-l border-white/10">
            <div className="font-display text-2xl sm:text-3xl font-bold text-white">3</div>
            <div className="font-mono text-xs text-slate-400 uppercase tracking-wider mt-1">Founders Building</div>
          </div>
          <div className="text-center p-3 border-l border-white/10">
            <div className="font-display text-2xl sm:text-3xl font-bold text-white">48<span className="text-sm text-neon-emerald">h</span></div>
            <div className="font-mono text-xs text-slate-400 uppercase tracking-wider mt-1">Direct Scoping SLA</div>
          </div>
        </div>

      </section>

      {/* ================= 2. SERVICES HIGHLIGHT (DEDICATED TEASER) ================= */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-neon-cyan uppercase tracking-widest font-semibold">Studio Architecture</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">Three engineering layers. One team.</h2>
            <p className="text-slate-400 text-sm max-w-xl mt-2">
              Every product we engineer spans three interconnected layers, designed from first principles with zero subcontracting.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-neon-cyan hover:text-white transition-colors"
          >
            <span>Explore All Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Layer 01 */}
          <div className="p-7 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs text-slate-400 uppercase">Layer 01 // Frontend</span>
            <h3 className="font-display text-xl font-bold text-white">Interfaces &amp; Design Systems</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Kinetic, high-performance web applications built with micro-interactions, responsive fluid typography, and sub-second paint times.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['TypeScript', 'Next.js 15', 'Tailwind', 'Three.js'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 font-mono text-[11px] text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Layer 02 */}
          <div className="p-7 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center text-neon-blue">
              <Database className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs text-slate-400 uppercase">Layer 02 // Backend</span>
            <h3 className="font-display text-xl font-bold text-white">Scaled Cloud &amp; Systems</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Robust backend APIs, relational PostgreSQL schemas, real-time message brokers, and infrastructure designed for enterprise load.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['PostgreSQL', 'FastAPI', 'Supabase', 'Docker', 'Redis'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 font-mono text-[11px] text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Layer 03 */}
          <div className="p-7 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-neon-purple/15 border border-neon-purple/30 flex items-center justify-center text-neon-purple">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="font-mono text-xs text-slate-400 uppercase">Layer 03 // Intelligence</span>
            <h3 className="font-display text-xl font-bold text-white">Applied AI &amp; Automation</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Autonomous LLM workflows, vector search embeddings, custom fine-tuned tools, and self-healing automation pipelines.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Claude 3.5', 'pgvector', 'RAG Pipelines', 'Meta Cloud API'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 font-mono text-[11px] text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. FEATURED WORK TEASER ================= */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-neon-cyan uppercase tracking-widest font-semibold">Production Portfolio</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">Shipped software. Operating live.</h2>
            <p className="text-slate-400 text-sm max-w-xl mt-2">
              Real platforms handling actual users, high transaction volume, and operational complexity.
            </p>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-neon-cyan hover:text-white transition-colors"
          >
            <span>View Full Work Showroom</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Droovee */}
          <div className="md:col-span-8 p-7 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neon-cyan uppercase tracking-wider">Production Flagship // Mobility</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-radar"></span>
                LIVE IN PRODUCTION
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Droovee — On-Demand Chauffeur Booking Platform</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Complete end-to-end multi-role web platform powering premium chauffeur reservations. Features real-time distance calculations, dynamic pricing algorithms, customer self-service portal, and operational fleet dispatch.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Full-Stack Next.js', 'Supabase Realtime', 'Dynamic Invoicing', 'PostgreSQL'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 font-mono text-[11px] text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Drishti */}
          <div className="md:col-span-4 p-7 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neon-purple uppercase tracking-wider">Computer Vision</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-mono">
                IN-HOUSE LAB
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-white">Drishti AI</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Autonomous multi-stream computer vision telemetry system for physical inspection and real-time anomaly detection.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['YOLOv8', 'FastAPI', 'WebRTC'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 font-mono text-[11px] text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. FOUNDERS & MANIFESTO TEASER ================= */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-neon-cyan uppercase tracking-widest font-semibold">Studio Leadership</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">Three Founders. Zero Account Layers.</h2>
            <p className="text-slate-400 text-sm max-w-xl mt-2">
              Direct access to the engineers writing your code. Capped at 4 concurrent builds a month.
            </p>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-neon-cyan hover:text-white transition-colors"
          >
            <span>Read Our Full Story</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-neon-blue flex items-center justify-center font-mono font-bold text-white text-sm">
                SR
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Smruti Ranjan</div>
                <div className="font-mono text-xs text-neon-cyan">Founder · Systems &amp; AI</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Architects high-throughput backends, distributed PostgreSQL schemas, and custom AI inference pipelines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-700 to-neon-emerald flex items-center justify-center font-mono font-bold text-white text-sm">
                BW
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Biswash</div>
                <div className="font-mono text-xs text-neon-emerald">Co-Founder · Scaled Cloud</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Oversees cloud infrastructure, continuous deployment reliability, and enterprise platform security.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-700 to-neon-purple flex items-center justify-center font-mono font-bold text-white text-sm">
                AP
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Arpita</div>
                <div className="font-mono text-xs text-neon-purple">Co-Founder · Interfaces &amp; UX</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Crafts kinetic user experiences, ThreeUI spatial web applications, and precision design systems.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 5. SCOPING COCKPIT TEASER ================= */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/40 via-[#0A0D18]/90 to-cyan-950/30 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-center space-y-6">
        <span className="font-mono text-xs text-neon-cyan uppercase tracking-wider font-semibold">
          Interactive Studio Telemetry
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white max-w-2xl mx-auto">
          Project Scoping Cockpit.
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Configure your product requirements, select domain architecture modules, and synthesize real-time cost and timeline estimates with an upfront fixed-price guarantee.
        </p>
        <div>
          <Link
            href="/scoping"
            className="inline-flex items-center gap-2 bg-white text-[#07090E] font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_0_25px_rgba(6,182,212,0.3)]"
          >
            <span>Open Dedicated Cockpit &rarr;</span>
          </Link>
        </div>
      </section>

      {/* ================= 6. ENGINEERING BLOG TEASER ================= */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-neon-cyan uppercase tracking-widest font-semibold">Perspectives &amp; Code</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">Engineering Blog.</h2>
            <p className="text-slate-400 text-sm max-w-xl mt-2">
              Direct perspectives on software architecture, AI automation, and shipping products.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-neon-cyan hover:text-white transition-colors"
          >
            <span>Read All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/blog/how-to-plan-a-website-for-a-new-startup"
            className="p-6 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl hover:border-white/25 transition-all space-y-3 block group"
          >
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-neon-cyan font-medium">Web Strategy</span>
              <span className="text-slate-500">6 MIN READ</span>
            </div>
            <h3 className="font-display text-lg font-bold text-white group-hover:text-neon-cyan transition-colors">
              How to Plan a Website for a New Startup
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              How to plan a startup website that actually gets you customers: primary jobs, must-have pages, and conversion copy.
            </p>
          </Link>

          <Link
            href="/blog/custom-software-vs-ready-made-software"
            className="p-6 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl hover:border-white/25 transition-all space-y-3 block group"
          >
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-neon-blue font-medium">Systems</span>
              <span className="text-slate-500">8 MIN READ</span>
            </div>
            <h3 className="font-display text-lg font-bold text-white group-hover:text-neon-cyan transition-colors">
              Custom Software vs Ready-Made Software
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Custom software versus off-the-shelf SaaS compared honestly: long-term cost curves and the five questions that decide it.
            </p>
          </Link>

          <Link
            href="/blog/ai-automation-for-small-businesses"
            className="p-6 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl hover:border-white/25 transition-all space-y-3 block group"
          >
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-neon-purple font-medium">Applied AI</span>
              <span className="text-slate-500">5 MIN READ</span>
            </div>
            <h3 className="font-display text-lg font-bold text-white group-hover:text-neon-cyan transition-colors">
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
