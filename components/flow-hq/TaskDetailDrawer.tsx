'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Send, MessageSquare, Calendar, User, Flag, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface DrawerTask {
  id: string;
  projectId: string;
  moduleName?: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee: string;
  assigneeId?: string;
  notes?: string;
  dueDate?: string;
}

interface CommentRow {
  id: string;
  body: string;
  author_id: string | null;
  created_at: string;
  profiles?: { full_name?: string; email?: string } | null;
}

interface TaskDetailDrawerProps {
  task: DrawerTask | null;
  onClose: () => void;
  team: { id: string; name: string; initials: string }[];
  currentUserId?: string;
  canDelete?: boolean;
  onUpdated: () => Promise<void> | void;
}

export default function TaskDetailDrawer({
  task,
  onClose,
  team,
  currentUserId,
  canDelete = true,
  onUpdated,
}: TaskDetailDrawerProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<DrawerTask['status']>('todo');
  const [priority, setPriority] = useState<DrawerTask['priority']>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const [comments, setComments] = useState<CommentRow[]>([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setNotes(task.notes || '');
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeId(task.assigneeId || '');
    setDueDate(task.dueDate || '');

    if (/^[0-9a-f-]{36}$/i.test(task.id)) {
      loadComments(task.id);
    } else {
      setComments([]);
    }
  }, [task]);

  const loadComments = async (taskId: string) => {
    const { data } = await supabase
      .from('task_comments')
      .select('id, body, author_id, created_at, profiles(full_name, email)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    if (data) setComments(data as any);
  };

  if (!task) return null;

  const isUuid = /^[0-9a-f-]{36}$/i.test(task.id);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !isUuid) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: title.trim(),
          description: notes.trim() || null,
          status,
          priority,
          assignee_id: assigneeId || null,
          due_date: dueDate || null,
        })
        .eq('id', task.id);
      if (error) throw error;

      if (assigneeId && /^[0-9a-f-]{36}$/i.test(task.projectId)) {
        await supabase.from('project_members').upsert(
          [{ project_id: task.projectId, user_id: assigneeId, role: 'member' }],
          { onConflict: 'project_id,user_id' }
        );
      }

      await onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isUuid || !confirm('Delete this task permanently?')) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id);
      if (error) throw error;
      await onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete task.');
    } finally {
      setSaving(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isUuid) return;
    setPostingComment(true);
    try {
      const { error } = await supabase.from('task_comments').insert([
        {
          task_id: task.id,
          author_id: currentUserId || null,
          body: newComment.trim(),
        },
      ]);
      if (error) throw error;
      setNewComment('');
      await loadComments(task.id);
    } catch (err: any) {
      alert(err.message || 'Failed to post comment.');
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg h-full bg-[#0B0F19] border-l border-white/10 p-6 overflow-y-auto flex flex-col justify-between gap-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>{task.moduleName || 'Task Detail'}</span>
            </div>
            <div className="flex items-center gap-2">
              {canDelete && isUuid && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-slate-400">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <CheckCircle2 className="w-3 h-3" /> Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DrawerTask['status'])}
                  className="w-full px-3 py-2 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-mono focus:outline-none"
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <Flag className="w-3 h-3" /> Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as DrawerTask['priority'])}
                  className="w-full px-3 py-2 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-mono focus:outline-none"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <User className="w-3 h-3" /> Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-mono focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.initials})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" /> Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#090D16] border border-white/10 text-white text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] text-slate-400">Description / Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Technical notes, acceptance criteria..."
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Task Changes'}
            </button>
          </form>

          {/* Comments Section */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comments ({comments.length})</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                    <span className="text-slate-300">
                      {c.profiles?.full_name || c.profiles?.email?.split('@')[0] || 'Team'}
                    </span>
                    <span>{new Date(c.created_at).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{c.body}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-xs font-mono text-slate-500 py-2">No comments yet.</div>
              )}
            </div>

            <form onSubmit={handlePostComment} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={postingComment || !newComment.trim()}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
