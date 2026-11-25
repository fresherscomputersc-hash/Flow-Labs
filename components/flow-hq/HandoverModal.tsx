'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, AlertCircle, FileCheck2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HandoverItem {
  id: string;
  label: string;
  category: string;
  completed: boolean;
}

interface HandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any | null;
  onCompleted: () => void;
}

const DEFAULT_ITEMS: HandoverItem[] = [
  { id: 'h1', label: 'Production Deployment & DNS switch completed', category: 'deployment', completed: false },
  { id: 'h2', label: 'Admin credentials & password transfer securely shared', category: 'security', completed: false },
  { id: 'h3', label: 'Code repository ownership transferred / invite accepted', category: 'code', completed: false },
  { id: 'h4', label: 'Walkthrough video & technical documentation shared', category: 'handover', completed: false },
  { id: 'h5', label: 'Final invoice settled and receipt issued', category: 'finance', completed: false }
];

export default function HandoverModal({
  isOpen,
  onClose,
  project,
  onCompleted
}: HandoverModalProps) {
  const [items, setItems] = useState<HandoverItem[]>(DEFAULT_ITEMS);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !project) return;
    const fetchHandover = async () => {
      try {
        const { data } = await supabase
          .from('handover_checklists')
          .select('*')
          .eq('project_id', project.id);

        if (data && data.length > 0 && Array.isArray(data[0].items) && data[0].items.length > 0) {
          setItems(data[0].items);
        } else {
          setItems(DEFAULT_ITEMS);
        }
      } catch (err) {
        console.warn('Handover fetch notice:', err);
      }
    };
    fetchHandover();
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleToggle = (index: number) => {
    const updated = [...items];
    updated[index].completed = !updated[index].completed;
    setItems(updated);
  };

  const handleVerifyAndClose = async () => {
    const uncompleted = items.filter(i => !i.completed);
    if (uncompleted.length > 0) {
      setErrorMsg(`Cannot mark project complete. ${uncompleted.length} handover item(s) are pending: ${uncompleted.map(u => u.label).join(', ')}`);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Save checklist state to supabase
      await supabase
        .from('handover_checklists')
        .upsert({
          project_id: project.id,
          items,
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      // Call operations API to close project
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_handover',
          project_id: project.id
        })
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to complete handover.');

      onCompleted();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error completing handover.');
    } finally {
      setLoading(false);
    }
  };

  const allCompleted = items.every(i => i.completed);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
        
        <div className="flex justify-between items-start pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display text-lg font-normal text-white">Project Handover Gate</h3>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Project: {project.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-slate-300 text-xs">
            Studio policy requires all 5 handover criteria to be certified before archiving or marking a client build completed:
          </p>

          <div className="space-y-2.5">
            {items.map((item, idx) => (
              <label
                key={item.id}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  item.completed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                    : 'bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/20'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggle(idx)}
                  className="w-4 h-4 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-0 mt-0.5"
                />
                <span className="text-xs leading-relaxed select-none">{item.label}</span>
              </label>
            ))}
          </div>
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
            type="button"
            onClick={handleVerifyAndClose}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium text-xs font-mono transition-colors ${
              allCompleted
                ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                : 'bg-white/10 text-slate-400 hover:bg-white/15'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Verifying...' : 'Verify & Mark Completed'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
