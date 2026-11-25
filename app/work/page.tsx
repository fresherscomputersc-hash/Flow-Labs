import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Work — Production Software & Live Deployments | The Flow Labs',
  description: 'Production applications, operations consoles and open-source tools engineered by The Flow Labs. Every project is running live, in-house, or on GitHub.',
};

export default function WorkPage() {
  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-20">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          Production showroom
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium text-white tracking-tight leading-[1.1]">
          Shipped software.<br />
          <span className="text-slate-400">Operating live in production.</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          We don't showcase Figma concepts. Every platform below is a real production system handling real users, transactions, and hardware telemetry.
        </p>
      </section>

      {/* Case Studies */}
      <section className="space-y-10">
        
        {/* Droovee */}
        <div id="droovee" className="p-7 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-mono text-xs text-slate-400">
              Client flagship · Urban mobility
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live in production
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-medium text-white">
            Droovee — On-Demand Chauffeur &amp; Fleet Operations Platform
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            A comprehensive, multi-tenant digital transportation operating system powering premium chauffeur bookings. Droovee replaces manual dispatch calls with an automated customer portal, dynamic distance algorithms, driver assignment workflows, and automated GST-compliant invoicing.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">ROLE</span>
              <strong className="text-white text-xs">Full Architecture</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">LATENCY</span>
              <strong className="text-slate-300 text-xs">&lt; 120ms P95</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">DATABASE</span>
              <strong className="text-white text-xs">PostgreSQL + RLS</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">DISPATCH</span>
              <strong className="text-slate-300 text-xs">Instant Sync</strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Next.js 15', 'TypeScript', 'Supabase Realtime', 'PostgreSQL', 'Tailwind CSS', 'Razorpay', 'Twilio API'].map((t) => (
              <span key={t} className="px-2.5 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[11px] text-slate-400">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Drishti Vision AI */}
        <div id="drishti" className="p-7 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-mono text-xs text-slate-400">
              Lab prototype · Vision telemetry
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 text-xs font-mono w-fit">
              In-house lab build
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-medium text-white">
            Drishti AI — Edge Video Telemetry &amp; Anomaly Detection
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            High-speed computer vision pipeline processing real-time video feeds for physical safety inspection and defect identification. Powered by an optimized YOLOv8 neural network running on edge nodes, reducing cloud egress costs by 94% while delivering zero-latency anomaly alerts.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">INFERENCE</span>
              <strong className="text-white text-xs">YOLOv8 Edge</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">EGRESS SAVING</span>
              <strong className="text-slate-300 text-xs">94% Reduced</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">FRAME RATE</span>
              <strong className="text-white text-xs">30 FPS Live</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">TRANSPORT</span>
              <strong className="text-slate-300 text-xs">WebRTC Stream</strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Python', 'FastAPI', 'YOLOv8', 'OpenCV', 'WebRTC', 'Docker Edge'].map((t) => (
              <span key={t} className="px-2.5 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[11px] text-slate-400">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* FlowOps */}
        <div id="flowops" className="p-7 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-mono text-xs text-slate-400">
              Internal platform · Studio observability
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 text-xs font-mono w-fit">
              Internal tooling
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-medium text-white">
            FlowOps — Real-Time Production Telemetry &amp; Uptime Monitor
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            Autonomous health check engine continuously polling our deployed microservices, database connection pools, SSL certificate expirations, and edge function response times across the globe.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">UPTIME</span>
              <strong className="text-white text-xs">99.98% Monitored</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">INTERVAL</span>
              <strong className="text-slate-300 text-xs">60s Heartbeat</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">NOTIFICATIONS</span>
              <strong className="text-white text-xs">Telegram Bot</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">FAILOVER</span>
              <strong className="text-slate-300 text-xs">Auto-Restart</strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {['TypeScript', 'Edge Functions', 'PostgreSQL CDC', 'Telegram API'].map((t) => (
              <span key={t} className="px-2.5 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[11px] text-slate-400">
                {t}
              </span>
            ))}
          </div>
        </div>

      </section>

      {/* CTA Box */}
      <section className="p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-4">
        <h2 className="font-display text-2xl font-medium text-white">
          Have an architecture you need built?
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          We take on 4 builds a month with direct founder collaboration and an upfront fixed-scope guarantee.
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
