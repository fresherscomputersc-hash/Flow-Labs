import Link from 'next/link';
import { ArrowRight, ShieldCheck, HeartHandshake, Zap, Target, MapPin } from 'lucide-react';

export const metadata = {
  title: 'About — Founders & Studio Manifesto | The Flow Labs',
  description: 'Meet The Flow Labs founders: Smruti Ranjan, Biswash and Arpita. A founder-led three-person studio building interfaces, systems and AI in-house. Capped at 4 builds a month.',
};

export default function AboutPage() {
  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-20">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          Studio manifesto &amp; team
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium text-white tracking-tight leading-[1.1]">
          Three founders.<br />
          <span className="text-slate-400">Zero account layers.</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          The Flow Labs was founded to reject the traditional agency model where senior partners sell the project, only to hand the work to junior contractors. When you hire us, you work directly with the three founders writing your code.
        </p>
      </section>

      {/* Founders Grid */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="font-mono text-xs text-slate-400 font-medium">Leadership</span>
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-white mt-1">The founders building your product</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Smruti */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-white text-sm">
              SR
            </div>
            <div>
              <h3 className="font-display text-xl font-medium text-white">Smruti Ranjan</h3>
              <div className="font-mono text-xs text-slate-400 mt-0.5">Founder · Systems &amp; AI architecture</div>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Leads platform architecture, distributed PostgreSQL schema design, and custom AI inference pipelines. Focuses on system throughput, edge computer vision, and zero-latency backend execution.
            </p>
            <div className="font-mono text-[11px] text-slate-500 pt-2 border-t border-white/5">
              PostgreSQL, FastAPI, LLM RAG, YOLOv8, Docker
            </div>
          </div>

          {/* Biswash */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-white text-sm">
              BW
            </div>
            <div>
              <h3 className="font-display text-xl font-medium text-white">Biswash</h3>
              <div className="font-mono text-xs text-slate-400 mt-0.5">Co-founder · Cloud infrastructure</div>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Oversees cloud infrastructure, continuous deployment pipelines, and operational telemetry. Ensures that high-load platforms maintain strict 99.98% uptime without regression.
            </p>
            <div className="font-mono text-[11px] text-slate-500 pt-2 border-t border-white/5">
              Cloud Architecture, Redis, CI/CD, Containerization, SRE
            </div>
          </div>

          {/* Arpita */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-white text-sm">
              AP
            </div>
            <div>
              <h3 className="font-display text-xl font-medium text-white">Arpita</h3>
              <div className="font-mono text-xs text-slate-400 mt-0.5">Co-founder · Interfaces &amp; design systems</div>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Engineers kinetic user interfaces, Three.js spatial web applications, and precision design systems. Blends interactive WebGL aesthetics with frictionless usability.
            </p>
            <div className="font-mono text-[11px] text-slate-500 pt-2 border-t border-white/5">
              Next.js, Three.js, Spatial UI, Motion, Tailwind CSS
            </div>
          </div>
        </div>
      </section>

      {/* Studio Manifesto */}
      <section className="p-7 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 space-y-8">
        <div>
          <span className="font-mono text-xs text-slate-400 font-medium">Principles</span>
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-white mt-1">The Studio Manifesto</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 p-5 rounded-xl bg-white/[0.02] border border-white/5">
            <h3 className="font-medium text-white text-base">01. Direct Founder Access</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              No project managers or communication bottlenecks. You talk directly with the engineers writing your code on a shared Slack/WhatsApp channel every day.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-xl bg-white/[0.02] border border-white/5">
            <h3 className="font-medium text-white text-base">02. 4 Builds Per Month Cap</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              We never take more than four concurrent projects per month. This deliberate capacity cap guarantees that each build receives intense architectural focus and polish.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-xl bg-white/[0.02] border border-white/5">
            <h3 className="font-medium text-white text-base">03. 100% In-House Code</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Zero subcontracting, zero white-labeling. Every component, database schema, and model pipeline is designed, typed, tested, and shipped by our founding team.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-xl bg-white/[0.02] border border-white/5">
            <h3 className="font-medium text-white text-base">04. Upfront Fixed Pricing</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              We scope thoroughly and lock our price upfront. No surprise hourly overages, hidden retainers, or scope-creep hostage games.
            </p>
          </div>
        </div>

        {/* Location & Studio HUD */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-300" />
            <span>Studio Location: <strong>Bhubaneswar, Odisha, India</strong></span>
          </div>
          <div>
            <span>Availability: <strong className="text-emerald-400">Slots Open for Current Sprint</strong></span>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
        <h2 className="font-display text-2xl font-medium text-white">
          Let&apos;s build something exceptional together.
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Lock in your project scope and slot directly with the founding engineers.
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
