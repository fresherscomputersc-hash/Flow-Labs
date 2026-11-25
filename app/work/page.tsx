import Link from 'next/link';
import { ArrowRight, ExternalLink, Terminal, Shield, Cpu, Activity, Database, Check } from 'lucide-react';

export const metadata = {
  title: 'Work — Production Deployments & Case Studies | The Flow Labs',
  description: 'Production applications, operations consoles, and computer vision pipelines engineered by The Flow Labs. Shipped in-house with real users and live telemetry.',
};

export default function WorkPage() {
  return (
    <div className="pt-28 pb-28 px-4 sm:px-6 max-w-6xl mx-auto space-y-32">
      
      {/* ================= HEADER ================= */}
      <section className="max-w-3xl space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Production showroom
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-normal text-white tracking-tight leading-[1.08]">
          Shipped software operating in live production environments.
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
          We do not showcase speculative Figma mockups. Every platform below is a real production system built in-house, actively handling real customers, financial transactions, or edge sensor telemetry.
        </p>
      </section>

      {/* ================= CASE STUDY 01: DROOVEE ================= */}
      <section id="droovee" className="space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="font-mono text-xs text-slate-400 mb-2">Flagship deployment: Urban mobility</div>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-white">
              Droovee: Chauffeur operations platform
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Live in production</span>
          </div>
        </div>

        {/* Narrative & Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Engineering Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Droovee is a multi-tenant digital mobility operating system powering on-demand professional chauffeur bookings. It replaced chaotic manual phone dispatching with an automated web booking engine, dynamic distance pricing algorithms, real-time driver dispatching, and automated GST-compliant invoicing.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-medium text-white text-sm">Customer booking and distance calculation</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Engineered with Next.js 15 and Mapbox routing APIs to calculate point-to-point road distances dynamically, providing customers with upfront transparent pricing before booking confirmation.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-medium text-white text-sm">PostgreSQL Row-Level Security</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Enforces strict tenant isolation across customers, corporate accounts, and fleet drivers at the database level. Direct Supabase real-time change data capture streams dispatch states to drivers instantly.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-medium text-white text-sm">Automated billing and GST generation</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Integrated Razorpay payment webhooks with idempotent serverless workers that automatically reconcile payments, generate PDF tax invoices with verified HSN codes, and dispatch them to customers via email and WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {/* Telemetry & Architecture Specifications */}
          <div className="lg:col-span-5 rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-7 space-y-6 font-mono text-xs">
            <div>
              <div className="text-slate-400 pb-3 border-b border-white/10">Production benchmarks</div>
              <div className="space-y-3 pt-3">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">P95 API Latency</span>
                  <span className="text-emerald-400 font-semibold">&lt; 120ms</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Database Engine</span>
                  <span className="text-white">PostgreSQL 16 + RLS</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Dispatch Sync Delay</span>
                  <span className="text-emerald-400 font-semibold">&lt; 350ms Realtime</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Payment Webhook SLA</span>
                  <span className="text-white">100% Idempotent</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Architecture Scope</span>
                  <span className="text-white">Full Stack Engineering</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-slate-400 pb-2 border-b border-white/10">Shipped technologies</div>
              <div className="flex flex-wrap gap-1.5 pt-3">
                {['Next.js 15', 'TypeScript', 'Supabase Realtime', 'PostgreSQL', 'Tailwind CSS', 'Razorpay', 'Twilio API'].map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[11px] text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ================= CASE STUDY 02: DRISHTI AI ================= */}
      <section id="drishti" className="space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="font-mono text-xs text-slate-400 mb-2">Lab build: Computer vision telemetry</div>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-white">
              Drishti AI: Edge video anomaly detection
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono w-fit">
            <span>In-house laboratory build</span>
          </div>
        </div>

        {/* Narrative & Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Engineering Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Drishti AI is a high-speed computer vision pipeline built to process real-time RTSP camera streams for perimeter safety and defect detection. Rather than streaming expensive 4K raw video to hyperscale cloud providers, Drishti executes quantized neural inference locally on edge nodes.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-medium text-white text-sm">Edge YOLOv8 neural inference</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Quantized ONNX models running on edge compute nodes delivering 30 frames per second live detection with minimal thermal footprint.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-medium text-white text-sm">94% cloud egress cost reduction</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Only verified anomaly event frames and JSON bounding-box metadata are transmitted to the cloud console, cutting bandwidth expenses by 94% compared to standard cloud vision setups.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-medium text-white text-sm">Low-latency WebRTC monitoring</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Operators monitor live video feeds through a peer-to-peer WebRTC connection with sub-200ms latency directly inside the browser.
                </p>
              </div>
            </div>
          </div>

          {/* Telemetry & Architecture Specifications */}
          <div className="lg:col-span-5 rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-7 space-y-6 font-mono text-xs">
            <div>
              <div className="text-slate-400 pb-3 border-b border-white/10">Inference telemetry</div>
              <div className="space-y-3 pt-3">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Inference Pipeline</span>
                  <span className="text-white">YOLOv8 ONNX Quantized</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Frame Processing Rate</span>
                  <span className="text-emerald-400 font-semibold">30 FPS continuous</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Bandwidth Optimization</span>
                  <span className="text-emerald-400 font-semibold">94% egress saved</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Stream Protocol</span>
                  <span className="text-white">WebRTC + RTSP</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Deployment Target</span>
                  <span className="text-white">Docker on Edge Hardware</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-slate-400 pb-2 border-b border-white/10">Shipped technologies</div>
              <div className="flex flex-wrap gap-1.5 pt-3">
                {['Python', 'FastAPI', 'YOLOv8', 'OpenCV', 'WebRTC', 'Docker Edge'].map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[11px] text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ================= CASE STUDY 03: FLOWOPS ================= */}
      <section id="flowops" className="space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="font-mono text-xs text-slate-400 mb-2">Internal platform: Studio observability</div>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-white">
              FlowOps: Telemetry and uptime monitor
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono w-fit">
            <span>Internal studio tooling</span>
          </div>
        </div>

        {/* Narrative & Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              FlowOps is our automated health surveillance engine that continuously monitors deployed client platforms, SSL certificate expirations, database connection pool saturations, and edge function response times across the globe.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-medium text-white text-sm">60-second synthetic heartbeats</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Automated probes execute authenticated end-to-end user transactions every 60 seconds to detect partial degradations before end users notice them.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h3 className="font-medium text-white text-sm">Instant incident alerting</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Pushes zero-delay alert payloads with stack traces and response headers to our private Telegram founder group for immediate triage.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-7 space-y-6 font-mono text-xs">
            <div>
              <div className="text-slate-400 pb-3 border-b border-white/10">Observability metrics</div>
              <div className="space-y-3 pt-3">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Monitoring Uptime</span>
                  <span className="text-emerald-400 font-semibold">99.98% verified</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Heartbeat Interval</span>
                  <span className="text-white">60s automated</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-400">Alert Dispatch</span>
                  <span className="text-white">Telegram Bot Webhook</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Failover Mode</span>
                  <span className="text-white">Automatic container reboot</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-slate-400 pb-2 border-b border-white/10">Shipped technologies</div>
              <div className="flex flex-wrap gap-1.5 pt-3">
                {['TypeScript', 'Edge Functions', 'PostgreSQL CDC', 'Telegram API'].map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[11px] text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ================= SCOPING CALLOUT ================= */}
      <section className="p-8 sm:p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
        <span className="font-mono text-xs text-slate-400">Build with us</span>
        <h2 className="font-display text-2xl sm:text-4xl font-normal text-white max-w-xl mx-auto">
          Have an architecture you need built?
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
          We take on four builds a month with direct founder collaboration and an upfront fixed-scope guarantee.
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
