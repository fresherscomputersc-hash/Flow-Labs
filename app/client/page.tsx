import Link from 'next/link';
import { ExternalLink, Download, FileText, CheckCircle2, MessageSquare, Shield, Clock } from 'lucide-react';

export const metadata = {
  title: 'Client Portal — Project Telemetry & Vault | The Flow Labs',
  description: 'Private client portal for active builds at The Flow Labs. Track sprint milestones, access staging previews, and download production deliverables.',
};

export default function ClientPortalPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neon-cyan font-mono text-xs uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-radar"></span>
          Active Build Telemetry
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Client Portal <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">Telemetry.</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Real-time sprint progress, staging previews, and production deliverables for our active studio builds.
        </p>
      </section>

      {/* Main Telemetry Bento */}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Active Project Hero Card */}
        <div className="p-8 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-2xl space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-emerald"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs text-neon-cyan uppercase tracking-wider">Active Sprint Build</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
                Droovee — Fleet Dispatch &amp; Driver Matrix
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-radar"></span>
              SPRINT 3 / 4 · ON SCHEDULE
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Sprint Progress</span>
              <span className="text-neon-cyan font-bold">75% Completed</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-neon-cyan to-neon-blue h-full rounded-full w-3/4 shadow-[0_0_12px_rgba(6,182,212,0.6)]"></div>
            </div>
          </div>

          {/* Milestone Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-500 block">CURRENT PHASE</span>
              <strong className="text-white text-sm">Staging Verification</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-500 block">NEXT DELIVERABLE</span>
              <strong className="text-neon-cyan text-sm">Dec 02, 2026</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-slate-500 block">LEAD ARCHITECT</span>
              <strong className="text-neon-emerald text-sm">Smruti Ranjan</strong>
            </div>
          </div>
        </div>

        {/* Staging & Vault Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Staging Sandbox */}
          <div className="p-6 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">Staging Preview</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neon-cyan/15 text-neon-cyan">LIVE URL</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Interactive preview deployment synced with the latest verified Git branch. Test features before production launch.
            </p>
            <a
              href="https://preview.theflowlabs.online"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono text-neon-cyan hover:underline pt-2"
            >
              <span>Open Staging Environment</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Deliverables Vault */}
          <div className="p-6 rounded-2xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">Deliverables Vault</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-300">SECURE</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Signed architectural documents, database schema diagrams, and production source archives.
            </p>
            <div className="space-y-2 pt-1 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>Architecture_Blueprint_v3.pdf</span>
                <span className="text-neon-cyan">Ready</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>PostgreSQL_Schema_RLS.sql</span>
                <span className="text-neon-cyan">Ready</span>
              </div>
            </div>
          </div>

        </div>

        {/* Direct Founder WhatsApp Access */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-[#0A0E1A] to-cyan-950/20 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-display text-base font-bold text-white">Direct Founder Line</h4>
            <p className="text-slate-400 text-xs">Need an emergency scope adjustment or instant feedback?</p>
          </div>
          <a
            href="https://wa.me/918249681534?text=Hi%20Smruti,%20this%20is%20regarding%20our%20active%20build"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-[#07090E] font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Founders</span>
          </a>
        </div>

      </div>

    </div>
  );
}
