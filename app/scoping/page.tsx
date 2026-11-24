'use client';

import { useState } from 'react';
import { Check, ShieldCheck, Zap, Clock, ArrowRight, MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DomainOption {
  id: string;
  name: string;
  basePrice: number;
  baseWeeks: number;
  desc: string;
}

const DOMAINS: DomainOption[] = [
  { id: 'web', name: 'Web Application', basePrice: 40000, baseWeeks: 2, desc: 'Kinetic frontends, high-speed landing suites & customer portals' },
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
  const [errorMsg, setErrorMsg] = useState('');

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
    setErrorMsg('');

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
    <div className="pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neon-cyan font-mono text-xs uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-radar"></span>
          Studio Telemetry · Real-Time Pricing
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight">
          Project Scoping <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">Cockpit.</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Configure your product architecture, toggle custom modules, and synthesize a real-time fixed-price quote with guaranteed delivery timelines in under 60 seconds.
        </p>
      </section>

      {/* Scoping Bento Terminal */}
      <div className="max-w-5xl mx-auto rounded-3xl bg-surface-card border border-white/10 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] p-6 sm:p-10 space-y-10">
        
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <span className="font-mono text-xs text-slate-500 uppercase">CONFIGURATOR // v2.5</span>
            <h2 className="font-display text-2xl font-bold text-white">Interactive Build Synthesizer</h2>
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-neon-cyan bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>SYSTEM ACTIVE · SLA 48 HOURS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Select Domain */}
            <div className="space-y-3">
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider">
                01. Select Primary Architecture
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOMAINS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDomainId(d.id)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      domainId === d.id
                        ? 'bg-neon-cyan/15 border-neon-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="font-semibold text-sm text-white">{d.name}</div>
                    <div className="font-mono text-[11px] text-neon-cyan mt-1">
                      From ₹{(d.basePrice / 1000).toFixed(0)}k · {d.baseWeeks} Wks
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Add-on Modules */}
            <div className="space-y-3">
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider">
                02. Architecture &amp; System Add-ons
              </label>
              <div className="space-y-2.5">
                {FEATURES.map((feat) => {
                  const isChecked = selectedFeatures.includes(feat.id);
                  return (
                    <div
                      key={feat.id}
                      onClick={() => toggleFeature(feat.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-neon-blue/15 border-neon-blue text-white shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                          : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            isChecked ? 'bg-neon-blue border-neon-blue text-white' : 'border-white/20'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{feat.name}</span>
                      </div>
                      <span className="font-mono text-xs text-neon-cyan font-semibold">
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
                <span className="text-slate-400 uppercase tracking-wider">03. Estimated Sprint Duration</span>
                <span className="text-neon-cyan font-bold">{weeks} Weeks</span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="w-full accent-neon-blue cursor-pointer bg-white/10 rounded-lg h-2"
              />
              <div className="flex justify-between font-mono text-[10px] text-slate-500">
                <span>1 Week (MVP)</span>
                <span>4 Weeks (Platform)</span>
                <span>8 Weeks (Full Scaled Suite)</span>
              </div>
            </div>

          </div>

          {/* Result & Lead Column (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#090D18]/90 border border-white/15 space-y-6 shadow-2xl">
            
            {/* Price Readout */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                Synthesized Fixed Estimate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
                  ₹{calculatedTotal.toLocaleString('en-IN')}
                </span>
                <span className="font-mono text-xs text-slate-400">/ fixed scope</span>
              </div>
              <div className="font-mono text-xs text-neon-cyan">
                Estimated Delivery: <strong className="text-white">{weeks} Weeks</strong> · Direct Founder Team
              </div>
            </div>

            {/* Direct Form */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Work Email or WhatsApp (+91...)"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    placeholder="Brief outline of your product or requirements..."
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-neon-cyan transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                >
                  {loading ? (
                    <span>Synthesizing...</span>
                  ) : (
                    <>
                      <span>Lock In Direct Scope &amp; Slot</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <h4 className="font-display font-bold text-white text-base">Scope Received!</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Thank you, <strong className="text-white">{name}</strong>. A founder will contact you at <strong className="text-neon-cyan">{contact}</strong> within 24 hours with an architecture breakdown.
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/918249681534?text=Hi%20The%20Flow%20Labs,%20I%20configured%20a%20scope%20for%20${encodeURIComponent(currentDomain.name)}%20worth%20₹${calculatedTotal.toLocaleString('en-IN')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-neon-emerald hover:underline"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ping us directly on WhatsApp &rarr;</span>
                  </a>
                </div>
              </div>
            )}

            <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>🔒 100% In-House Code</span>
              <span>⚡ 48h Direct Founder SLA</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
