'use client';

import { useState, useEffect } from 'react';
import { Search, Layers, CheckSquare, Building, ArrowRight, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects: { id: string; name: string; key: string }[];
  tasks: { id: string; title: string; status: string }[];
  clients: { id: string; name: string; email: string }[];
  isFounder: boolean;
  onNavigateTab: (tab: string) => void;
  onSelectTask?: (taskId: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  projects,
  tasks,
  clients,
  isFounder,
  onNavigateTab,
  onSelectTask,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigateTab('__toggle_cmd__');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, onNavigateTab]);

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const navItems = [
    { id: 'dashboard', label: 'Go to Overview' },
    { id: 'projects', label: 'Go to Projects' },
    { id: 'tasks', label: 'Go to Tasks' },
    ...(isFounder ? [{ id: 'clients', label: 'Go to Clients & Deliverables' }] : []),
    ...(isFounder ? [{ id: 'finance', label: 'Go to Finance & Invoicing' }] : []),
    { id: 'ops', label: 'Go to Team & Ops (Standups, Time, SOPs)' },
  ].filter((n) => !q || n.label.toLowerCase().includes(q));

  const matchedProjects = projects
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q))
    .slice(0, 4);

  const matchedTasks = tasks
    .filter((t) => !q || t.title.toLowerCase().includes(q))
    .slice(0, 5);

  const matchedClients = isFounder
    ? clients.filter((c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 4)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl bg-[#0B0F19] border border-white/15 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search projects, tasks, clients, or jump to section..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-3 text-xs font-mono">
          {navItems.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] uppercase text-slate-500">Navigation</div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigateTab(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              ))}
            </div>
          )}

          {matchedProjects.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] uppercase text-slate-500">Projects</div>
              {matchedProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onNavigateTab('projects');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{p.name}</span>
                  </span>
                  <span className="text-slate-500">{p.key}</span>
                </button>
              ))}
            </div>
          )}

          {matchedTasks.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] uppercase text-slate-500">Tasks</div>
              {matchedTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onNavigateTab('tasks');
                    onSelectTask?.(t.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  <span className="flex items-center gap-2 truncate">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </span>
                  <span className="text-slate-500 shrink-0 ml-2">{t.status}</span>
                </button>
              ))}
            </div>
          )}

          {matchedClients.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] uppercase text-slate-500">Clients</div>
              {matchedClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onNavigateTab('clients');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>{c.name}</span>
                  </span>
                  <span className="text-slate-500">{c.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
