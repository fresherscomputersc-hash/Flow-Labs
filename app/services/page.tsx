import Link from 'next/link';
import { ArrowRight, Layers, Database, Cpu, CheckCircle2, Shield, Zap, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Services — Interfaces, Scaled Systems & Applied Intelligence | The Flow Labs',
  description: 'Three core engineering pillars built in-house: Interfaces (Web & Mobile), Systems (Cloud Platforms & PostgreSQL), and Applied Intelligence (AI & Automation). Fixed-price, 4 builds a month.',
};

export default function ServicesPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-24">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neon-cyan font-mono text-xs uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-radar"></span>
          Engineering Specializations
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight">
          Three layers.<br />
          <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
            One engineering team.
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          We build digital products from scratch with zero delegation to junior developers or subcontractors. Every line of frontend, cloud infrastructure, and AI code is written in-house by our three founders.
        </p>
      </section>

      {/* Layer 01: Interfaces */}
      <section id="frontend" className="p-8 sm:p-12 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-mono text-xs">
              <Layers className="w-4 h-4" />
              <span>LAYER 01 // FRONTEND ARCHITECTURE</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Interfaces &amp; Design Systems
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              We design and engineer bespoke web and mobile interfaces that feel tactile, responsive, and immediate. No generic template bloat — every component is built for speed, accessibility, and fluid spatial micro-interactions.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-400 bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
            <div>DELIVERY: <strong className="text-white">2–3 WEEKS</strong></div>
            <div>SPRINT CAP: <strong className="text-neon-cyan">LOCKED SCOPE</strong></div>
            <div>TECH: <strong className="text-white">NEXT.JS 15 + THREEUI</strong></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="font-semibold text-white text-base">Kinetic Spatial Web</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Interactive 3D Three.js experiences, shader wave fields, and hardware-accelerated animations that load in sub-seconds.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="font-semibold text-white text-base">Design Systems</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Comprehensive Tailwind CSS component tokens, dark-mode obsidian themes, fluid typography, and consistent spacing.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="font-semibold text-white text-base">Sub-Second Paint Times</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              100 Lighthouse performance metrics, automatic image optimization, edge CDN caching, and zero bundle waste.
            </p>
          </div>
        </div>
      </section>

      {/* Layer 02: Systems */}
      <section id="backend" className="p-8 sm:p-12 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neon-blue/10 border border-neon-blue/30 text-neon-blue font-mono text-xs">
              <Database className="w-4 h-4" />
              <span>LAYER 02 // CLOUD &amp; BACKEND SYSTEMS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Scaled Cloud &amp; Distributed Systems
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Robust backend foundations built for durability and scale. We construct relational schemas, real-time message streams, authentication boundaries, and automated billing pipelines that stay up under heavy load.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-400 bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
            <div>DELIVERY: <strong className="text-white">3–4 WEEKS</strong></div>
            <div>DATABASE: <strong className="text-neon-blue">POSTGRESQL + RLS</strong></div>
            <div>UPTIME SLA: <strong className="text-white">99.98%</strong></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="font-semibold text-white text-base">PostgreSQL &amp; Row-Level Security</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Normalized relational schemas, index optimization, real-time change data capture, and bulletproof user tenant isolation.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="font-semibold text-white text-base">High-Performance APIs</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              FastAPI and Node serverless endpoints with microsecond execution latency, OpenAPI docs, and strict input validation.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="font-semibold text-white text-base">Distributed Infrastructure</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Dockerized microservices, Redis caching layers, background task queues, and zero-downtime deployment pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* Layer 03: Applied Intelligence */}
      <section id="ai" className="p-8 sm:p-12 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neon-purple/10 border border-neon-purple/30 text-neon-purple font-mono text-xs">
              <Cpu className="w-4 h-4" />
              <span>LAYER 03 // APPLIED INTELLIGENCE &amp; AI</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Applied Intelligence &amp; Autonomous Workflows
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Practical, revenue-generating AI systems. We move past theoretical demo gimmicks to deploy vector retrieval pipelines, conversational WhatsApp sales agents, edge vision intelligence, and automated document processors.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-400 bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
            <div>MODELS: <strong className="text-white">CLAUDE 3.5 / LLAMA 3</strong></div>
            <div>VECTORS: <strong className="text-neon-purple">PGVECTOR (1536D)</strong></div>
            <div>CHANNELS: <strong className="text-white">WEB, WHATSAPP, API</strong></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="font-semibold text-white text-base">Custom AI RAG Pipelines</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Vector databases indexing your internal manuals, docs, and knowledge base with hybrid semantic keyword retrieval.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="font-semibold text-white text-base">WhatsApp Enterprise Bots</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Official Meta Cloud API integrations: autonomous booking assistants, order tracking, qualification, and payments.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h3 className="font-semibold text-white text-base">Edge Computer Vision</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              YOLOv8 anomaly detection, automated visual inspection, and real-time CCTV stream analysis with zero cloud dependency.
            </p>
          </div>
        </div>
      </section>

      {/* Cross-Link Scoping Banner */}
      <section className="text-center p-10 rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 space-y-6">
        <h2 className="font-display text-3xl font-bold text-white">Have a build in mind?</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Use our interactive Project Scoping Cockpit to synthesize exact costs and sprint timelines in 60 seconds.
        </p>
        <Link
          href="/scoping"
          className="inline-flex items-center gap-2 bg-white text-[#07090E] font-semibold text-sm px-6 py-3 rounded-full hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_4px_20px_rgba(255,255,255,0.2)]"
        >
          <span>Calculate Your Scope &rarr;</span>
        </Link>
      </section>

    </div>
  );
}
