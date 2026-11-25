'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Download,
  FileText,
  CheckCircle2,
  MessageSquare,
  Shield,
  Clock,
  LogIn,
  LogOut,
  Key,
  Check,
  AlertCircle
} from 'lucide-react';

interface ClientSession {
  clientEmail: string;
  clientName: string;
  companyName: string;
  projectName: string;
  accessKey: string;
}

const DEMO_CLIENTS: ClientSession[] = [
  {
    clientEmail: 'rohan@droovee.in',
    clientName: 'Rohan Sharma',
    companyName: 'Droovee Mobility',
    projectName: 'Droovee: Fleet Dispatch and Driver Matrix',
    accessKey: 'DRV-CLIENT-9842',
  },
];

export default function ClientPortalPage() {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const matched = DEMO_CLIENTS.find(
      (c) =>
        c.clientEmail.toLowerCase() === emailInput.trim().toLowerCase() ||
        c.accessKey.toUpperCase() === keyInput.trim().toUpperCase()
    );

    if (matched || emailInput.trim().length > 3) {
      setSession(
        matched || {
          clientEmail: emailInput.trim(),
          clientName: emailInput.split('@')[0],
          companyName: 'Client Workspace',
          projectName: 'Custom Engineering Sprint',
          accessKey: keyInput.trim() || 'FLW-PORTAL-KEY',
        }
      );
    } else {
      setErrorMsg('Invalid client email or portal access key. Please verify credentials with your studio lead.');
    }
    setLoading(false);
  };

  const handleQuickLogin = (client: ClientSession) => {
    setSession(client);
  };

  const handleSignOut = () => {
    setSession(null);
  };

  // ================= VIEW: CLIENT LOGIN SCREEN =================
  if (!session) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Client delivery portal
            </div>
            <h1 className="font-display text-2xl font-normal text-white">Client Portal Access</h1>
            <p className="text-slate-400 text-xs">
              Inspect sprint milestones, staging previews, and download production deliverables
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-slate-300">Client work email</label>
              <input
                type="email"
                required
                placeholder="e.g. rohan@droovee.in"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-slate-300">Portal access key</label>
              <input
                type="text"
                placeholder="e.g. DRV-CLIENT-9842"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder-slate-500 text-sm focus:outline-none focus:border-white/30 uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#07090E] font-medium text-sm py-2.5 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying key...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Access project portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="text-[11px] font-mono text-slate-400">Sample client credentials:</div>
            <button
              type="button"
              onClick={() => handleQuickLogin(DEMO_CLIENTS[0])}
              className="w-full p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <span>Droovee Client (Rohan Sharma)</span>
              <span className="text-emerald-400">DRV-CLIENT-9842 &rarr;</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="font-mono text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              &larr; Exit to public website
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ================= VIEW: AUTHENTICATED CLIENT DASHBOARD =================
  return (
    <div className="pt-6 sm:pt-10 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between max-w-4xl mx-auto pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <span>&larr; Exit to website</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="font-mono text-xs text-slate-300">
            {session.companyName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-slate-400">
            {session.clientName}
          </span>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <section className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Active sprint telemetry
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-normal text-white tracking-tight">
          {session.projectName}
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Real-time delivery progress, staging deployment preview, and production deliverables vault.
        </p>
      </section>

      {/* Main Telemetry Bento */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Active Project Hero Card */}
        <div className="p-7 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-slate-400">Active sprint build</span>
              <h2 className="font-display text-2xl font-normal text-white mt-0.5">
                {session.projectName}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Sprint 3 of 4 (On schedule)
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
              <div className="text-slate-500 text-[10px]">Active phase</div>
              <div className="text-white font-medium mt-0.5">Driver Matrix Sync</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-slate-500 text-[10px]">Next deploy</div>
              <div className="text-white font-medium mt-0.5">Staging Review (Thu)</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-slate-500 text-[10px]">Engineers assigned</div>
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
              <span>Direct founder chat (WhatsApp)</span>
            </a>
          </div>
        </div>

        {/* Deliverables Vault */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-display text-base font-normal text-white">Sprint deliverables vault</h3>
            <span className="font-mono text-xs text-slate-500">Encrypted</span>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Architecture Blueprint & Database ERD (v1.2)', size: '2.4 MB (PDF)', date: '21 Nov 2026' },
              { name: 'API Schema Contract & Postman Collection', size: '480 KB (JSON)', date: '22 Nov 2026' },
              { name: 'Production Staging Build & Environment Access Keys', size: 'Vault Key', date: '24 Nov 2026' },
            ].map((doc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-medium text-white">{doc.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{doc.size}, Uploaded {doc.date}</div>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Deliverable ${doc.name} copied to clipboard.`)}
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
