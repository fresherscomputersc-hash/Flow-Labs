'use client';

import { useState } from 'react';
import { X, Plus, Trash2, FileText, CheckCircle2, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ProposalItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

interface ProposalBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: any[];
  clients: any[];
  initialLead?: any | null;
  onProposalCreated: () => void;
}

export default function ProposalBuilderModal({
  isOpen,
  onClose,
  leads,
  clients,
  initialLead,
  onProposalCreated
}: ProposalBuilderModalProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLead ? String(initialLead.id) : '');
  const [title, setTitle] = useState(initialLead ? `Studio Proposal for ${initialLead.name}` : '');
  const [scope, setScope] = useState(initialLead?.idea || '');
  const [currency, setCurrency] = useState('INR');
  const [terms, setTerms] = useState('50% advance deposit upon acceptance. Remaining 50% upon final production delivery. Net 14 payment terms.');
  const [lineItems, setLineItems] = useState<ProposalItem[]>([
    { description: 'Core Architecture, DB Schema & API Spec', hours: 20, rate: 60, amount: 1200 },
    { description: 'Frontend Implementation & Design System', hours: 35, rate: 60, amount: 2100 },
    { description: 'Integrations, QA Testing & Deployment', hours: 15, rate: 60, amount: 900 }
  ]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const totalAmount = lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  const handleUpdateItem = (index: number, field: keyof ProposalItem, val: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: val };
    if (field === 'hours' || field === 'rate') {
      const h = field === 'hours' ? Number(val) : item.hours;
      const r = field === 'rate' ? Number(val) : item.rate;
      item.amount = (h || 0) * (r || 0);
    }
    updated[index] = item;
    setLineItems(updated);
  };

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      { description: 'Custom Feature / Module Sprint', hours: 10, rate: 60, amount: 600 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Proposal title is required.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const payload: any = {
        title: title.trim(),
        scope: scope.trim(),
        currency,
        line_items: lineItems,
        total_amount: totalAmount,
        terms: terms.trim(),
        status: 'draft',
        lead_id: selectedLeadId ? Number(selectedLeadId) : null
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert([payload])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      // If tied to lead, advance lead stage to proposal_sent
      if (selectedLeadId) {
        await supabase
          .from('site_leads')
          .update({ stage: 'proposal_sent' })
          .eq('id', Number(selectedLeadId));
      }

      onProposalCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create proposal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full p-6 sm:p-7 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-6 my-8">
        
        <div className="flex justify-between items-start pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display text-xl font-normal text-white">Create Studio Proposal & Quote</h3>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Assemble deliverables, milestones, line items, and payment terms for client review
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block font-mono text-xs text-slate-300">Proposal Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. NextGen Telehealth Platform Build"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-xs text-slate-300">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="INR" className="bg-[#0E1424]">INR (₹)</option>
                <option value="USD" className="bg-[#0E1424]">USD ($)</option>
                <option value="EUR" className="bg-[#0E1424]">EUR (€)</option>
                <option value="GBP" className="bg-[#0E1424]">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-xs text-slate-300">Attach to Inbound Lead (Optional)</label>
            <select
              value={selectedLeadId}
              onChange={(e) => {
                setSelectedLeadId(e.target.value);
                const lead = leads.find(l => String(l.id) === e.target.value);
                if (lead) {
                  setTitle(`Studio Proposal for ${lead.name}`);
                  if (lead.idea) setScope(lead.idea);
                }
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="" className="bg-[#0E1424]">-- None / Direct Quote --</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id} className="bg-[#0E1424]">
                  {l.name} ({l.contact}) - {l.project_type || 'Custom'} [{l.budget || 'Open'}]
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-xs text-slate-300">Scope & Technical Architecture Overview</label>
            <textarea
              rows={3}
              placeholder="Detail the sprint architecture, key deliverables, API integrations, and requirements..."
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>

          {/* Line Items Table */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 font-medium">Deliverables & Line Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add item</span>
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Deliverable description"
                    value={item.description}
                    onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                    className="flex-1 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        placeholder="Hours"
                        value={item.hours}
                        onChange={(e) => handleUpdateItem(idx, 'hours', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-center focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <span className="text-slate-500 font-mono">×</span>
                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => handleUpdateItem(idx, 'rate', Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-center focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <span className="text-slate-500 font-mono">=</span>
                    <div className="w-24 font-mono font-medium text-right text-emerald-400">
                      {currency === 'INR' ? '₹' : '$'}{item.amount.toLocaleString()}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={lineItems.length === 1}
                      className="p-1 text-slate-500 hover:text-red-400 disabled:opacity-20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end items-center gap-3 pt-2 text-xs font-mono">
              <span className="text-slate-400">Calculated Proposal Total:</span>
              <span className="font-display text-lg text-emerald-400 font-normal">
                {currency === 'INR' ? '₹' : '$'}{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <label className="block font-mono text-xs text-slate-300">Payment Terms & Milestones</label>
            <textarea
              rows={2}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 leading-relaxed font-mono"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Generating Proposal...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Proposal</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
