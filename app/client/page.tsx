'use client';

import Link from 'next/link';
import { ExternalLink, Download, FileText, CheckCircle2, MessageSquare, Shield, Clock } from 'lucide-react';

export default function ClientPortalPage() {
  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
      
      {/* Header */}
      <section className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          Active build telemetry
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium text-white tracking-tight leading-[1.1]">
          Client Portal <span className="text-slate-400">Telemetry</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Real-time sprint progress, staging previews, and production deliverables for our active studio builds.
        </p>
      </section>

      {/* Main Telemetry Bento */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Active Project Hero Card */}
        <div className="p-7 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-slate-400">Active sprint build</span>
              <h2 className="font-display text-2xl font-medium text-white mt-0.5">
                Droovee — Fleet Dispatch &amp; Driver Matrix
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Sprint 3 / 4 · On schedule
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Sprint Progress</span>
              <span className="text-white font-medium">75% Completed</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div className="bg-white h-full rounded-full w-3/4"></div>
            </div>
          </div>

          {/* Milestone Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5 font-mono text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-slate-500 text-[10px] uppercase">Active Phase</div>
              <div className="text-white font-medium mt-0.5">Driver Matrix Sync</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-slate-500 text-[10px] uppercase">Next Deploy</div>
              <div className="text-white font-medium mt-0.5">Staging Review (Thu)</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-slate-500 text-[10px] uppercase">Engineers Assigned</div>
              <div className="text-white font-medium mt-0.5">SR, BW (Founders)</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://droovee.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#07090E] font-medium text-xs px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <span>Open live staging app</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://wa.me/918249681534?text=Hi%20The%20Flow%20Labs,%20I'm%20checking%20my%20sprint%20progress"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white font-mono text-xs px-4 py-2 rounded-lg border border-white/10 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Sprint chat (WhatsApp)</span>
            </a>
          </div>
        </div>

        {/* Deliverables Vault */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-display text-base font-medium text-white">Sprint deliverables vault</h3>
            <span className="font-mono text-xs text-slate-500">Encrypted</span>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Architecture Blueprint & Database ERD (v1.2)', size: '2.4 MB · PDF', date: '21 Nov 2026' },
              { name: 'API Schema Contract & Postman Collection', size: '480 KB · JSON', date: '22 Nov 2026' },
              { name: 'Production Staging Build & Environment Access Keys', size: 'Vault Key', date: '24 Nov 2026' },
            ].map((doc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-medium text-white">{doc.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{doc.size} · Uploaded {doc.date}</div>
                  </div>
                </div>
                <button
                  onClick={() => alert('Deliverable vault link copied to clipboard.')}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 border border-white/10 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Access</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
