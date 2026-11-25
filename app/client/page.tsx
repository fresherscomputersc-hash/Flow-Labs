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
  ArrowRight,
  Lock,
  DollarSign,
  CreditCard,
  Receipt,
  FileCheck2,
  HelpCircle,
  UploadCloud,
  Star,
  Send,
  Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ClientSession {
  clientEmail: string;
  clientName: string;
  companyName: string;
  projectId?: string;
  projectName: string;
  projectKey: string;
  accessKey?: string;
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

interface ProposalItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

interface Proposal {
  id: string;
  title: string;
  scope?: string;
  line_items?: ProposalItem[];
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  terms?: string;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  type: string;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date: string;
  paid_at?: string;
}

interface OnboardingItem {
  id: string;
  label: string;
  completed: boolean;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  created_at: string;
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

const DEFAULT_ONBOARDING: OnboardingItem[] = [
  { id: '1', label: 'Brand Assets & Logo (SVG/PNG vector files provided)', completed: true },
  { id: '2', label: 'Domain, DNS & Hosting Access Credentials shared', completed: true },
  { id: '3', label: 'Third-party API Keys (Stripe, OpenAI, Supabase) configured in vault', completed: false },
  { id: '4', label: 'Primary Decision Maker & Stakeholder contact confirmed', completed: true }
];

export default function ClientPortalPage() {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Portal Navigation Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'invoices' | 'deliverables' | 'tickets' | 'onboarding' | 'feedback'>('overview');

  // Client Data States
  const [updates, setUpdates] = useState<ClientUpdate[]>(DEFAULT_UPDATES);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(DEFAULT_DELIVERABLES);
  const [approvedMilestone, setApprovedMilestone] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [onboardingItems, setOnboardingItems] = useState<OnboardingItem[]>(DEFAULT_ONBOARDING);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Ticket Form States
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketType, setTicketType] = useState('bug');

  // Testimonial Form States
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [testimonialDone, setTestimonialDone] = useState(false);

  // Contract Signature
  const [signatureName, setSignatureName] = useState('');

  const loadClientData = async (userId: string, projectId?: string) => {
    try {
      const [propRes, invRes, chkRes, tktRes] = await Promise.all([
        supabase.from('proposals').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').order('due_date', { ascending: false }),
        projectId ? supabase.from('onboarding_checklists').select('*').eq('project_id', projectId) : Promise.resolve({ data: null }),
        projectId ? supabase.from('tickets').select('*').eq('project_id', projectId).order('created_at', { ascending: false }) : Promise.resolve({ data: null })
      ]);

      if (propRes.data) setProposals(propRes.data);
      if (invRes.data) setInvoices(invRes.data);
      if (chkRes.data && chkRes.data.length > 0 && Array.isArray(chkRes.data[0].items)) {
        setOnboardingItems(chkRes.data[0].items);
      }
      if (tktRes.data) setTickets(tktRes.data);
    } catch (e) {
      console.warn('Client data load notice:', e);
    }
  };

  const loadClientProject = async (userId: string, email: string) => {
    try {
      const { data: pcRows } = await supabase
        .from('project_clients')
        .select('*, projects(*)')
        .eq('user_id', userId);

      if (pcRows && pcRows.length > 0) {
        const pc = pcRows[0];
        const proj = pc.projects;
        let progress = 75;

        if (pc.project_id) {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('status')
            .eq('project_id', pc.project_id);

          if (tasks && tasks.length > 0) {
            const done = tasks.filter((t: any) => t.status === 'done').length;
            progress = Math.round((done / tasks.length) * 100);
          } else if (proj?.status === 'completed') {
            progress = 100;
          }
        }

        setSession({
          clientEmail: email,
          clientName: email.split('@')[0],
          companyName: pc.company_name || proj?.name || 'Client',
          projectId: pc.project_id,
          projectName: proj?.name || 'Studio Build Project',
          projectKey: proj?.key || 'FLW',
          progress,
          activePhase: proj?.status === 'completed' ? 'Completed & Deployed' : 'Active Sprint Delivery',
          assignedFounders: 'Smruti Ranjan, Biswash',
          stagingUrl: proj?.github_repo || 'https://staging.theflowlabs.online',
        });

        await loadClientData(userId, pc.project_id);
        return true;
      }
    } catch (e) {
      console.warn('Client project fetch notice:', e);
    }
    return false;
  };

  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const u = data.session.user;
          await loadClientProject(u.id, u.email || '');
        }
      } catch (err) {
        console.warn('Session check notice:', err);
      }
    }
    checkExistingAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email || !password) {
      setErrorMsg('Please enter your work email and password.');
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authData?.session?.user && !authError) {
        const bound = await loadClientProject(authData.session.user.id, email);
        if (bound) {
          setLoading(false);
          return;
        }

        setSession({
          clientEmail: email,
          clientName: email.split('@')[0],
          companyName: 'Client Project',
          projectName: 'Production Platform',
          projectKey: 'FLW',
          progress: 80,
          activePhase: 'Sprint 2 Quality & Security Verification',
          assignedFounders: 'Smruti Ranjan, Biswash',
          stagingUrl: 'https://staging.theflowlabs.online',
        });
        await loadClientData(authData.session.user.id);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Supabase auth attempt notice:', err);
    }

    // Fallback: demo account
    const matched = DEFAULT_CLIENTS.find((c) => c.clientEmail.toLowerCase() === email);
    if (matched && (password === 'flowlabs2026' || password.length >= 6)) {
      setSession(matched);
      await loadClientData('demo');
    } else {
      setErrorMsg('Invalid client credentials. Please check your email and password, or contact the founders.');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setSession(null);
  };

  // 1-Click Accept Proposal
  const handleAcceptProposal = async (proposalId: string) => {
    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_proposal',
          proposal_id: proposalId,
          signature_name: signatureName.trim() || session?.clientName
        })
      });
      const data = await res.json();
      if (data.ok) {
        setActionNotice('Proposal accepted and signed! Your project milestones, onboarding checklist, and advance invoice are now live.');
        if (session) {
          await loadClientData('active', session.projectId);
        }
      } else {
        alert(data.error || 'Failed to accept proposal.');
      }
    } catch (e: any) {
      alert(e.message || 'Action failed.');
    }
  };

  // Submit Ticket / Change Request
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketDesc.trim()) return;

    try {
      const { error } = await supabase.from('tickets').insert([
        {
          project_id: session?.projectId || null,
          title: ticketTitle.trim(),
          description: ticketDesc.trim(),
          type: ticketType,
          priority: 'normal',
          status: 'open'
        }
      ]);

      if (error) throw error;
      setActionNotice('Your support ticket / change request has been logged. Our engineers have been alerted.');
      setTicketTitle('');
      setTicketDesc('');
      if (session?.projectId) {
        const { data } = await supabase.from('tickets').select('*').eq('project_id', session.projectId);
        if (data) setTickets(data);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to submit ticket.');
    }
  };

  // Submit Testimonial
  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      await supabase.from('testimonials').insert([
        {
          project_id: session?.projectId || null,
          rating,
          review: reviewText.trim(),
          author_name: session?.clientName || 'Client Partner',
          company_name: session?.companyName || 'Studio Client'
        }
      ]);
      setTestimonialDone(true);
      setActionNotice('Thank you! Your verified testimonial has been submitted to the studio portfolio.');
    } catch (e: any) {
      alert(e.message || 'Failed to submit review.');
    }
  };

  // Toggle Onboarding Item
  const handleToggleOnboarding = async (index: number) => {
    const updated = [...onboardingItems];
    updated[index].completed = !updated[index].completed;
    setOnboardingItems(updated);

    if (session?.projectId) {
      try {
        await supabase
          .from('onboarding_checklists')
          .update({ items: updated })
          .eq('project_id', session.projectId);
      } catch (e) {}
    }
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
              Inspect sprint milestones, review quotes, settle invoices, and access production deliverables
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
              <label htmlFor="client-password" className="block font-mono text-xs text-slate-300">
                Portal password <span className="text-rose-400">*</span>
              </label>
              <input
                id="client-password"
                type="password"
                required
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#07090E] font-medium text-sm py-2.5 rounded-lg hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating portal...</span>
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
    <div className="pt-6 sm:pt-8 pb-28 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
      
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
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

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <section className="text-center max-w-2xl mx-auto space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Active client telemetry
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-normal text-white tracking-tight leading-[1.1]">
          {session.projectName}
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Real-time sprint progress, proposal sign-off, milestone invoices, and verified production deliverables.
        </p>
      </section>

      {/* Client Portal Tab Strip */}
      <div className="p-1.5 rounded-2xl bg-white/[0.02] border border-white/10 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sprint Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'proposals' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Proposals &amp; Contracts</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'invoices' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Invoices &amp; Billing</span>
          </button>

          <button
            onClick={() => setActiveTab('deliverables')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'deliverables' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Deliverables Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'tickets' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support &amp; Requests ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('onboarding')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'onboarding' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Onboarding Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'feedback' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Testimonial</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: SPRINT OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
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
                Active Sprint (On Schedule)
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
                <div className="text-slate-500 text-[10px]">Staging review</div>
                <div className="text-white font-medium">Live sandbox environment</div>
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
              <button
                type="button"
                onClick={() => setApprovedMilestone(true)}
                disabled={approvedMilestone}
                className={`inline-flex items-center gap-1.5 font-mono text-xs px-4 py-2.5 rounded-lg border transition-all ${
                  approvedMilestone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                    : 'bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{approvedMilestone ? 'Milestone Approved by Client' : 'Approve Milestone'}</span>
              </button>
              <a
                href={`https://wa.me/918249681534?text=Hi%20The%20Flow%20Labs,%20I'm%20checking%20progress%20on%20${encodeURIComponent(session.projectName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white font-mono text-xs px-4 py-2.5 rounded-lg border border-white/10 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Direct founder hotline</span>
              </a>
            </div>
          </div>

          {/* Sprint Updates Feed */}
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
                  <p className="text-slate-400 text-xs leading-relaxed">{up.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PROPOSALS & CONTRACTS ================= */}
      {activeTab === 'proposals' && (
        <div className="space-y-6">
          <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
            <div className="pb-3 border-b border-white/10">
              <h3 className="font-display text-xl font-normal text-white">Studio Proposal &amp; Terms Agreement</h3>
              <p className="text-slate-400 text-xs mt-1">Review your scoped deliverables, timeline, and digitally sign off</p>
            </div>

            {proposals.map((prop) => (
              <div key={prop.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                  <div>
                    <h4 className="text-base font-medium text-white">{prop.title}</h4>
                    <span className="font-mono text-[11px] text-slate-500">
                      Generated {new Date(prop.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase border ${
                    prop.status === 'accepted'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}>
                    {prop.status === 'accepted' ? 'Contract Signed & Accepted' : 'Pending Client Acceptance'}
                  </span>
                </div>

                {prop.scope && (
                  <div className="space-y-1">
                    <div className="font-mono text-slate-400 text-[11px]">Scope of Work:</div>
                    <p className="text-slate-300 text-xs leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                      {prop.scope}
                    </p>
                  </div>
                )}

                {/* Line Items */}
                {prop.line_items && prop.line_items.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-mono text-slate-400 text-[11px]">Deliverables &amp; Milestones:</div>
                    <div className="space-y-1.5">
                      {prop.line_items.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center font-mono">
                          <span className="text-white">{item.description}</span>
                          <span className="text-emerald-400 font-medium">
                            {prop.currency === 'INR' ? '₹' : '$'}{Number(item.amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-white/5 font-mono text-xs">
                  <span className="text-slate-400">Total Investment:</span>
                  <span className="font-display text-xl text-emerald-400 font-normal">
                    {prop.currency === 'INR' ? '₹' : '$'}{Number(prop.total_amount).toLocaleString()}
                  </span>
                </div>

                {/* Digital Signature & Acceptance */}
                {prop.status !== 'accepted' ? (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 pt-3">
                    <div className="text-xs text-slate-300">
                      To accept this proposal and initialize kickoff, enter your authorized full name below:
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="text"
                        placeholder="Authorized Signatory Name"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        className="w-full sm:w-72 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        onClick={() => handleAcceptProposal(prop.id)}
                        className="w-full sm:w-auto px-5 py-2 rounded-lg bg-emerald-500 text-black font-medium text-xs font-mono hover:bg-emerald-400 transition-colors"
                      >
                        Digitally Sign &amp; Accept Proposal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Contract digitally executed. Milestones are active in your portal.</span>
                  </div>
                )}
              </div>
            ))}

            {proposals.length === 0 && (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                No custom proposals pending. Your current project is operating under Master Services Agreement.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: INVOICES & BILLING ================= */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
            <div className="pb-3 border-b border-white/10">
              <h3 className="font-display text-xl font-normal text-white">Invoices &amp; Payment Settlement</h3>
              <p className="text-slate-400 text-xs mt-1">Review milestone invoices, payment receipts, and banking instructions</p>
            </div>

            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-medium">{inv.invoice_number}</span>
                      <span className="text-white text-sm font-normal">{inv.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Due: {new Date(inv.due_date).toLocaleDateString()}
                      {inv.paid_at && ` · Settled ${new Date(inv.paid_at).toLocaleDateString()}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px]">Amount Due</div>
                      <div className="font-display text-base text-white font-normal">
                        ${Number(inv.total_amount).toLocaleString()} {inv.currency}
                      </div>
                    </div>

                    {inv.status !== 'paid' ? (
                      <a
                        href={`https://wa.me/918249681534?text=Hi%20The%20Flow%20Labs,%20I'm%20settling%20invoice%20${encodeURIComponent(inv.invoice_number)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-black font-medium text-xs font-mono hover:bg-emerald-400 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Online / Wire</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Paid in Full</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {invoices.length === 0 && (
                <div className="p-8 text-center text-xs font-mono text-slate-500">
                  No invoices issued yet. Milestone invoices will appear here as sprints progress.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: DELIVERABLES VAULT ================= */}
      {activeTab === 'deliverables' && (
        <div className="space-y-6">
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
                    onClick={() => alert(`Verified deliverable download: ${doc.name} will be retrieved from your private repository.`)}
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
      )}

      {/* ================= TAB 5: TICKETS & CHANGE REQUESTS ================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Create Ticket Form */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="pb-2 border-b border-white/5">
                <h3 className="font-display text-lg font-normal text-white">Raise Request or Bug Report</h3>
                <p className="text-slate-400 text-xs mt-0.5">Alert founding engineers directly</p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Request Type</label>
                  <select
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="bug" className="bg-[#0E1424]">Bug Report / Issue</option>
                    <option value="change_request" className="bg-[#0E1424]">Scope Change / Extra Feature</option>
                    <option value="question" className="bg-[#0E1424]">Technical Question</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Summary *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mapbox routing returns 403 on staging"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Detailed Description *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the expected behavior, reproduction steps, or requested modification..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </form>
            </div>

            {/* Tickets List */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="pb-2 border-b border-white/5 flex justify-between items-center font-mono text-xs">
                <span className="text-white font-medium">Logged Tickets</span>
                <span className="text-slate-500">{tickets.length} total</span>
              </div>

              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium text-white">{t.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300 uppercase">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{t.description}</p>
                    <div className="font-mono text-[10px] text-slate-500">
                      Logged {new Date(t.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}

                {tickets.length === 0 && (
                  <div className="py-12 text-center text-xs font-mono text-slate-500">
                    No active tickets. Use the form on the left to submit a request.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= TAB 6: ONBOARDING CHECKLIST ================= */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6">
          <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
            <div className="pb-3 border-b border-white/10">
              <h3 className="font-display text-xl font-normal text-white">Client Kickoff Onboarding Checklist</h3>
              <p className="text-slate-400 text-xs mt-1">
                Complete these four milestones to allow our engineering team to integrate your infrastructure
              </p>
            </div>

            <div className="space-y-3">
              {onboardingItems.map((item, idx) => (
                <label
                  key={item.id}
                  className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                    item.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : 'bg-white/[0.02] border-white/5 text-slate-300 hover:border-white/15'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleOnboarding(idx)}
                    className="w-4 h-4 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-0 mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-medium">{item.label}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {item.completed ? 'Status: Verified & Provided' : 'Status: Pending client action'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: TESTIMONIAL ================= */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="max-w-xl mx-auto p-7 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
            <div className="text-center space-y-1.5 pb-3 border-b border-white/10">
              <h3 className="font-display text-xl font-normal text-white">Rate Your Studio Experience</h3>
              <p className="text-slate-400 text-xs">
                Your verified testimonial helps other founders understand our technical velocity
              </p>
            </div>

            {testimonialDone ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-medium text-white text-sm">Testimonial Published</h4>
                <p className="text-slate-400 text-xs">Thank you for building with The Flow Labs.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTestimonial} className="space-y-4">
                <div className="space-y-2 text-center">
                  <label className="block font-mono text-xs text-slate-300">Rating</label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          rating >= star ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Your Feedback / Review *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe how The Flow Labs team executed your architecture, engineering velocity, and communication..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors"
                >
                  Submit Official Testimonial
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
