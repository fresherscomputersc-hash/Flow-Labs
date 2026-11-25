'use client';

import { useState } from 'react';
import { BookOpen, Search, Shield, Rocket, CheckCircle2, DollarSign, Users, ChevronRight, FileCode } from 'lucide-react';

interface SOPItem {
  id: string;
  title: string;
  category: 'DevOps' | 'Security' | 'QA' | 'Client' | 'Finance';
  summary: string;
  checklist: string[];
}

const SOPS: SOPItem[] = [
  {
    id: 'sop-1',
    title: 'Zero-Downtime Deployment & DNS Cutover Protocol',
    category: 'DevOps',
    summary: 'Standard operating procedure for switching production domains, Cloudflare edge caching, and Vercel build verification.',
    checklist: [
      'Run `npm run build` locally and verify zero TypeScript or Next.js static export compilation errors.',
      'Audit environment variables in Vercel project settings: ensure NEXT_PUBLIC_SUPABASE_URL and anon keys match production.',
      'Configure Cloudflare SSL/TLS to Full (Strict) mode to prevent redirect loops.',
      'Verify HTTP security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) via audit script.',
      'Perform live smoke test across mobile breakpoint and desktop navigation.'
    ]
  },
  {
    id: 'sop-2',
    title: 'Secret Vault & Supabase API Access Protocol',
    category: 'Security',
    summary: 'Mandatory rules for handling database service keys, JWT authentication, and Row Level Security isolation.',
    checklist: [
      'NEVER commit service role keys or management tokens to GitHub or client bundles.',
      'All privileged mutations (creating auth users, accepting proposals, marking payouts) MUST go through serverless API routes in `/api`.',
      'Verify that RLS policies are active on all public tables: test that a client token cannot select team payouts or other client records.',
      'Use `is_admin()` helper function with `profiles.status = active` checks to prevent suspended users from administrative access.',
      'Audit log entries must be emitted for every role change, deletion, or invoice status edit.'
    ]
  },
  {
    id: 'sop-3',
    title: 'Pre-Delivery QA & Regression Acceptance Standard',
    category: 'QA',
    summary: 'Acceptance checklist required before submitting a task or milestone for client review.',
    checklist: [
      'Verify responsive layout on iPhone viewport (375px) and standard desktop (1440px).',
      'Check browser console for unhandled promise rejections, React hydration mismatches, or missing key warnings.',
      'Test all form validation states: empty inputs, invalid emails, and server-side 400 error handlers.',
      'Upload work deliverables to the encrypted client deliverables vault with clean semantic naming.',
      'Tag designated founding engineer or peer reviewer in the QA Review submission.'
    ]
  },
  {
    id: 'sop-4',
    title: 'Client Onboarding & Intake Discovery Framework',
    category: 'Client',
    summary: 'End-to-end steps from inbound scoping submission to kickoff sprint.',
    checklist: [
      'Review inbound idea, tech stack, and budget range submitted via /scoping.',
      'Schedule a 25-minute architecture discovery call with the founder or technical lead.',
      'Generate proposal in Proposals CRM with itemized deliverables, hours, and 50% deposit term.',
      'Once proposal is accepted, provision client credentials via /api/onboard and auto-dispatch invite email.',
      'Verify client onboarding checklist: Brand assets (SVG), domain credentials, and third-party API keys collected.'
    ]
  },
  {
    id: 'sop-5',
    title: 'Milestone Billing & Handover Gate Enforcement',
    category: 'Finance',
    summary: 'Rules governing invoice dispatch, receipt issuance, and project completion gates.',
    checklist: [
      'Advance deposit (50%) must be settled before Sprint 1 architecture commences.',
      'Milestone invoices are generated upon staging deployment and client approval.',
      'Handover checklist must be 100% verified (DNS transferred, repo access granted, video walkthrough recorded) before marking project completed.',
      'Issue official PDF/HTML payment receipt and request client testimonial rating upon project closure.',
      'Offer ongoing maintenance retainer agreement for security patches and automated backups.'
    ]
  }
];

export default function SOPLibrary() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSopId, setActiveSopId] = useState<string>('sop-1');

  const filtered = SOPS.filter((s) => {
    const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeSop = SOPS.find((s) => s.id === activeSopId) || SOPS[0];

  return (
    <div className="space-y-7">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display text-xl font-normal text-white">Knowledge Base & SOP Library</h2>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Studio Standard Operating Procedures, architecture checklists, and quality standards
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SOPs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        {['all', 'DevOps', 'Security', 'QA', 'Client', 'Finance'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-white/10 border-white/20 text-white font-medium'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* SOP Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: SOP Index List */}
        <div className="space-y-2.5">
          {filtered.map((sop) => (
            <button
              key={sop.id}
              onClick={() => setActiveSopId(sop.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all space-y-1.5 ${
                activeSop.id === sop.id
                  ? 'bg-white/10 border-cyan-400/50 shadow-lg shadow-cyan-950/20'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-cyan-400 uppercase">{sop.category}</span>
                <span className="text-slate-500">{sop.checklist.length} steps</span>
              </div>
              <div className="text-white font-medium text-xs leading-snug">{sop.title}</div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No matching operating procedures found.
            </div>
          )}
        </div>

        {/* Right: Active SOP Reader */}
        <div className="lg:col-span-2 p-7 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="space-y-2 pb-4 border-b border-white/10">
            <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 uppercase">
              {activeSop.category} Protocol
            </span>
            <h3 className="font-display text-2xl font-normal text-white">{activeSop.title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{activeSop.summary}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono text-slate-300 font-medium uppercase tracking-wider">
              Enforcement & Verification Steps
            </h4>

            <div className="space-y-3">
              {activeSop.checklist.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs leading-relaxed"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="text-slate-300">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
