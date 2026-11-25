'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X, Code2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const NAV_LINKS = [
  { name: 'Services', href: '/services' },
  { name: 'Work', href: '/work' },
  { name: 'About', href: '/about' },
  { name: 'Scoping', href: '/scoping' },
  { name: 'Blog', href: '/blog' },
];

export function Dock() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Hide public navigation dock on internal consoles, admin panels, and client portals
  const isInternalPortal =
    pathname?.startsWith('/flow-hq') ||
    pathname?.startsWith('/client') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/portal');

  // Close mobile menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [mobileOpen]);

  if (isInternalPortal) {
    return null;
  }

  return (
    <>
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <header className="pointer-events-auto flex items-center justify-between gap-2 sm:gap-3 bg-[#0D111A]/90 backdrop-blur-xl border border-white/10 rounded-full px-3.5 sm:px-4 py-2 shadow-sm max-w-[94vw] sm:max-w-none">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-1 sm:mr-2 shrink-0">
            <div className="w-6 h-6 rounded-md bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-medium text-xs sm:text-sm text-white tracking-tight whitespace-nowrap">
              The Flow Labs<span className="text-cyan-400">.</span>
            </span>
          </Link>

          {/* Mobile menu button (md and below) */}
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors md:hidden shrink-0"
            aria-controls="mobile-drawer"
            aria-expanded={mobileOpen}
          >
            <Menu className="w-4 h-4" />
            <span className="sr-only">Menu</span>
          </button>

          {/* Desktop navigation (direct dedicated page links) */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname?.startsWith(link.href + '/');

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap ${
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
            className="inline-flex items-center gap-1.5 bg-white text-[#07090E] text-xs font-medium px-3.5 sm:px-4 py-1.5 rounded-full hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Start a build</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </header>
      </div>

      {/* Mobile drawer (standalone top-level overlay with full pointer events) */}
      {mobileOpen && (
        <div
          ref={drawerRef}
          id="mobile-drawer"
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-[#0D111A] border border-white/20 rounded-2xl p-6 w-full max-w-sm space-y-6 relative shadow-2xl pointer-events-auto">
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo */}
            <div className="text-center mb-4">
              <div className="w-8 h-8 rounded-md bg-white/10 border border-white/10 mx-auto mb-2 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-medium text-sm text-white tracking-tight">
                The Flow Labs<span className="text-cyan-400">.</span>
              </span>
            </div>

            {/* Navigation links (direct dedicated page navigation) */}
            <nav className="space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm text-slate-200 hover:text-white hover:bg-white/10 transition-colors ${
                    pathname === link.href || pathname?.startsWith(link.href + '/')
                      ? 'font-medium bg-white/10 text-white'
                      : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <Link
              href="/scoping"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#07090E] font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <span>Start a build</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
