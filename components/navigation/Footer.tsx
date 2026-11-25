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
    <footer className="border-t border-white/10 bg-[#07090E] relative z-10 text-sm text-slate-400">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-5 gap-10">
        
        {/* Brand Info */}
        <div className="md:col-span-2 space-y-3.5">
          <div className="font-display font-medium text-lg text-white">
            The Flow Labs<span className="text-cyan-400">.</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            Interfaces, Scaled Systems &amp; Applied Intelligence.<br />
            Founder-led digital engineering studio in Bhubaneswar. Four builds a month, 100% in-house.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-full px-3 py-1 text-xs font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Studio time: <strong className="text-white">{time}</strong> IST</span>
          </div>
        </div>

        {/* Architecture */}
        <div className="space-y-2.5">
          <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300">Architecture</h4>
          <ul className="space-y-1.5 text-xs">
            <li><Link href="/services#frontend" className="hover:text-white transition-colors">Interfaces (Frontend)</Link></li>
            <li><Link href="/services#backend" className="hover:text-white transition-colors">Systems (Cloud &amp; Backend)</Link></li>
            <li><Link href="/services#ai" className="hover:text-white transition-colors">Applied Intelligence</Link></li>
            <li><Link href="/work#droovee" className="hover:text-white transition-colors">Droovee Mobility</Link></li>
            <li><Link href="/work#drishti" className="hover:text-white transition-colors">Drishti Vision AI</Link></li>
          </ul>
        </div>

        {/* Studio */}
        <div className="space-y-2.5">
          <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300">Studio</h4>
          <ul className="space-y-1.5 text-xs">
            <li><Link href="/about" className="hover:text-white transition-colors">Founders &amp; Manifesto</Link></li>
            <li><Link href="/scoping" className="hover:text-white transition-colors">Project Scoping Cockpit</Link></li>
            <li><Link href="/flow-hq" className="hover:text-white transition-colors">Flow HQ Console</Link></li>
            <li><Link href="/client" className="hover:text-white transition-colors">Client Portal</Link></li>
            <li><Link href="/bhubaneswar" className="hover:text-white transition-colors">Bhubaneswar Studio</Link></li>
          </ul>
        </div>

        {/* Legal & Perspectives */}
        <div className="space-y-2.5">
          <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300">Perspectives</h4>
          <ul className="space-y-1.5 text-xs">
            <li><Link href="/blog" className="hover:text-white transition-colors">Engineering Blog</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><a href="https://github.com/fresherscomputersc-hash/Flow-Labs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
          </ul>
        </div>

      </div>

      <div className="border-t border-white/5 py-6 px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
        <div>&copy; {new Date().getFullYear()} The Flow Labs. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <span>Latency: 16ms</span>
          <span>·</span>
          <span>Status: Operational</span>
        </div>
      </div>
    </footer>
  );
}
