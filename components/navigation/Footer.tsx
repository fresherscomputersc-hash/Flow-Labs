'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Footer() {
  const [time, setTime] = useState<string>('--:--:--');

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istTime = new Date(utc + 3600000 * 5.5);
      const hours = String(istTime.getHours()).padStart(2, '0');
      const mins = String(istTime.getMinutes()).padStart(2, '0');
      const secs = String(istTime.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${mins}:${secs}`);
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="border-t border-white/10 bg-[#07090E]/80 backdrop-blur-xl relative z-10 text-sm text-slate-400">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        
        {/* Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="font-display font-bold text-xl text-white">
            The Flow Labs<span className="text-neon-cyan">.</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Interfaces, Scaled Systems &amp; Applied Intelligence.<br />
            Founder-led digital engineering studio in Bhubaneswar. Four builds a month, 100% in-house.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-neon-emerald animate-radar"></span>
            <span>Studio Time: <strong className="text-white">{time}</strong> IST</span>
          </div>
        </div>

        {/* Architecture */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs uppercase tracking-wider text-white">Architecture</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/services#frontend" className="hover:text-neon-cyan transition-colors">Interfaces (Frontend)</Link></li>
            <li><Link href="/services#backend" className="hover:text-neon-cyan transition-colors">Systems (Cloud &amp; Backend)</Link></li>
            <li><Link href="/services#ai" className="hover:text-neon-cyan transition-colors">Applied Intelligence</Link></li>
            <li><Link href="/work#droovee" className="hover:text-neon-cyan transition-colors">Droovee Mobility</Link></li>
            <li><Link href="/work#drishti" className="hover:text-neon-cyan transition-colors">Drishti Vision AI</Link></li>
          </ul>
        </div>

        {/* Studio */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs uppercase tracking-wider text-white">Studio</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/about" className="hover:text-neon-cyan transition-colors">Founders &amp; Manifesto</Link></li>
            <li><Link href="/scoping" className="hover:text-neon-cyan transition-colors">Project Scoping Cockpit</Link></li>
            <li><Link href="/blog" className="hover:text-neon-cyan transition-colors">Engineering Blog</Link></li>
            <li><Link href="/client" className="hover:text-neon-cyan transition-colors">Client Portal</Link></li>
            <li><Link href="/flow-hq" className="hover:text-neon-cyan transition-colors">Flow HQ Console</Link></li>
          </ul>
        </div>

        {/* Connect & Legal */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs uppercase tracking-wider text-white">Connect</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="mailto:hello@theflowlabs.online" className="hover:text-neon-cyan transition-colors">hello@theflowlabs.online</a></li>
            <li><a href="https://www.instagram.com/the.flow.labs/" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors">Instagram</a></li>
            <li><Link href="/privacy-policy" className="hover:text-neon-cyan transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-neon-cyan transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>&copy; 2026 The Flow Labs. Built with Next.js 15 &amp; Spatial Engineering.</div>
          <div className="flex items-center gap-4">
            <span>Latency: <strong className="text-neon-cyan">16ms</strong></span>
            <span>Status: <strong className="text-neon-emerald">OPERATIONAL</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
