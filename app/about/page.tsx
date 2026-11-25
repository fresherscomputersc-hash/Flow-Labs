import Link from 'next/link';
import { ArrowRight, MapPin, Check, Terminal, Shield, Cpu, Code2 } from 'lucide-react';

export const metadata = {
  title: 'About — Founders & Studio Principles | The Flow Labs',
  description: 'Meet The Flow Labs founders: Smruti Ranjan, Biswash, and Arpita. A founder-led engineering studio building interfaces, systems, and AI in-house. Capped at four builds a month.',
};

export default function AboutPage() {
  return (
    <div className="pt-28 pb-28 px-4 sm:px-6 max-w-6xl mx-auto space-y-32">
      
      {/* ================= HEADER ================= */}
      <section className="max-w-3xl space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Studio manifesto and team
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-normal text-white tracking-tight leading-[1.08]">
          Three founding engineers. Zero management layers.
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
          The Flow Labs was founded to reject the traditional agency model where senior partners sell a contract only to delegate the actual work to offshore subcontractors or junior interns. When you work with us, every line of frontend, cloud, and AI code is authored directly by the three founders.
        </p>
      </section>

      {/* ================= THE FOUNDERS ================= */}
      <section className="space-y-8">
        <div className="pb-4 border-b border-white/10">
          <div className="font-mono text-xs text-slate-400 mb-1">Engineering leadership</div>
          <h2 className="font-display text-2xl sm:text-3xl font-normal text-white">
            The engineers writing your code
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Smruti */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-sm text-white font-medium">
                SR
              </div>
              <div>
                <h3 className="font-display text-xl font-medium text-white">Smruti Ranjan</h3>
                <div className="font-mono text-xs text-slate-400 mt-1">Founder: Systems and AI architecture</div>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Leads core platform architecture, normalized PostgreSQL schema design, and custom AI inference pipelines. Specializes in multi-tenant security boundaries, edge computer vision, and zero-latency backend execution.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 font-mono text-[11px] text-slate-500">
              PostgreSQL, FastAPI, LLM RAG, YOLOv8, Docker
            </div>
          </div>

          {/* Biswash */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-sm text-white font-medium">
                BW
              </div>
              <div>
                <h3 className="font-display text-xl font-medium text-white">Biswash</h3>
                <div className="font-mono text-xs text-slate-400 mt-1">Co-founder: Cloud infrastructure</div>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Oversees cloud infrastructure, automated deployment pipelines, and operational telemetry. Ensures high-throughput platforms maintain strict 99.98% uptime SLAs under unpredictable traffic surges.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 font-mono text-[11px] text-slate-500">
              Cloud Architecture, Redis Queues, CI/CD, Containerization, SRE
            </div>
          </div>

          {/* Arpita */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-sm text-white font-medium">
                AP
              </div>
              <div>
                <h3 className="font-display text-xl font-medium text-white">Arpita</h3>
                <div className="font-mono text-xs text-slate-400 mt-1">Co-founder: Interfaces and design systems</div>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Engineers kinetic user interfaces, Three.js spatial web experiences, and meticulous design token hierarchies. Bridges interactive WebGL aesthetics with frictionless usability and fast load times.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 font-mono text-[11px] text-slate-500">
              Next.js 15, Three.js, Spatial WebGL, Micro-interactions, Tailwind
            </div>
          </div>

        </div>
      </section>

      {/* ================= STUDIO PRINCIPLES ================= */}
      <section className="rounded-2xl bg-white/[0.02] border border-white/10 p-7 sm:p-10 space-y-8">
        <div className="pb-4 border-b border-white/10">
          <div className="font-mono text-xs text-slate-400 mb-1">Operational standards</div>
          <h2 className="font-display text-2xl sm:text-3xl font-normal text-white">
            The studio manifesto
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-2">
            <h3 className="font-medium text-white text-base">Direct founder collaboration</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              No junior project managers or communication bottlenecks. You collaborate directly with the engineers authoring your codebase on a shared communication channel every single day.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-white text-base">Four builds per month cap</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              We deliberately limit our intake to at most four concurrent sprint builds per month. This capacity ceiling guarantees that your product receives meticulous architectural attention.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-white text-base">100% in-house engineering</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Zero subcontracting, zero outsourcing. Every frontend layout, database schema, and machine learning pipeline is designed, typed, tested, and shipped by our three founders.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-white text-base">Upfront fixed-price contracts</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              We scope thoroughly and lock pricing before any sprint kicks off. No surprise hourly overages, billing disputes, or hidden maintenance traps.
            </p>
          </div>

        </div>

        {/* Location & Studio Telemetry */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-300" />
            <span>Studio headquarters: <strong className="text-white">Bhubaneswar, Odisha, India</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Capacity status: <strong className="text-emerald-400">Open for current sprint</strong></span>
          </div>
        </div>

      </section>

      {/* ================= SCOPING CALLOUT ================= */}
      <section className="p-8 sm:p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
        <span className="font-mono text-xs text-slate-400">Start a build</span>
        <h2 className="font-display text-2xl sm:text-4xl font-normal text-white max-w-xl mx-auto">
          Let us build something exceptional together
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
          Lock in your project scope and slot directly with the founding engineers.
        </p>
        <div className="pt-2">
          <Link
            href="/scoping"
            className="inline-flex items-center gap-2 bg-white text-[#07090E] font-medium text-sm px-6 py-2.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <span>Launch scoping cockpit</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
