'use client';

import Link from 'next/link';
import { usePathname, useSearch } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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

  // Focus trap state
  const [focusedElementRef, setFocusedElementRef] = useState<HTMLElement | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        if (drawerRef.current) drawerRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track first focus for trap
  useEffect(() => {
    if (mobileOpen) {
      setFocusedElementRef(drawerRef.current);
    }
  }, [mobileOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* Mobile menu button (only shows below md) */}
        {window.innerWidth < 768 && (
          <button
            onClick={() => setMobileOpen(true)}
            className="ml-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
            aria-controls="mobile-drawer"
            aria-expanded={mobileOpen}
          >
            <Menu className="w-4 h-4" />
            <span className="sr-only">Menu</span>
          </button>
        )}

        {/* Desktop navigation (always visible) */}
        <nav className="flex items-center gap-1 hidden md:block">
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

        {/* CTA Button (always visible) */}
        <Link
          href="/scoping"
          className="ml-2 inline-flex items-center gap-1.5 bg-white text-[#07090E] text-xs font-medium px-4 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
        >
          <span>Start a build</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Mobile drawer (only on small screens) */}
      {window.innerWidth < 768 && mobileOpen && (
        <div
          ref={drawerRef}
          id="mobile-drawer"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 w-full max-w-md space-y-6">
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 text-white/60 hover:text-white flex items-center gap-1"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo */}
            <div className="text-center mb-4">
              <Code2 className="w-8 h-8 rounded-md bg-white/10 border border-white/10 mx-auto my-2 flex items-center justify-center" />
              <span className="font-display font-medium text-sm text-white tracking-tight">
                The Flow Labs<span className="text-cyan-400">.</span>
              </span>
            </div>

            {/* Navigation links */}
            <nav className="space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2 rounded-md text-white hover:bg-white/10 transition-colors ${
                    pathname === link.href || pathname?.startsWith(link.href + '/')
                      ? 'font-medium'
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
              className="w-full inline-flex items-center gap-2 bg-white text-[#07090E] font-medium px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"
            >
              <span>Start a build</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}