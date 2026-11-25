import Link from 'next/link';
import { ArrowRight, Layers, Database, Cpu, Check, Terminal, Shield, Zap, GitBranch, Server } from 'lucide-react';

export const metadata = {
  title: 'Services — Interfaces, Scaled Systems, and Applied Intelligence | The Flow Labs',
  description: 'Three core engineering disciplines engineered in-house: Interfaces (Web & Mobile), Systems (Cloud Platforms & PostgreSQL), and Applied Intelligence (AI & Automation). Fixed-price sprint delivery.',
  alternates: {
    canonical: '/services',
  },
};

export default function ServicesPage() {
  return (
    <div className="pt-28 pb-28 px-4 sm:px-6 max-w-6xl mx-auto space-y-32">
      
      {/* ================= HEADER ================= */}
      <section className="max-w-3xl space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Engineering disciplines
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-normal text-white tracking-tight leading-[1.08]">
          Three core engineering disciplines, built end to end by three founders.
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
          We build digital products from scratch with zero delegation to junior contractors or account intermediaries. Every interface, cloud platform, and intelligence pipeline is planned and written directly by the three founders.
        </p>
      </section>

      {/* ================= 1. INTERFACES & SPATIAL SYSTEMS ================= */}
      <section id="frontend" className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-slate-400">
              <Layers className="w-3.5 h-3.5 text-slate-300" />
              <span>Layer 01</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-white">
              Interfaces and design systems
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              We engineer bespoke web and mobile interfaces that feel physical, immediate, and responsive. No bloated UI component libraries or slow layout shifts. Every view is built for sub-second paints, accessible keyboard navigation, and fluid WebGL interactions.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-300 bg-white/[0.02] border border-white/10 rounded-xl p-4 min-w-[240px] space-y-2">
            <div className="text-slate-400">Sprint cycle: <span className="text-white">2 to 3 weeks</span></div>
            <div className="text-slate-400">Stack: <span className="text-white">Next.js 15, Three.js, Tailwind</span></div>
            <div className="text-slate-400">Deliverable: <span className="text-white">Full responsive codebase</span></div>
          </div>
        </div>

        {/* Technical Architecture Workbench */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Architecture Specs */}
          <div className="md:col-span-7 rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-8 space-y-6">
            <h3 className="font-display text-xl font-medium text-white">Engineering specifications</h3>
            
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-4">
                <div className="font-medium text-white text-sm mb-1">Spatial and interactive WebGL canvas</div>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Interactive 3D geometry, responsive shader meshes, and GPU-accelerated motion running smoothly at 60 frames per second without blocking the main DOM thread.
                </p>
              </div>

              <div className="border-b border-white/5 pb-4">
                <div className="font-medium text-white text-sm mb-1">Design systems with obsidian tokens</div>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Rigorous token hierarchies for typography, contrast ratios, spacing grids, and dark palettes designed to eliminate visual ambiguity and scale cleanly as features expand.
                </p>
              </div>

              <div>
                <div className="font-medium text-white text-sm mb-1">Sub-second paint budgets</div>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Zero cumulative layout shift, edge-cached assets, optimized font loading, and strict bundle limits below 110 kB First Load JavaScript.
                </p>
              </div>
            </div>
          </div>

          {/* Telemetry Budget HUD */}
          <div className="md:col-span-5 rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-8 flex flex-col justify-between space-y-6 font-mono text-xs">
            <div>
              <div className="text-slate-400 mb-4 pb-2 border-b border-white/10">Interface telemetry budgets</div>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">First Contentful Paint</span>
                  <span className="text-emerald-400 font-semibold">&lt; 0.6s</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Interaction to Next Paint</span>
                  <span className="text-emerald-400 font-semibold">&lt; 40ms</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Cumulative Layout Shift</span>
                  <span className="text-emerald-400 font-semibold">0.000</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Lighthouse Accessibility</span>
                  <span className="text-emerald-400 font-semibold">100 / 100</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">WebGL Fallback Mode</span>
                  <span className="text-slate-300">Graceful 2D Mesh</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-slate-400 text-[11px] leading-relaxed">
              Every interface build ships with end-to-end component testing, mobile viewport verification, and automated lighthouse gates before merge.
            </div>
          </div>

        </div>
      </section>

      {/* ================= 2. CLOUD PLATFORMS & POSTGRESQL SYSTEMS ================= */}
      <section id="backend" className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-slate-400">
              <Database className="w-3.5 h-3.5 text-slate-300" />
              <span>Layer 02</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-white">
              Cloud platforms and distributed systems
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Solid database foundations and resilient backend services engineered to sustain traffic spikes without downtime. We design relational schemas, real-time message streams, authentication boundaries, and automated billing reconciliations.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-300 bg-white/[0.02] border border-white/10 rounded-xl p-4 min-w-[240px] space-y-2">
            <div className="text-slate-400">Sprint cycle: <span className="text-white">3 to 4 weeks</span></div>
            <div className="text-slate-400">Core database: <span className="text-white">PostgreSQL with RLS</span></div>
            <div className="text-slate-400">Uptime guarantee: <span className="text-white">99.98% SLA</span></div>
          </div>
        </div>

        {/* Data Architecture Pipeline */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-display text-xl font-medium text-white">System execution architecture</h3>
            <span className="font-mono text-xs text-slate-400">Deterministic transaction path</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="font-mono text-xs text-slate-400">Stage 01</div>
              <div className="text-sm font-medium text-white">Edge Request &amp; Auth</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                JSON Web Tokens validated at the edge. Rate limiting, DDoS isolation, and origin verification before hitting core databases.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="font-mono text-xs text-slate-400">Stage 02</div>
              <div className="text-sm font-medium text-white">PostgreSQL + RLS</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Row-Level Security enforces multi-tenant boundaries at the database engine level. Zero risk of cross-tenant data leakage.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="font-mono text-xs text-slate-400">Stage 03</div>
              <div className="text-sm font-medium text-white">Redis Message Queues</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Decoupled background workers handle webhooks, PDF generation, email dispatches, and ledger updates asynchronously.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="font-mono text-xs text-slate-400">Stage 04</div>
              <div className="text-sm font-medium text-white">Audit &amp; Telemetry</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Immutable event logs, automated backups, and real-time P95 latency tracking across all endpoints.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-500 block mb-0.5">Database schema</span>
              <span>Fully normalized relational design with foreign key constraints</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Payment rails</span>
              <span>Razorpay, Stripe, webhook validation with idempotent retry logic</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Compliance</span>
              <span>Automated GST invoice generation and ledger reconciliation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. APPLIED INTELLIGENCE & EDGE VISION ================= */}
      <section id="ai" className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-slate-300" />
              <span>Layer 03</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-white">
              Applied intelligence and autonomous workflows
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              We turn repetitive manual workflows into deterministic software systems. From custom document retrieval pipelines to production-grade WhatsApp customer bots and edge computer vision inference.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-300 bg-white/[0.02] border border-white/10 rounded-xl p-4 min-w-[240px] space-y-2">
            <div className="text-slate-400">Sprint cycle: <span className="text-white">2 to 3 weeks</span></div>
            <div className="text-slate-400">Vector engine: <span className="text-white">pgvector with hybrid search</span></div>
            <div className="text-slate-400">Integration: <span className="text-white">Meta WhatsApp Cloud API</span></div>
          </div>
        </div>

        {/* Intelligence Deep Dive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="font-mono text-xs text-slate-400">Capability A</div>
            <h3 className="font-display text-lg font-medium text-white">Contextual RAG engines</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Hybrid vector search combined with BM25 keyword matching on PostgreSQL pgvector. Grounded generation ensures zero hallucinations by enforcing strict citations to your private knowledge base.
            </p>
            <div className="pt-2 font-mono text-[11px] text-slate-500 border-t border-white/5">
              Chunking strategies, embedding caches, re-ranking models
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="font-mono text-xs text-slate-400">Capability B</div>
            <h3 className="font-display text-lg font-medium text-white">Meta WhatsApp Cloud bots</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Official WhatsApp Business Cloud integration handling inbound customer qualification, booking confirmations, CRM updates, and seamless handoff to human support representatives.
            </p>
            <div className="pt-2 font-mono text-[11px] text-slate-500 border-t border-white/5">
              Webhook verification, template messages, state machines
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="font-mono text-xs text-slate-400">Capability C</div>
            <h3 className="font-display text-lg font-medium text-white">Edge vision and telemetry</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              YOLOv8 neural networks running directly on local edge hardware or lightweight Docker containers, identifying anomalies in real time without sending raw video streams to costly cloud providers.
            </p>
            <div className="pt-2 font-mono text-[11px] text-slate-500 border-t border-white/5">
              30 FPS live detection, 94% cloud egress reduction
            </div>
          </div>

        </div>
      </section>

      {/* ================= SCOPING CALLOUT ================= */}
      <section className="p-8 sm:p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
        <span className="font-mono text-xs text-slate-400">Sprint planning</span>
        <h2 className="font-display text-2xl sm:text-4xl font-normal text-white max-w-xl mx-auto">
          Scope your engineering sprint
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
          Select the architecture modules your product requires and synthesize an upfront fixed-price quote with guaranteed delivery.
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
