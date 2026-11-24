import Link from 'next/link';
import { ArrowRight, ExternalLink, ShieldCheck, Cpu, Terminal, Smartphone } from 'lucide-react';

export const metadata = {
  title: 'Work — Production Software & Live Deployments | The Flow Labs',
  description: 'Production applications, operations consoles and open-source tools engineered by The Flow Labs. Every project is running live, in-house, or on GitHub.',
};

export default function WorkPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-24">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neon-cyan font-mono text-xs uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-radar"></span>
          Production Showroom
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight">
          Shipped software.<br />
          <span className="bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent">
            Operating live in production.
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          We don't showcase Figma mockups or unverified concepts. Every build featured below is a production system handling real users, transactions, and hardware telemetry.
        </p>
      </section>

      {/* Case Studies Grid */}
      <section className="space-y-12">
        
        {/* Droovee */}
        <div id="droovee" className="p-8 sm:p-12 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="font-mono text-xs text-neon-cyan uppercase tracking-wider font-semibold">
              01 // Production Flagship · Urban Mobility
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-radar"></span>
              LIVE IN PRODUCTION
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Droovee — On-Demand Chauffeur &amp; Fleet Operations Platform
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            A comprehensive, multi-tenant digital transportation operating system powering premium chauffeur bookings. Droovee replaces manual dispatch calls with an automated customer portal, dynamic distance algorithms, driver assignment workflows, and automated GST-compliant invoicing.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-xs">
            <div>
              <span className="text-slate-500 block">ROLE</span>
              <strong className="text-white text-sm">Full Architecture</strong>
            </div>
            <div>
              <span className="text-slate-500 block">LATENCY</span>
              <strong className="text-neon-cyan text-sm">&lt; 120ms P95</strong>
            </div>
            <div>
              <span className="text-slate-500 block">DATABASE</span>
              <strong className="text-white text-sm">PostgreSQL + RLS</strong>
            </div>
            <div>
              <span className="text-slate-500 block">DISPATCH SLA</span>
              <strong className="text-neon-emerald text-sm">Instant Sync</strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {['Next.js 15', 'TypeScript', 'Supabase Realtime', 'PostgreSQL', 'Tailwind CSS', 'Razorpay', 'Twilio API'].map((t) => (
              <span key={t} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-xs text-slate-300">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Drishti Vision AI */}
        <div id="drishti" className="p-8 sm:p-12 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="font-mono text-xs text-neon-purple uppercase tracking-wider font-semibold">
              02 // Computer Vision · Spatial Intelligence
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">
              IN-HOUSE LAB BUILD
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Drishti AI — Edge Video Telemetry &amp; Anomaly Detection
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            High-speed computer vision pipeline processing real-time video feeds for physical safety inspection and defect identification. Powered by an optimized YOLOv8 neural network running on edge nodes, reducing cloud egress costs by 94% while delivering zero-latency anomaly alerts.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-xs">
            <div>
              <span className="text-slate-500 block">MODEL</span>
              <strong className="text-white text-sm">YOLOv8 Edge</strong>
            </div>
            <div>
              <span className="text-slate-500 block">FRAME RATE</span>
              <strong className="text-neon-purple text-sm">30 FPS Live</strong>
            </div>
            <div>
              <span className="text-slate-500 block">PROTOCOL</span>
              <strong className="text-white text-sm">WebRTC / RTSP</strong>
            </div>
            <div>
              <span className="text-slate-500 block">ACCURACY</span>
              <strong className="text-neon-emerald text-sm">98.4% Precision</strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {['Python', 'FastAPI', 'YOLOv8', 'WebRTC', 'Docker', 'OpenCV'].map((t) => (
              <span key={t} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-xs text-slate-300">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* FlowOps */}
        <div id="flowops" className="p-8 sm:p-12 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="font-mono text-xs text-neon-blue uppercase tracking-wider font-semibold">
              03 // Developer Tooling · Microservice Supervisor
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
              OPEN SOURCE
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            FlowOps — Lightweight Multi-Agent Deployment Supervisor
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            A standalone container orchestrator and webhook listener that verifies container health, runs automated rollback drills, and coordinates multi-agent workers without the complexity of Kubernetes.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {['Go', 'Docker API', 'GitHub Webhooks', 'Prometheus', 'Redis'].map((t) => (
              <span key={t} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-xs text-slate-300">
                {t}
              </span>
            ))}
          </div>
        </div>

      </section>

      {/* CTA Section */}
      <section className="text-center p-12 rounded-3xl bg-gradient-to-r from-blue-950/30 via-[#0B0F19] to-cyan-950/20 border border-white/10 space-y-6">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
          Ready to engineer your next release?
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          We cap our bandwidth to four concurrent client builds per month to maintain 100% focus and zero junior delegation.
        </p>
        <div>
          <Link
            href="/scoping"
            className="inline-flex items-center gap-2 bg-white text-[#07090E] font-semibold text-sm px-7 py-3 rounded-full hover:bg-slate-200 transition-all hover:scale-105 shadow-[0_4px_20px_rgba(255,255,255,0.25)]"
          >
            <span>Open Project Scoping Cockpit &rarr;</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
