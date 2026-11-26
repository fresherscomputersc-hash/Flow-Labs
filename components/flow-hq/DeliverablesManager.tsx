'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  UploadCloud,
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DeliverableRow {
  id: string;
  project_id: string;
  file_name: string;
  storage_path: string;
  mime_type?: string;
  size_bytes?: number;
  client_visible: boolean;
  created_at: string;
}

interface ClientUpdateRow {
  id: string;
  project_id: string;
  title: string;
  body: string;
  published: boolean;
  published_at?: string;
  created_at: string;
}

interface TicketRow {
  id: string;
  project_id?: string;
  client_id?: string;
  assigned_to?: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

interface DeliverablesManagerProps {
  projects: { id: string; name: string; key: string }[];
  team: { id: string; name: string; initials: string }[];
}

export default function DeliverablesManager({ projects, team }: DeliverablesManagerProps) {
  const [subTab, setSubTab] = useState<'deliverables' | 'updates' | 'tickets'>('deliverables');
  const [deliverables, setDeliverables] = useState<DeliverableRow[]>([]);
  const [updates, setUpdates] = useState<ClientUpdateRow[]>([]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  // Deliverable form
  const [delProject, setDelProject] = useState('');
  const [delName, setDelName] = useState('');
  const [delType, setDelType] = useState('PDF Specification');
  const [delUrl, setDelUrl] = useState('');
  const [delFile, setDelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [delVisible, setDelVisible] = useState(true);

  // Client update form
  const [updProject, setUpdProject] = useState('');
  const [updTitle, setUpdTitle] = useState('');
  const [updBody, setUpdBody] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [attRes, updRes, tktRes] = await Promise.all([
        supabase.from('attachments').select('*').order('created_at', { ascending: false }),
        supabase.from('client_updates').select('*').order('created_at', { ascending: false }),
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
      ]);
      if (attRes.data) setDeliverables(attRes.data);
      if (updRes.data) setUpdates(updRes.data);
      if (tktRes.data) setTickets(tktRes.data);
    } catch (err) {
      console.warn('Deliverables load notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      if (!delProject) setDelProject(projects[0].id);
      if (!updProject) setUpdProject(projects[0].id);
    }
  }, [projects]);

  const projectName = (id?: string) => {
    const p = projects.find((pr) => pr.id === id);
    return p ? `${p.name} (${p.key})` : 'Unassigned';
  };

  const handleAddDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delProject || (!delName.trim() && !delFile) || (!delUrl.trim() && !delFile)) {
      alert('Please select a project and provide either a file upload or a URL.');
      return;
    }

    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      let storagePath = delUrl.trim();
      let sizeBytes: number | null = null;
      let mimeType = delType.trim() || 'Deliverable';
      const finalName = delName.trim() || delFile?.name || 'Deliverable';

      if (delFile) {
        const cleanName = delFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const objectPath = `${delProject}/${Date.now()}_${cleanName}`;
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(objectPath, delFile, { upsert: false });
        if (uploadError) throw uploadError;
        storagePath = objectPath;
        sizeBytes = delFile.size;
        mimeType = delFile.type || mimeType;
      }

      const { error } = await supabase.from('attachments').insert([
        {
          project_id: delProject,
          uploaded_by: userData?.user?.id || null,
          file_name: finalName,
          storage_path: storagePath,
          mime_type: mimeType,
          size_bytes: sizeBytes,
          client_visible: delVisible,
        },
      ]);
      if (error) throw error;
      setNotice(`Deliverable "${finalName}" published.`);
      setDelName('');
      setDelUrl('');
      setDelFile(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add deliverable.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDeliverable = async (d: DeliverableRow) => {
    if (d.storage_path?.startsWith('http')) {
      window.open(d.storage_path, '_blank', 'noopener,noreferrer');
      return;
    }
    const { data, error } = await supabase.storage
      .from('attachments')
      .createSignedUrl(d.storage_path, 3600);
    if (error || !data?.signedUrl) {
      alert(error?.message || 'Could not generate download link.');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleToggleVisibility = async (row: DeliverableRow) => {
    try {
      const { error } = await supabase
        .from('attachments')
        .update({ client_visible: !row.client_visible })
        .eq('id', row.id);
      if (error) throw error;
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update visibility.');
    }
  };

  const handleDeleteDeliverable = async (id: string) => {
    if (!confirm('Delete this deliverable?')) return;
    try {
      const { error } = await supabase.from('attachments').delete().eq('id', id);
      if (error) throw error;
      setNotice('Deliverable removed.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete deliverable.');
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updProject || !updTitle.trim() || !updBody.trim()) {
      alert('Please select a project, title, and summary.');
      return;
    }
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from('client_updates').insert([
        {
          project_id: updProject,
          author_id: userData?.user?.id || null,
          title: updTitle.trim(),
          body: updBody.trim(),
          published: true,
          published_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
      setNotice('Client sprint update published.');
      setUpdTitle('');
      setUpdBody('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish update.');
    }
  };

  const handleDeleteUpdate = async (id: string) => {
    if (!confirm('Delete this client update?')) return;
    try {
      const { error } = await supabase.from('client_updates').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete update.');
    }
  };

  const handleUpdateTicketStatus = async (id: string, status: TicketRow['status']) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setNotice(`Ticket marked ${status.replace('_', ' ')}.`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status.');
    }
  };

  const handleAssignTicket = async (id: string, assigned_to: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ assigned_to: assigned_to || null, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign ticket.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display text-xl font-normal text-white">Deliverables, Updates &amp; Support</h2>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Publish client-facing deliverables, sprint updates, and resolve client support tickets
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="text-emerald-400/60 hover:text-emerald-400">
            ×
          </button>
        </div>
      )}

      {/* Sub-navigation */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/10 w-fit text-xs font-mono">
        <button
          onClick={() => setSubTab('deliverables')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            subTab === 'deliverables' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Deliverables ({deliverables.length})</span>
        </button>
        <button
          onClick={() => setSubTab('updates')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            subTab === 'updates' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Sprint Updates ({updates.length})</span>
        </button>
        <button
          onClick={() => setSubTab('tickets')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            subTab === 'tickets' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Client Tickets ({tickets.length})</span>
        </button>
      </div>

      {/* TAB 1: DELIVERABLES */}
      {subTab === 'deliverables' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleAddDeliverable} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4 h-fit">
            <h3 className="font-display text-base text-white">Add Deliverable</h3>

            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-slate-400">Project</label>
              <select
                value={delProject}
                onChange={(e) => setDelProject(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-slate-400">Deliverable Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Architecture ERD v1.0"
                value={delName}
                onChange={(e) => setDelName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-slate-400">Asset Type</label>
              <input
                type="text"
                placeholder="e.g. PDF Spec, Staging Link, Repo"
                value={delType}
                onChange={(e) => setDelType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-slate-400">Upload File (Optional, up to 50MB)</label>
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-dashed border-white/20 text-xs font-mono text-slate-300 cursor-pointer hover:border-cyan-400 transition-colors">
                <UploadCloud className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{delFile ? delFile.name : 'Choose file from device...'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setDelFile(f);
                    if (f && !delName.trim()) setDelName(f.name);
                  }}
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-slate-400">Or Resource URL</label>
              <input
                type="text"
                required={!delFile}
                placeholder="https://..."
                value={delUrl}
                onChange={(e) => setDelUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={delVisible}
                onChange={(e) => setDelVisible(e.target.checked)}
                className="rounded border-white/20 bg-white/5"
              />
              <span>Visible in Client Portal</span>
            </label>

            <button
              type="submit"
              disabled={uploading}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Publish Deliverable'}</span>
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {deliverables.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium">{d.file_name}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono text-[10px]">
                      {d.mime_type || 'Deliverable'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                        d.client_visible
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-500/10 border-white/10 text-slate-400'
                      }`}
                    >
                      {d.client_visible ? 'Client Visible' : 'Hidden'}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 truncate">
                    {projectName(d.project_id)} · {new Date(d.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenDeliverable(d)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    title={d.storage_path?.startsWith('http') ? 'Open URL' : 'Download file'}
                  >
                    {d.storage_path?.startsWith('http') ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(d)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    title={d.client_visible ? 'Hide from client' : 'Show to client'}
                  >
                    {d.client_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteDeliverable(d.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                    title="Delete deliverable"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {deliverables.length === 0 && (
              <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs font-mono text-slate-500">
                No deliverables published yet. Add a deliverable on the left to share it with a client.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT UPDATES */}
      {subTab === 'updates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleAddUpdate} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4 h-fit">
            <h3 className="font-display text-base text-white">Post Client Sprint Update</h3>
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-slate-400">Project</label>
              <select
                value={updProject}
                onChange={(e) => setUpdProject(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-slate-400">Update Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Sprint 2 Staging Deployed"
                value={updTitle}
                onChange={(e) => setUpdTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-slate-400">Summary</label>
              <textarea
                rows={4}
                required
                placeholder="What shipped for the client this sprint..."
                value={updBody}
                onChange={(e) => setUpdBody(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors"
            >
              Publish Update
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {updates.map((u) => (
              <div key={u.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-white font-medium text-sm">{u.title}</div>
                    <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                      {projectName(u.project_id)} · {new Date(u.created_at).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteUpdate(u.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-400 leading-relaxed">{u.body}</p>
              </div>
            ))}
            {updates.length === 0 && (
              <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs font-mono text-slate-500">
                No client updates published yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CLIENT TICKETS */}
      {subTab === 'tickets' && (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-medium text-sm">{t.title}</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono text-[10px] uppercase">
                    {t.type?.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {projectName(t.project_id)} · {new Date(t.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">{t.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono">
                <select
                  value={t.assigned_to || ''}
                  onChange={(e) => handleAssignTicket(t.id, e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-slate-300 text-xs focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <select
                  value={t.status}
                  onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value as TicketRow['status'])}
                  className="px-2.5 py-1.5 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          ))}

          {tickets.length === 0 && (
            <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs font-mono text-slate-500">
              No support tickets raised by clients yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
