'use client';

import { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Link2 } from 'lucide-react';

interface QAReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any | null;
  team: any[];
  onSubmitted: () => void;
}

export default function QAReviewModal({
  isOpen,
  onClose,
  task,
  team,
  onSubmitted
}: QAReviewModalProps) {
  const [reviewer, setReviewer] = useState('');
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_for_review',
          task_id: task.id,
          reviewer_id: reviewer || null,
          deliverable_url: deliverableUrl.trim(),
          notes: notes.trim()
        })
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      onSubmitted();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting for QA review.');
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
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <h3 className="font-display text-lg font-normal text-white">Submit for Internal QA Review</h3>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block font-mono text-xs text-slate-300">Designated Reviewer</label>
            <select
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
            >
              <option value="" className="bg-[#0E1424]">-- Select Reviewer (Founding Engineer / PM) --</option>
              {team.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#0E1424]">
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-xs text-slate-300">Deliverable / Preview Link</label>
            <div className="relative">
              <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://staging.theflowlabs.online or GitHub PR link"
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-mono text-xs text-slate-300">Implementation Summary & QA Notes</label>
            <textarea
              rows={3}
              required
              placeholder="What was engineered? How should the reviewer verify this work?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 leading-relaxed"
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
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-500 text-white font-medium text-xs font-mono hover:bg-purple-400 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting...' : 'Submit for QA'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
