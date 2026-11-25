'use client';

import { useState, useEffect } from 'react';
import {
  Target,
  RefreshCw,
  Plus,
  FileText,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
  Building,
  UserCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProposalBuilderModal from './ProposalBuilderModal';

export interface Lead {
  id: number;
  name: string;
  contact: string;
  project_type: string;
  budget: string;
  idea?: string;
  stage?: 'new' | 'contacted' | 'proposal_sent' | 'won' | 'lost';
  created_at: string;
  notes?: string;
}

export interface Proposal {
  id: string;
  lead_id?: number | null;
  client_id?: string | null;
  title: string;
  scope?: string;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  terms?: string;
  created_at: string;
  accepted_at?: string;
}

interface LeadsCRMProps {
  onOnboardCustomer: (lead: Lead) => void;
  onRefreshProjects: () => void;
}

export default function LeadsCRM({ onOnboardCustomer, onRefreshProjects }: LeadsCRMProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeadForProposal, setSelectedLeadForProposal] = useState<Lead | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [acceptingProposalId, setAcceptingProposalId] = useState<string | null>(null);

  const fetchLeadsAndProposals = async () => {
    setLoading(true);
    try {
      const { data: leadData } = await supabase
        .from('site_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadData) {
        setLeads(leadData);
      }

      const { data: propData } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (propData) {
        setProposals(propData);
      }
    } catch (err) {
      console.warn('Error fetching leads/proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsAndProposals();
  }, []);

  const handleUpdateStage = async (leadId: number, newStage: Lead['stage']) => {
    try {
      await supabase
        .from('site_leads')
        .update({ stage: newStage })
        .eq('id', leadId);

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
      );
      setActionNotice(`Lead stage updated to ${newStage}`);
      setTimeout(() => setActionNotice(''), 3000);
    } catch (e: any) {
      console.warn('Failed to update stage:', e);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    setAcceptingProposalId(proposalId);
    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_proposal',
          proposal_id: proposalId
        })
      });
      const data = await res.json();
      if (data.ok) {
        setActionNotice('Proposal accepted! Project initialized with pre-built milestones, checklist and advance invoice.');
        await fetchLeadsAndProposals();
        onRefreshProjects();
      } else {
        alert(data.error || 'Failed to accept proposal.');
      }
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    } finally {
      setAcceptingProposalId(null);
      setTimeout(() => setActionNotice(''), 4000);
    }
  };

  const stages: { key: Lead['stage']; label: string; count: number; color: string }[] = [
    { key: 'new', label: 'New Intake', count: leads.filter(l => !l.stage || l.stage === 'new').length, color: 'text-cyan-400 border-cyan-400/30' },
    { key: 'contacted', label: 'Contacted & Discovery', count: leads.filter(l => l.stage === 'contacted').length, color: 'text-amber-400 border-amber-400/30' },
    { key: 'proposal_sent', label: 'Proposal / Quote Sent', count: leads.filter(l => l.stage === 'proposal_sent').length, color: 'text-purple-400 border-purple-400/30' },
    { key: 'won', label: 'Won / Converted', count: leads.filter(l => l.stage === 'won').length, color: 'text-emerald-400 border-emerald-400/30' },
    { key: 'lost', label: 'Lost / Closed', count: leads.filter(l => l.stage === 'lost').length, color: 'text-slate-500 border-slate-500/30' }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display text-xl font-normal text-white">Inbound Leads CRM & Proposals</h2>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Track inquiries across discovery, assemble quotes, and auto-convert accepted proposals into studio projects
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedLeadForProposal(null);
              setShowProposalModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Proposal</span>
          </button>
          <button
            onClick={fetchLeadsAndProposals}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync CRM</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
        {stages.map((st) => {
          const stageLeads = leads.filter(l => (st.key === 'new' ? (!l.stage || l.stage === 'new') : l.stage === st.key));
          return (
            <div key={st.key} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 min-h-[300px]">
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/5">
                <span className={`font-medium ${st.color.split(' ')[0]}`}>{st.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-400 font-mono">{stageLeads.length}</span>
              </div>

              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 space-y-2.5 text-xs transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-medium text-white text-sm">{lead.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/5 text-slate-300 border border-white/5">
                          {lead.project_type || 'Custom'}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-400">
                        {lead.contact}
                      </div>
                      {lead.budget && (
                        <div className="font-mono text-[11px] text-emerald-400 font-medium">
                          Budget: {lead.budget}
                        </div>
                      )}
                      {lead.idea && (
                        <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2 mt-1">
                          {lead.idea}
                        </p>
                      )}
                    </div>

                    {/* Stage selector dropdown */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1 text-[10px] font-mono">
                      <span className="text-slate-500">Stage:</span>
                      <select
                        value={lead.stage || 'new'}
                        onChange={(e) => handleUpdateStage(lead.id, e.target.value as any)}
                        className="px-1.5 py-1 rounded bg-white/5 border border-white/10 text-white font-mono text-[10px] focus:outline-none"
                      >
                        <option value="new" className="bg-[#0E1424]">New</option>
                        <option value="contacted" className="bg-[#0E1424]">Contacted</option>
                        <option value="proposal_sent" className="bg-[#0E1424]">Proposal Sent</option>
                        <option value="won" className="bg-[#0E1424]">Won</option>
                        <option value="lost" className="bg-[#0E1424]">Lost</option>
                      </select>
                    </div>

                    {/* Quick action buttons */}
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedLeadForProposal(lead);
                          setShowProposalModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-cyan-400 border border-white/10 transition-colors"
                        title="Draft a proposal for this lead"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Quote</span>
                      </button>

                      <button
                        onClick={() => onOnboardCustomer(lead)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-mono text-emerald-400 border border-emerald-500/20 transition-colors ml-auto"
                        title="Provision client portal account and send credentials"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Onboard</span>
                      </button>
                    </div>

                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="py-8 text-center text-[11px] font-mono text-slate-600">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Studio Proposals & Quotes Vault */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div>
            <h3 className="font-display text-lg font-normal text-white">Studio Proposals & Scoped Quotes</h3>
            <p className="text-slate-400 text-xs">Active and historical proposals with 1-click project initialization</p>
          </div>
          <span className="font-mono text-xs text-slate-400">{proposals.length} proposals logged</span>
        </div>

        <div className="space-y-3">
          {proposals.map((prop) => (
            <div
              key={prop.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">{prop.title}</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase border ${
                    prop.status === 'accepted'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : prop.status === 'sent'
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    {prop.status}
                  </span>
                </div>
                {prop.scope && (
                  <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">{prop.scope}</p>
                )}
                <div className="font-mono text-[11px] text-slate-500">
                  Created {new Date(prop.created_at).toLocaleDateString()} · Terms: {prop.terms || 'Net 14'}
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-center font-mono">
                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">Total Proposal Value</div>
                  <div className="font-display text-base text-emerald-400 font-normal">
                    {prop.currency === 'INR' ? '₹' : '$'}{Number(prop.total_amount).toLocaleString()}
                  </div>
                </div>

                {prop.status !== 'accepted' && (
                  <button
                    onClick={() => handleAcceptProposal(prop.id)}
                    disabled={acceptingProposalId === prop.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs transition-colors whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{acceptingProposalId === prop.id ? 'Provisioning...' : 'Accept & Auto-Create Project'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {proposals.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No proposals drafted yet. Click &quot;Create Proposal&quot; above to assemble your first scope.
            </div>
          )}
        </div>
      </div>

      {/* Proposal Builder Modal */}
      <ProposalBuilderModal
        isOpen={showProposalModal}
        onClose={() => {
          setShowProposalModal(false);
          setSelectedLeadForProposal(null);
        }}
        leads={leads}
        clients={[]}
        initialLead={selectedLeadForProposal}
        onProposalCreated={async () => {
          setActionNotice('Proposal successfully generated and saved.');
          await fetchLeadsAndProposals();
        }}
      />

    </div>
  );
}
