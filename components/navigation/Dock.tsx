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

  // Hide public navigation dock on internal consoles, admin panels, and client portals
  const isInternalPortal =
    pathname?.startsWith('/flow-hq') ||
    pathname?.startsWith('/client') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/portal');

  if (isInternalPortal) {
    return null;
  }

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header className="pointer-events-auto flex items-center gap-3 bg-[#0D111A]/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-sm">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-2">
          <div className="w-6 h-6 rounded-md bg-white/10 border border-white/10 flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-medium text-sm text-white tracking-tight">
            The Flow Labs<span className="text-cyan-400">.</span>
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
                className={`text-xs px-3.5 py-1.5 rounded-full transition-colors ${
                  isActive
                    ? 'text-white bg-white/10 font-medium'
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
          className="ml-2 inline-flex items-center gap-1.5 bg-white text-[#07090E] text-xs font-medium px-4 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
        >
          <span>Start a build</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>

      </header>
    </div>
  );
}
