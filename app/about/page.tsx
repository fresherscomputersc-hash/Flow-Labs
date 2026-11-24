import Link from 'next/link';
import { ArrowRight, ShieldCheck, HeartHandshake, Zap, Target, MapPin } from 'lucide-react';

export const metadata = {
  title: 'About — Founders & Studio Manifesto | The Flow Labs',
  description: 'Meet The Flow Labs founders: Smruti Ranjan, Biswash and Arpita. A founder-led three-person studio building interfaces, systems and AI in-house. Capped at 4 builds a month.',
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-24">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neon-cyan font-mono text-xs uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-radar"></span>
          Studio Manifesto &amp; Team
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight">
          Three founders.<br />
          <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
            Zero account layers.
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          The Flow Labs was founded to reject the traditional agency model where senior partners sell the project, only to hand the actual work to outsourced contractors or juniors. When you hire us, you collaborate directly with the three founders writing your code.
        </p>
      </section>

      {/* Founders Grid */}
      <section className="space-y-8">
        <div className="text-center">
          <span className="font-mono text-xs text-neon-cyan uppercase tracking-widest font-semibold">Leadership &amp; Ownership</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">The Founders Building Your Product</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Smruti */}
          <div className="p-8 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-neon-blue flex items-center justify-center font-mono font-bold text-white text-lg shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              SR
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Smruti Ranjan</h3>
              <div className="font-mono text-xs text-neon-cyan mt-1">Founder · Systems &amp; AI Architecture</div>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Leads platform architecture, distributed PostgreSQL schema design, and custom AI inference pipelines. Focuses on system throughput, edge computer vision, and zero-latency backend execution.
            </p>
            <div className="font-mono text-[11px] text-slate-500 pt-2 border-t border-white/5">
              EXPERTISE: PostgreSQL, FastAPI, LLM RAG, YOLOv8, Docker
            </div>
          </div>

          {/* Biswash */}
          <div className="p-8 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-neon-emerald flex items-center justify-center font-mono font-bold text-white text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              BW
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Biswash</h3>
              <div className="font-mono text-xs text-neon-emerald mt-1">Co-Founder · Scaled Cloud &amp; Reliability</div>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Oversees cloud infrastructure, continuous deployment pipelines, and operational telemetry. Ensures that high-load platforms maintain strict 99.98% uptime without regression.
            </p>
            <div className="font-mono text-[11px] text-slate-500 pt-2 border-t border-white/5">
              EXPERTISE: Cloud Architecture, Redis, CI/CD, Containerization, SRE
            </div>
          </div>

          {/* Arpita */}
          <div className="p-8 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-700 to-neon-purple flex items-center justify-center font-mono font-bold text-white text-lg shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              AP
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Arpita</h3>
              <div className="font-mono text-xs text-neon-purple mt-1">Co-Founder · Interfaces &amp; Design Systems</div>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Engineers kinetic user interfaces, ThreeUI spatial web applications, and precision design systems. Blends interactive WebGL aesthetics with frictionless usability.
            </p>
            <div className="font-mono text-[11px] text-slate-500 pt-2 border-t border-white/5">
              EXPERTISE: Next.js, Three.js, Spatial UI, Motion, Tailwind CSS
            </div>
          </div>
        </div>
      </section>

      {/* Studio Manifesto */}
      <section className="p-8 sm:p-14 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-10">
        <div>
          <span className="font-mono text-xs text-neon-cyan uppercase tracking-widest font-semibold">Our Principles</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">The Studio Manifesto</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 text-neon-cyan font-display font-bold text-xl">
              <span>01.</span>
              <h4>Capped at Four Builds a Month</h4>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              We never take on more work than our three founders can personally write and verify. Capping our capacity guarantees obsessive attention to detail and zero junior delegation.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 text-neon-blue font-display font-bold text-xl">
              <span>02.</span>
              <h4>Direct Founder Access</h4>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              You collaborate in a shared Slack or WhatsApp group directly with the engineers building your platform. Critical architectural decisions are made in minutes, not through weeks of email telephone.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 text-neon-emerald font-display font-bold text-xl">
              <span>03.</span>
              <h4>Fixed-Price Scope Certainty</h4>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              No open-ended hourly billing or surprise invoices. Every sprint has an upfront locked scope, concrete milestone deliverables, and guaranteed ship dates.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 text-neon-purple font-display font-bold text-xl">
              <span>04.</span>
              <h4>100% In-House Engineering</h4>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              We own the entire pipeline from design system tokens to PostgreSQL indexes and local AI models. Everything is designed, built, and shipped from our studio in Bhubaneswar.
            </p>
          </div>
        </div>
      </section>

      {/* Studio Location & Connect */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/30 via-[#0B0F19] to-cyan-950/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-neon-cyan font-mono text-xs uppercase">
            <MapPin className="w-4 h-4" />
            <span>Studio Headquarters</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Bhubaneswar, Odisha, India
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg leading-relaxed">
            Engineering digital platforms for clients globally across India, Singapore, Europe, and North America.
          </p>
        </div>

        <div>
          <Link
            href="/scoping"
            className="inline-flex items-center gap-2 bg-white text-[#07090E] font-semibold text-sm px-7 py-3 rounded-full hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_4px_20px_rgba(255,255,255,0.25)]"
          >
            <span>Lock In a Build Slot &rarr;</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
