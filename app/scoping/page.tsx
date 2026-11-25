'use client';

import { useState } from 'react';
import { Check, Send, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DomainOption {
  id: string;
  name: string;
  basePrice: number;
  baseWeeks: number;
  desc: string;
}

const DOMAINS: DomainOption[] = [
  { id: 'web', name: 'Web Application', basePrice: 40000, baseWeeks: 2, desc: 'Responsive frontends, high-speed landing suites & customer portals' },
  { id: 'platform', name: 'Custom Platform', basePrice: 75000, baseWeeks: 4, desc: 'Multi-role operational consoles, marketplace logic & billing' },
  { id: 'ai', name: 'AI / Automation', basePrice: 60000, baseWeeks: 3, desc: 'RAG pipelines, autonomous agents & WhatsApp bots' },
  { id: 'audit', name: 'Architecture Audit', basePrice: 30000, baseWeeks: 1, desc: 'Performance benchmarks, security hardening & DB migration' },
];

const FEATURES = [
  { id: 'whatsapp', name: '+ WhatsApp Automation & Meta Cloud API', price: 15000 },
  { id: 'postgres', name: '+ Realtime PostgreSQL & Supabase RLS', price: 20000 },
  { id: 'rag', name: '+ Custom AI RAG Pipeline & Vector Embeddings', price: 25000 },
  { id: 'admin', name: '+ Multi-Role Internal Admin Console (Flow HQ)', price: 20000 },
];

export default function ScopingPage() {
  const [domainId, setDomainId] = useState<string>('web');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<number>(3);

  // Form State
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentDomain = DOMAINS.find((d) => d.id === domainId) || DOMAINS[0];
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

    try {
      const payload = {
        name,
        contact,
        idea,
        project_type: currentDomain.name,
        budget: `₹${calculatedTotal.toLocaleString('en-IN')}`,
        source: 'scoping_cockpit_nextjs',
        user_agent: navigator.userAgent,
      };

      const { error } = await supabase.from('site_leads').insert([payload]);
      if (error) {
        console.warn('Supabase lead submit notice:', error);
      }
      setSubmitted(true);
    } catch (err: any) {
      console.error('Lead submission fallback:', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-16">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          Studio tool · Real-time pricing
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium text-white tracking-tight leading-[1.1]">
          Project Scoping Cockpit
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          Configure your product architecture, toggle custom modules, and synthesize a real-time fixed-price quote with guaranteed delivery timelines in under 60 seconds.
        </p>
      </section>

      {/* Scoping Bento Terminal */}
      <div className="max-w-4xl mx-auto rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-10 space-y-8">
        
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <span className="font-mono text-xs text-slate-400 uppercase">Configurator</span>
            <h2 className="font-display text-xl sm:text-2xl font-medium text-white">Interactive build synthesizer</h2>
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Direct founder response within 24h</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-7">
            
            {/* Step 1: Select Domain */}
            <div className="space-y-3">
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider">
                1. Select primary architecture
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOMAINS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDomainId(d.id)}
                    className={`p-3.5 rounded-xl text-left border transition-colors ${
                      domainId === d.id
                        ? 'bg-white/10 border-white/40 text-white'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="font-medium text-sm text-white">{d.name}</div>
                    <div className="font-mono text-[11px] text-slate-400 mt-1">
                      From ₹{(d.basePrice / 1000).toFixed(0)}k · {d.baseWeeks} Wks
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Add-on Modules */}
            <div className="space-y-3">
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider">
                2. Architecture &amp; system add-ons
              </label>
              <div className="space-y-2">
                {FEATURES.map((feat) => {
                  const isChecked = selectedFeatures.includes(feat.id);
                  return (
                    <div
                      key={feat.id}
                      onClick={() => toggleFeature(feat.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
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
                <span className="text-slate-400 uppercase tracking-wider">3. Sprint duration</span>
                <span className="text-white font-medium">{weeks} Weeks</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="w-full accent-white cursor-pointer bg-white/10 rounded-lg h-1.5"
              />
              <div className="flex justify-between font-mono text-[10px] text-slate-500">
                <span>1 Week (MVP)</span>
                <span>4 Weeks (Platform)</span>
                <span>8 Weeks (Full Scaled Suite)</span>
              </div>
            </div>

          </div>

          {/* Result & Lead Column (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-xl bg-white/[0.03] border border-white/10 space-y-5">
            
            {/* Price Readout */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                Synthesized fixed estimate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-medium text-white tracking-tight">
                  ₹{calculatedTotal.toLocaleString('en-IN')}
                </span>
                <span className="font-mono text-xs text-slate-400">/ fixed scope</span>
              </div>
              <div className="font-mono text-xs text-slate-400">
                Delivery: <strong className="text-white">{weeks} Weeks</strong> · Direct founder sprint
              </div>
            </div>

            {/* Direct Form */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Work email or WhatsApp"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    placeholder="Brief outline of your product or requirements..."
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#07090E] font-medium text-xs sm:text-sm py-2.5 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span>Synthesizing...</span>
                  ) : (
                    <>
                      <span>Lock in direct scope &amp; slot</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <h4 className="font-medium text-white text-sm">Scope received</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Thank you, <strong className="text-white">{name}</strong>. A founder will contact you at <strong className="text-white">{contact}</strong> within 24 hours with an architecture breakdown.
                </p>
                <div className="pt-1">
                  <a
                    href={`https://wa.me/918249681534?text=Hi%20The%20Flow%20Labs,%20I%20configured%20a%20scope%20for%20${encodeURIComponent(currentDomain.name)}%20worth%20₹${calculatedTotal.toLocaleString('en-IN')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:underline"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ping us directly on WhatsApp &rarr;</span>
                  </a>
                </div>
              </div>
            )}

            <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>100% In-house code</span>
              <span>48h Direct founder SLA</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
