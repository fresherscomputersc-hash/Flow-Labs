'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Target,
  FileText,
  Activity,
  Plus,
  RefreshCw,
  ArrowRight,
  Send,
  MessageSquare,
  ArrowRightLeft,
  Shield,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Lead {
  id: string;
  name: string;
  contact: string;
  project_type: string;
  budget: string;
  idea?: string;
  created_at: string;
}

interface TaskItem {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee: string;
  collaborators: string[];
}

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: '1',
    title: 'Deploy Droovee dynamic distance calculation algorithm',
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'SR',
    collaborators: ['SR', 'BW'],
  },
  {
    id: '2',
    title: 'Optimize Drishti YOLOv8 video frame rate to 30 FPS on edge node',
    status: 'in_progress',
    priority: 'high',
    assignee: 'BW',
    collaborators: ['BW'],
  },
  {
    id: '3',
    title: 'Ship Three.js spatial design system components for client portal',
    status: 'review',
    priority: 'medium',
    assignee: 'AP',
    collaborators: ['AP', 'SR'],
  },
  {
    id: '4',
    title: 'Finalize PostgreSQL row-level security policies for multi-tenant users',
    status: 'done',
    priority: 'high',
    assignee: 'SR',
    collaborators: ['SR'],
  },
];

export default function FlowHQPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'leads' | 'team'>('dashboard');
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [taskScope, setTaskScope] = useState<'all' | 'my' | 'shared' | 'unassigned'>('all');

  // Handoff Modal State
  const [handoffTask, setHandoffTask] = useState<TaskItem | null>(null);
  const [handoffTarget, setHandoffTarget] = useState<string>('BW');

  // Load Leads from Supabase
  const loadLeads = async () => {
    setLoadingLeads(true);
    try {
      const { data, error } = await supabase
        .from('site_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && !error) {
        setLeads(data);
      }
    } catch (err) {
      console.warn('Leads fetch error:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleHandoff = () => {
    if (!handoffTask) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === handoffTask.id
          ? {
              ...t,
              assignee: handoffTarget,
              collaborators: Array.from(new Set([...t.collaborators, handoffTarget])),
            }
          : t
      )
    );
    setHandoffTask(null);
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskScope === 'my') return t.assignee === 'SR';
    if (taskScope === 'shared') return t.collaborators.length > 1;
    if (taskScope === 'unassigned') return !t.assignee;
    return true;
  });

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
      
      {/* Top Console Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center font-mono font-medium text-white text-xs">
            HQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-medium text-white">Flow HQ Console</h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Realtime telemetry
              </span>
            </div>
            <p className="text-slate-400 text-xs">Founder operations, collaborative task matrix &amp; CRM pipeline</p>
          </div>
        </div>

        {/* Console Nav Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              activeTab === 'dashboard' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              activeTab === 'tasks' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Task Matrix
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              activeTab === 'leads' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Leads CRM
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              activeTab === 'team' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Team
          </button>
        </div>
      </div>

      {/* ================= TAB 1: DASHBOARD ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Telemetry KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="font-mono text-[11px] text-slate-400 uppercase">Active Builds</span>
              <div className="font-display text-2xl font-medium text-white">2 / 4</div>
              <div className="text-[11px] font-mono text-slate-400">50% monthly bandwidth</div>
            </div>

            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="font-mono text-[11px] text-slate-400 uppercase">Open Tasks</span>
              <div className="font-display text-2xl font-medium text-white">{tasks.filter(t => t.status !== 'done').length}</div>
              <div className="text-[11px] font-mono text-slate-400">1 urgent sprint handoff</div>
            </div>

            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="font-mono text-[11px] text-slate-400 uppercase">Qualified Leads</span>
              <div className="font-display text-2xl font-medium text-white">{leads.length || 6}</div>
              <div className="text-[11px] font-mono text-slate-400">₹3.8L pipeline value</div>
            </div>

            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="font-mono text-[11px] text-slate-400 uppercase">System Latency</span>
              <div className="font-display text-2xl font-medium text-white">16ms</div>
              <div className="text-[11px] font-mono text-slate-400">99.98% global uptime</div>
            </div>
          </div>

          {/* Quick Actions & Recent Stream */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-8 p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display text-sm font-medium text-white">Active sprint priority queue</h3>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs font-mono text-slate-300 hover:text-white"
                >
                  Manage all &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {tasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-medium text-white">{t.title}</div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                        <span className="text-[10px]">{t.priority}</span>
                        <span className="text-slate-600">/</span>
                        <span>Assignee: {t.assignee}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setHandoffTask(t)}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 border border-white/10 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Hand off</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <h3 className="font-display text-sm font-medium text-white pb-3 border-b border-white/10">
                Founders on duty
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono text-[10px] text-white">SR</div>
                    <span className="text-slate-300">Smruti Ranjan</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400">Building</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono text-[10px] text-white">BW</div>
                    <span className="text-slate-300">Biswash</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400">Building</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono text-[10px] text-white">AP</div>
                    <span className="text-slate-300">Arpita</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400">Building</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: TASK MATRIX ================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-5">
          {/* Segmented Scope Bar */}
          <div className="flex flex-wrap items-center gap-2 p-1 rounded-lg bg-white/[0.02] border border-white/10 w-fit">
            {[
              { id: 'all', label: 'All Tasks', count: tasks.length },
              { id: 'my', label: 'My Tasks (SR)', count: tasks.filter(t => t.assignee === 'SR').length },
              { id: 'shared', label: 'Shared & Collab', count: tasks.filter(t => t.collaborators.length > 1).length },
              { id: 'unassigned', label: 'Unassigned', count: tasks.filter(t => !t.assignee).length },
            ].map((scope) => (
              <button
                key={scope.id}
                onClick={() => setTaskScope(scope.id as any)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  taskScope === scope.id
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{scope.label}</span>
                <span className="text-[10px] text-slate-500">({scope.count})</span>
              </button>
            ))}
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'todo', label: 'Backlog & Queued', count: filteredTasks.filter(t => t.status === 'todo').length },
              { id: 'in_progress', label: 'In Development', count: filteredTasks.filter(t => t.status === 'in_progress').length },
              { id: 'review', label: 'Review & Staging', count: filteredTasks.filter(t => t.status === 'review').length },
              { id: 'done', label: 'Shipped & Verified', count: filteredTasks.filter(t => t.status === 'done').length },
            ].map((col) => (
              <div
                key={col.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col min-h-[420px] space-y-3"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <h3 className="font-display text-xs font-medium text-white">{col.label}</h3>
                  <span className="font-mono text-xs text-slate-500">{col.count}</span>
                </div>

                <div className="space-y-2 flex-1">
                  {filteredTasks
                    .filter((t) => t.status === col.id)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-lg bg-white/[0.02] border border-white/10 space-y-2.5 hover:border-white/20 transition-colors"
                      >
                        <div className="text-xs font-medium text-white leading-snug">{t.title}</div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          {/* Collaborator Initials */}
                          <div className="flex items-center -space-x-1">
                            {t.collaborators.map((c) => (
                              <div
                                key={c}
                                className="w-4 h-4 rounded-full bg-white/10 border border-[#0A0D15] flex items-center justify-center font-mono text-[8px] text-slate-300"
                                title={`Collaborator: ${c}`}
                              >
                                {c}
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => setHandoffTask(t)}
                            className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-2.5 h-2.5" />
                            <span>Hand off</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: LEADS CRM ================= */}
      {activeTab === 'leads' && (
        <div className="p-5 sm:p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-display text-base font-medium text-white">Inbound Leads &amp; Scopes</h3>
              <p className="text-slate-400 text-xs">Direct submissions from the Project Scoping Cockpit</p>
            </div>
            <button
              onClick={loadLeads}
              disabled={loadingLeads}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300 hover:bg-white/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Architecture</th>
                  <th className="py-2.5 px-3">Scope Estimate</th>
                  <th className="py-2.5 px-3">Project Brief</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-3 font-sans font-medium text-white">
                      <div>{l.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{l.contact}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{l.project_type || 'Custom Build'}</td>
                    <td className="py-3 px-3 text-white font-medium">{l.budget || '₹40,000+'}</td>
                    <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{l.idea || 'Direct scope inquiry'}</td>
                    <td className="py-3 px-3">
                      <a
                        href={`https://wa.me/?text=Hi%20${encodeURIComponent(l.name)},%20this%20is%20Smruti%20from%20The%20Flow%20Labs%20regarding%20your%20project%20scope.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white hover:underline"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && !loadingLeads && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No inbound leads in database yet. Submit one from /scoping to test!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: TEAM ================= */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { initials: 'SR', name: 'Smruti Ranjan', role: 'Owner, Lead Architect', email: 'smruti@theflowlabs.online' },
            { initials: 'BW', name: 'Biswash', role: 'Co-Founder, Cloud Systems', email: 'biswash@theflowlabs.online' },
            { initials: 'AP', name: 'Arpita', role: 'Co-Founder, Interfaces and UX', email: 'arpita@theflowlabs.online' },
          ].map((m) => (
            <div key={m.name} className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-white text-sm">
                  {m.initials}
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  Active
                </span>
              </div>
              <div>
                <h4 className="font-display font-medium text-white text-base">{m.name}</h4>
                <div className="font-mono text-xs text-slate-400">{m.role}</div>
                <div className="font-mono text-[11px] text-slate-500 mt-0.5">{m.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= HANDOFF MODAL ================= */}
      {handoffTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-5 rounded-xl bg-[#0E1424] border border-white/20 shadow-xl space-y-4">
            <div>
              <span className="font-mono text-xs text-slate-400 uppercase">Delegation</span>
              <h3 className="font-display text-base font-medium text-white mt-0.5">Hand off task</h3>
              <p className="text-slate-400 text-xs mt-0.5">{handoffTask.title}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-slate-400">Select target engineer</label>
              <select
                value={handoffTarget}
                onChange={(e) => setHandoffTarget(e.target.value)}
                className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
              >
                <option value="SR" className="bg-[#0E1424]">Smruti Ranjan (SR)</option>
                <option value="BW" className="bg-[#0E1424]">Biswash (BW)</option>
                <option value="AP" className="bg-[#0E1424]">Arpita (AP)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setHandoffTask(null)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleHandoff}
                className="px-3 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200"
              >
                Confirm handoff
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
