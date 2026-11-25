'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ClientSession {
  clientEmail: string;
  clientName: string;
  companyName: string;
  projectName: string;
  projectKey: string;
  accessKey: string;
  progress: number;
  activePhase: string;
  assignedFounders: string;
  stagingUrl: string;
}

interface ClientUpdate {
  id: string;
  title: string;
  date: string;
  summary: string;
  badge: string;
}

interface Deliverable {
  name: string;
  type: string;
  size: string;
  date: string;
  status: string;
}

const DEFAULT_CLIENTS: ClientSession[] = [
  {
    clientEmail: 'rohan@droovee.in',
    clientName: 'Rohan Sharma',
    companyName: 'Droovee Mobility',
    projectName: 'Droovee Chauffeur Platform',
    projectKey: 'DRV',
    accessKey: 'DRV-CLIENT-9842',
    progress: 75,
    activePhase: 'Driver Matrix Sync & Database RLS',
    assignedFounders: 'Smruti Ranjan, Biswash',
    stagingUrl: 'https://droovee.in',
  },
];

const DEFAULT_UPDATES: ClientUpdate[] = [
  {
    id: 'up-1',
    title: 'Sprint 3 Staging Deployed & P95 Latency Verified',
    date: '24 Nov 2026',
    summary: 'The dynamic chauffeur distance calculation engine has been deployed to the staging environment. Mapbox routing calls are executing under 120ms P95.',
    badge: 'Staging release',
  },
  {
    id: 'up-2',
    title: 'PostgreSQL Row-Level Security Policies Hardened',
    date: '22 Nov 2026',
    summary: 'Multi-tenant database isolation policies compiled. Customer and driver profiles are strictly segregated at the database engine level.',
    badge: 'Security milestone',
  },
  {
    id: 'up-3',
    title: 'Razorpay Webhooks & Automated GST Tax Engine Live',
    date: '19 Nov 2026',
    summary: 'Integrated automated billing with instant PDF invoice generation and verified HSN codes dispatched via Twilio WhatsApp API.',
    badge: 'Payment rails',
  },
];

const DEFAULT_DELIVERABLES: Deliverable[] = [
  {
    name: 'Architecture Blueprint & Database ERD (v1.2)',
    type: 'PDF Specification',
    size: '2.4 MB',
    date: '21 Nov 2026',
    status: 'Verified',
  },
  {
    name: 'API Schema Contract & Postman Collection',
    type: 'OpenAPI JSON',
    size: '480 KB',
    date: '22 Nov 2026',
    status: 'Active',
  },
  {
    name: 'Staging Environment Credentials & Vault Access Keys',
    type: 'Encrypted Key',
    size: 'Vault Key',
    date: '24 Nov 2026',
    status: 'Secured',
  },
  {
    name: 'Automated GST Invoice Reconciliation Engine',
    type: 'Module Build',
    size: '1.1 MB',
    date: '24 Nov 2026',
    status: 'Ready',
  },
];

export default function ClientPortalPage() {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState<ClientUpdate[]>(DEFAULT_UPDATES);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(DEFAULT_DELIVERABLES);

  // No client session persistence. Real sessions must come from
  // server-issued authentication (Supabase) / authenticated access keys.
  //

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Check localStorage for newly created clients from Flow HQ
    let allClients = [...DEFAULT_CLIENTS];
    try {
      const stored = localStorage.getItem('flow_hq_clients');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.forEach((c: any) => {
          allClients.push({
            clientEmail: c.email,
            clientName: c.name,
            companyName: c.company,
            projectName: c.projectName,
            projectKey: c.projectName.slice(0, 3).toUpperCase(),
            accessKey: c.accessKey,
            progress: 65,
            activePhase: 'Core Module Engineering',
            assignedFounders: 'Smruti Ranjan, Arpita',
            stagingUrl: 'https://staging.theflowlabs.online',
          });
        });
      }
    } catch (err) {
      // ignore
    }

    const email = emailInput.trim().toLowerCase();
    const key = keyInput.trim().toUpperCase();

    if (!email || !key) {
      setErrorMsg('Enter both your client work email and portal access key.');
      setLoading(false);
      return;
    }

    const matched = allClients.find(
      (c) =>
        c.clientEmail.toLowerCase() === email &&
        c.accessKey.toUpperCase() === key
    );

    if (matched) {
      setSession(matched);
    } else {
      setErrorMsg('Invalid client credentials. Please enter a valid work email and portal access key.');
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    setSession(null);
    try {
      localStorage.removeItem('flow_active_client_session');
    } catch (e) {
      // ignore
    }
  };

  // Deliverable downloads are served from signed Storage URLs once the
  // portal is wired to Supabase (Phase 1). Until then downloads are disabled
  // rather than generating a fabricated "verified" certificate client-side.
  const handleDownloadAsset = (_doc: Deliverable) => {
    setErrorMsg('Deliverable downloads are not yet provisioned for this project.');
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
              <label htmlFor="client-email" className="block font-mono text-xs text-slate-300">
                Client work email <span className="text-rose-400">*</span>
              </label>
              <input
                id="client-email"
                type="email"
                required
                placeholder="e.g. rohan@droovee.in"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="client-key" className="block font-mono text-xs text-slate-300">
                Portal access key
              </label>
              <input
                id="client-key"
                type="text"
                placeholder="e.g. DRV-CLIENT-9842"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:normal-case placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#07090E] font-medium text-sm py-2.5 rounded-lg hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors disabled:opacity-50"
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
    <div className="pt-6 sm:pt-8 pb-28 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
      
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between max-w-4xl mx-auto pb-4 border-b border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <span>&larr; Exit to website</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="font-mono text-xs text-white font-medium">
            {session.companyName}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-slate-400">
            {session.projectKey}
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <span className="font-mono text-xs text-slate-400">
            Client: <strong className="text-white font-normal">{session.clientName}</strong>
          </span>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-red-400 transition-colors"
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
        <h1 className="font-display text-3xl sm:text-5xl font-normal text-white tracking-tight leading-[1.1]">
          {session.projectName}
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Real-time delivery progress, staging deployment preview, and production deliverables vault.
        </p>
      </section>

      {/* Main Telemetry Bento */}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Active Project Hero Card */}
        <div className="p-7 sm:p-9 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-slate-400">Build telemetry</span>
              <h2 className="font-display text-2xl font-normal text-white mt-0.5">
                Sprint status and milestone progress
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Sprint 3 of 4 (On schedule)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Sprint completion</span>
              <span className="text-white font-medium">{session.progress}% completed</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${session.progress}%` }}></div>
            </div>
          </div>

          {/* Milestone Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-white/5 font-mono text-xs">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-slate-500 text-[10px]">Active sprint phase</div>
              <div className="text-white font-medium">{session.activePhase}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-slate-500 text-[10px]">Next deploy checkpoint</div>
              <div className="text-white font-medium">Staging review (Thursday)</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-slate-500 text-[10px]">Assigned founding engineers</div>
              <div className="text-white font-medium">{session.assignedFounders}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={session.stagingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#07090E] font-medium text-xs px-5 py-2.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <span>Open live staging app</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={`https://wa.me/918249681534?text=Hi%20The%20Flow%20Labs,%20I'm%20checking%20progress%20on%20${encodeURIComponent(session.projectName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white font-mono text-xs px-4 py-2.5 rounded-lg border border-white/10 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct founder hotline (WhatsApp)</span>
            </a>
          </div>
        </div>

        {/* Sprint Changelog & Published Updates */}
        <div className="p-7 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-display text-lg font-normal text-white">Sprint changelog and published updates</h3>
              <p className="text-slate-400 text-xs">Verified technical milestones published by founding engineers</p>
            </div>
            <span className="font-mono text-xs text-slate-500">Live feed</span>
          </div>

          <div className="space-y-3.5">
            {updates.map((up) => (
              <div key={up.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white text-sm">{up.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300">
                      {up.badge}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">{up.date}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {up.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables Vault */}
        <div className="p-7 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-display text-lg font-normal text-white">Sprint deliverables vault</h3>
              <p className="text-slate-400 text-xs">Architectural contracts, database schemas, and staging access</p>
            </div>
            <span className="font-mono text-xs text-emerald-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>End-to-end encrypted</span>
            </span>
          </div>

          <div className="space-y-2.5">
            {deliverables.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">{doc.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {doc.type} · {doc.size} · Uploaded {doc.date}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadAsset(doc)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-200 border border-white/10 flex items-center gap-1.5 w-fit transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download asset</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
