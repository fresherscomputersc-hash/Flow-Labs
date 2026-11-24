'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Code2 } from 'lucide-react';

const NAV_LINKS = [
  { name: 'Services', href: '/services' },
  { name: 'Work', href: '/work' },
  { name: 'About', href: '/about' },
  { name: 'Scoping', href: '/scoping' },
  { name: 'Blog', href: '/blog' },
];

export function Dock() {
  const pathname = usePathname();

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header className="pointer-events-auto flex items-center gap-3 bg-[rgba(13,17,28,0.8)] backdrop-blur-2xl border border-white/10 rounded-full px-4 py-2 shadow-dock transition-all hover:border-white/20">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group mr-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform">
            <Code2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-sm text-white tracking-tight">
            The Flow Labs<span className="text-neon-cyan">.</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname?.startsWith(link.href + '/');

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-180 ${
                  isActive
                    ? 'text-neon-cyan bg-neon-cyan/15 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <Link
          href="/scoping"
          className="ml-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-[0_4px_15px_rgba(37,99,235,0.35)] border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Start a Build</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>

      </header>
    </div>
  );
}
