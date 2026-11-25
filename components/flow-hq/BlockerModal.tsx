'use client';

import { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BlockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any | null;
  onSubmitted: () => void;
}

export default function BlockerModal({
  isOpen,
  onClose,
  task,
  onSubmitted
}: BlockerModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'flag_blocker',
          task_id: task.id,
          blocker_reason: reason.trim()
        })
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to flag blocker.');

      onSubmitted();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error flagging blocker.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve_blocker',
          task_id: task.id
        })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to resolve blocker.');

      onSubmitted();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error resolving blocker.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
        
        <div className="flex justify-between items-start pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-display text-lg font-normal text-white">
                {task.is_blocked ? 'Manage Sprint Blocker' : 'Flag Technical Blocker'}
              </h3>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Task: {task.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {task.is_blocked ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed space-y-1">
              <div className="font-mono text-[10px] text-amber-400 uppercase font-medium">Current Blocker:</div>
              <div>{task.blocker_reason || 'Blocker reason pending.'}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-medium text-xs font-mono hover:bg-emerald-400"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Blocker Resolved</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block font-mono text-xs text-slate-300">
                Blocker Explanation & Dependencies <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Specify what is blocked (e.g. missing Stripe webhook secret, waiting for client DNS records)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 text-black font-medium text-xs font-mono hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{loading ? 'Flagging...' : 'Broadcast Blocker Alert'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
