'use client';

import { useState } from 'react';
import { Check, Send, MessageSquare, Sparkles, Layers, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DomainOption {
  id: string;
  name: string;
  basePrice: number;
  baseWeeks: number;
  desc: string;
}

const DOMAINS: DomainOption[] = [
  { id: 'web', name: 'Web Application', basePrice: 40000, baseWeeks: 2, desc: 'Responsive frontends, high-speed landing suites, and customer portals' },
  { id: 'platform', name: 'Custom Platform', basePrice: 75000, baseWeeks: 4, desc: 'Multi-role operational consoles, marketplace logic, and automated billing' },
  { id: 'ai', name: 'AI and Automation', basePrice: 60000, baseWeeks: 3, desc: 'RAG pipelines, autonomous agents, and Meta WhatsApp Cloud bots' },
  { id: 'audit', name: 'Architecture Audit', basePrice: 30000, baseWeeks: 1, desc: 'Performance benchmarks, security hardening, and database migration' },
];

const FEATURES = [
  { id: 'whatsapp', name: 'WhatsApp Automation and Meta Cloud API', price: 15000 },
  { id: 'postgres', name: 'Realtime PostgreSQL and Row-Level Security', price: 20000 },
  { id: 'rag', name: 'Custom AI RAG Pipeline and Vector Embeddings', price: 25000 },
  { id: 'admin', name: 'Multi-Role Internal Admin Console (Flow HQ)', price: 20000 },
];

interface BudgetTier {
  id: '0-20k' | '20-50k' | '50-1L+';
  label: string;
  priceDisplay: string;
  title: string;
  durationWeeks: number;
  desc: string;
  highlights: string[];
}

const BUDGET_TIERS: BudgetTier[] = [
  {
    id: '0-20k',
    label: '0 - 20k',
    priceDisplay: '₹0 - ₹20,000',
    title: 'Rapid MVP & Frontend Sprint',
    durationWeeks: 1,
    desc: 'High-speed landing suites, prototype UI components, visual redesign, or focused bug-fixing sprint.',
    highlights: ['Single Page / High-Conversion Landing', 'Next.js 15 & Tailwind System', 'Sub-second paints & mobile layout', '1-2 Week Turnaround'],
  },
  {
    id: '20-50k',
    label: '20 - 50k',
    priceDisplay: '₹20,000 - ₹50,000',
    title: 'Production Web Application',
    durationWeeks: 3,
    desc: 'Full-stack application with Supabase PostgreSQL, user auth, dynamic routing, and custom business logic.',
    highlights: ['Full-Stack Web Application', 'Supabase Database & Row-Level Security', 'Customer Portal & Dashboard', '2-4 Week Delivery'],
  },
  {
    id: '50-1L+',
    label: '50 - 1L+',
    priceDisplay: '₹50,000 - ₹1,00,000+',
    title: 'Scaled Platform & AI Systems',
    durationWeeks: 6,
    desc: 'End-to-end multi-tenant platform, custom AI RAG/agent workflows, WhatsApp Meta Cloud API, and automated billing.',
    highlights: ['Multi-Tenant Operational Platform', 'Custom AI Pipeline & WhatsApp Cloud API', 'Flow HQ Admin Console & Automated Billing', '4-8 Week Dedicated Sprint'],
  },
];

export default function ScopingPage() {
  // Mode Selection: "budget" or "package"
  const [scopeMode, setScopeMode] = useState<'budget' | 'package'>('budget');
  const [selectedBudgetTierId, setSelectedBudgetTierId] = useState<'0-20k' | '20-50k' | '50-1L+'>('20-50k');

  // Package Mode State
  const [domainId, setDomainId] = useState<string>('web');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<number>(3);

  // Form State
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const currentDomain = DOMAINS.find((d) => d.id === domainId) || DOMAINS[0];
  const activeBudget = BUDGET_TIERS.find((b) => b.id === selectedBudgetTierId) || BUDGET_TIERS[1];

  const featuresTotal = selectedFeatures.reduce((sum, fId) => {
    const f = FEATURES.find((item) => item.id === fId);
    return sum + (f ? f.price : 0);
  }, 0);

  const calculatedTotal = currentDomain.basePrice + featuresTotal;

  const toggleFeature = (fId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(fId) ? prev.filter((id) => id !== fId) : [...prev, fId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');

    const projectType =
      scopeMode === 'budget'
        ? `Budget Tier: ${activeBudget.label} (${activeBudget.title})`
        : currentDomain.name;

    const budgetAmount =
      scopeMode === 'budget'
        ? activeBudget.priceDisplay
        : `₹${calculatedTotal.toLocaleString('en-IN')}`;

    try {
      const payload = {
        name,
        contact,
        idea,
        project_type: projectType,
        budget: budgetAmount,
        source: `scoping_${scopeMode}_selector`,
        user_agent: navigator.userAgent,
      };

      const { error } = await supabase.from('site_leads').insert([payload]);
      if (error) {
        console.warn('Supabase lead submit notice:', error);
        setSubmitError(
          'We could not save your brief. Please try again, or email hello@theflowlabs.online / WhatsApp +91 82496 81534.'
        );
        return;
      }
      setSubmitted(true);
    } catch (err: any) {
      console.error('Lead submission fallback:', err);
      setSubmitError(
        'We could not save your brief. Please try again, or email hello@theflowlabs.online / WhatsApp +91 82496 81534.'
      );
    } finally {
      setLoading(false);
    }
  };

  const waMessage =
    scopeMode === 'budget'
      ? `Hi The Flow Labs, I selected the ${activeBudget.label} (${activeBudget.title}) budget bracket on your scoping cockpit.`
      : `Hi The Flow Labs, I configured a scope for ${encodeURIComponent(currentDomain.name)} worth ₹${calculatedTotal.toLocaleString('en-IN')}`;

  return (
    <div className="pt-28 pb-28 px-4 sm:px-6 max-w-6xl mx-auto space-y-20">
      
      {/* Header */}
      <section className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Interactive scope synthesizer
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-normal text-white tracking-tight leading-[1.08]">
          Project Scoping Cockpit
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
          Configure your product requirements, select system modules, or select your target budget bracket to synthesize an upfront fixed estimate with guaranteed timelines.
        </p>
      </section>

      {/* Scoping Synthesizer Terminal */}
      <div className="max-w-4xl rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-10 space-y-8">
        
        {/* Terminal Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <div className="font-mono text-xs text-slate-400 mb-1">Architecture selector</div>
            <h2 className="font-display text-xl sm:text-2xl font-normal text-white">Interactive build configurator</h2>
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Direct founder review within 24 hours</span>
          </div>
        </div>

        {/* Primary Selection: Budget vs Package Toggle */}
        <div className="space-y-3 pb-2">
          <div className="flex items-center justify-between">
            <label className="block font-mono text-xs text-slate-300">
              Choose your scoping method
            </label>
            <span className="font-mono text-[11px] text-slate-400">
              {scopeMode === 'budget' ? 'Filtering by investment tier' : 'Customizing modules & timeline'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-white/[0.03] border border-white/10 max-w-md">
            <button
              type="button"
              onClick={() => setScopeMode('budget')}
              className={`py-2 px-3 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 ${
                scopeMode === 'budget'
                  ? 'bg-white text-[#07090E] shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Select budget</span>
            </button>
            <button
              type="button"
              onClick={() => setScopeMode('package')}
              className={`py-2 px-3 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center gap-2 ${
                scopeMode === 'package'
                  ? 'bg-white text-[#07090E] shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Select package</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* OPTION A: BUDGET TIER SELECTOR */}
            {scopeMode === 'budget' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">
                    Select target budget tier
                  </label>
                  <p className="text-slate-400 text-xs">
                    Choose an investment bracket to see what scope and timeline we deliver
                  </p>
                </div>

                <div className="space-y-3">
                  {BUDGET_TIERS.map((tier) => {
                    const isSelected = selectedBudgetTierId === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedBudgetTierId(tier.id)}
                        className={`p-5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white/10 border-white/40 shadow-lg text-white'
                            : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-white bg-white text-[#07090E]' : 'border-white/30'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#07090E]" />}
                            </div>
                            <span className="font-display font-medium text-base text-white">
                              {tier.label}
                            </span>
                          </div>
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-emerald-400">
                            {tier.priceDisplay}
                          </span>
                        </div>

                        <div className="mt-2 pl-6.5 space-y-1.5">
                          <div className="text-sm font-medium text-slate-200">
                            {tier.title}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {tier.desc}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {tier.highlights.map((h, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* OPTION B: PACKAGE CONFIGURATOR (CURRENT INTERFACE) */}
            {scopeMode === 'package' && (
              <div className="space-y-8">
                {/* Step 1: Select Domain */}
                <div className="space-y-3">
                  <label className="block font-mono text-xs text-slate-300">
                    1. Select primary architecture
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DOMAINS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDomainId(d.id)}
                        className={`p-4 rounded-xl text-left border transition-colors ${
                          domainId === d.id
                            ? 'bg-white/10 border-white/40 text-white'
                            : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="font-medium text-sm text-white">{d.name}</div>
                        <div className="font-mono text-[11px] text-slate-400 mt-1">
                          From ₹{(d.basePrice / 1000).toFixed(0)}k ({d.baseWeeks} {d.baseWeeks === 1 ? 'week' : 'weeks'})
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Add-on Modules */}
                <div className="space-y-3">
                  <label className="block font-mono text-xs text-slate-300">
                    2. Architecture and system add-ons
                  </label>
                  <div className="space-y-2">
                    {FEATURES.map((feat) => {
                      const isChecked = selectedFeatures.includes(feat.id);
                      return (
                        <div
                          key={feat.id}
                          onClick={() => toggleFeature(feat.id)}
                          className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-white/10 border-white/30 text-white'
                              : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                isChecked ? 'bg-white border-white text-[#07090E]' : 'border-white/20'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs sm:text-sm font-normal">{feat.name}</span>
                          </div>
                          <span className="font-mono text-xs text-slate-300">
                            +₹{feat.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Duration Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <label htmlFor="duration-slider" className="text-slate-300 cursor-pointer font-medium">
                      3. Sprint duration
                    </label>
                    <span className="text-white font-medium">{weeks} Weeks</span>
                  </div>
                  <input
                    id="duration-slider"
                    type="range"
                    min={1}
                    max={8}
                    value={weeks}
                    onChange={(e) => setWeeks(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer bg-white/10 rounded-lg h-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    aria-valuetext={`${weeks} week${weeks > 1 ? 's' : ''}`}
                  />
                  <div className="flex justify-between font-mono text-[10px] text-slate-500">
                    <span>1 Week (MVP)</span>
                    <span>4 Weeks (Platform)</span>
                    <span>8 Weeks (Full Scaled Suite)</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Result & Lead Column (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-5">
            
            {/* Price Readout */}
            <div className="space-y-1.5 pb-2 border-b border-white/10">
              <div className="font-mono text-[11px] text-slate-400">
                {scopeMode === 'budget' ? 'Target budget tier' : 'Synthesized fixed estimate'}
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-normal text-white tracking-tight">
                  {scopeMode === 'budget' ? activeBudget.priceDisplay : `₹${calculatedTotal.toLocaleString('en-IN')}`}
                </span>
                <span className="font-mono text-xs text-slate-400 whitespace-nowrap">
                  {scopeMode === 'budget' ? 'budget range' : 'fixed scope'}
                </span>
              </div>
              <div className="font-mono text-xs text-slate-400 pt-0.5">
                {scopeMode === 'budget' ? (
                  <>
                    Scope: <strong className="text-white">{activeBudget.title}</strong>
                  </>
                ) : (
                  <>
                    Delivery: <strong className="text-white">{weeks} Weeks</strong> (Direct founder sprint)
                  </>
                )}
              </div>
            </div>

            {/* Direct Form */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                <div>
                  <label htmlFor="lead-name" className="block font-mono text-[11px] text-slate-300 mb-1">
                    Your name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="lead-contact" className="block font-mono text-[11px] text-slate-300 mb-1">
                    Work email or WhatsApp <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="lead-contact"
                    type="text"
                    required
                    placeholder="name@company.com or +91..."
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="lead-idea" className="block font-mono text-[11px] text-slate-300 mb-1">
                    Brief outline <span className="text-slate-400 font-sans text-[10px]">(optional)</span>
                  </label>
                  <textarea
                    id="lead-idea"
                    rows={2}
                    placeholder="Brief outline of your product or requirements..."
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#07090E] font-medium text-xs sm:text-sm py-2.5 rounded-lg hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span>Synthesizing...</span>
                  ) : (
                    <>
                      <span>Lock in direct scope and slot</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {submitError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
                    {submitError}
                  </div>
                )}
              </form>
            ) : (
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <h4 className="font-medium text-white text-sm">Scope received</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Thank you, <strong className="text-white">{name}</strong>. A founder will contact you at <strong className="text-white">{contact}</strong> within 24 hours with an architecture breakdown.
                </p>
                <div className="pt-1">
                  <a
                    href={`https://wa.me/918249681534?text=${encodeURIComponent(waMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:underline"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ping us directly on WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>100% in-house engineering</span>
              <span>48h founder response SLA</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
