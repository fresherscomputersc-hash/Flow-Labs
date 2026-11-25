'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Square,
  Pause,
  Plus,
  RefreshCw,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface TimeLog {
  id: string;
  task_id: string;
  member_id: string;
  project_id: string;
  hours: number;
  description: string;
  logged_date: string;
  is_billable: boolean;
  created_at: string;
}

interface TimeTrackerProps {
  tasks: any[];
  projects: any[];
  currentUser: { userEmail: string; userName: string; userRole: string; userInitials: string };
}

export default function TimeTracker({ tasks, projects, currentUser }: TimeTrackerProps) {
  // Live Timer State
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerDesc, setTimerDesc] = useState('');

  // Manual Entry Form
  const [manualTask, setManualTask] = useState('');
  const [manualHours, setManualHours] = useState('2.5');
  const [manualDesc, setManualDesc] = useState('');
  const [manualBillable, setManualBillable] = useState(true);

  // Time Logs List
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  // Stopwatch Interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    } else if (!isTimerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const fetchTimeLogs = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('time_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(40);

      if (data) {
        setTimeLogs(data);
      }
    } catch (err) {
      console.warn('Fetch time logs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeLogs();
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStopTimer = async () => {
    if (!selectedTaskId) {
      alert('Please select a task for this logged session.');
      return;
    }
    setIsTimerRunning(false);
    const hoursLogged = Math.max(0.1, Number((timerSeconds / 3600).toFixed(2)));

    try {
      const taskObj = tasks.find(t => t.id === selectedTaskId);
      const projectId = taskObj?.projectId || (projects[0]?.id || null);

      const { error } = await supabase.from('time_logs').insert([
        {
          task_id: selectedTaskId,
          project_id: projectId,
          hours: hoursLogged,
          description: timerDesc.trim() || `Live session on ${taskObj?.title || 'task'}`,
          logged_date: new Date().toISOString().split('T')[0],
          is_billable: true
        }
      ]);

      if (error) throw error;
      setNotice(`Saved ${hoursLogged} hour(s) to timesheet.`);
      setTimerSeconds(0);
      setTimerDesc('');
      await fetchTimeLogs();
    } catch (e: any) {
      alert(e.message || 'Failed to save time log.');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTask || !manualHours) return;

    try {
      const taskObj = tasks.find(t => t.id === manualTask);
      const projectId = taskObj?.projectId || (projects[0]?.id || null);

      const { error } = await supabase.from('time_logs').insert([
        {
          task_id: manualTask,
          project_id: projectId,
          hours: Number(manualHours),
          description: manualDesc.trim() || `Work on ${taskObj?.title || 'task'}`,
          logged_date: new Date().toISOString().split('T')[0],
          is_billable: manualBillable
        }
      ]);

      if (error) throw error;
      setNotice(`Logged ${manualHours} hours.`);
      setManualDesc('');
      await fetchTimeLogs();
    } catch (e: any) {
      alert(e.message || 'Failed to log manual time.');
    }
  };

  const totalWeekHours = timeLogs.reduce((acc, t) => acc + (Number(t.hours) || 0), 0);

  return (
    <div className="space-y-7">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display text-xl font-normal text-white">Time Tracking & Timesheet</h2>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Live stopwatch session recording and manual timesheets with automated payout calculation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-slate-300">
            This Week: <strong className="text-emerald-400 font-medium">{totalWeekHours.toFixed(1)}h logged</strong>
          </div>
          <button
            onClick={fetchTimeLogs}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Live Stopwatch & Manual Logger Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Live Task Stopwatch */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-xs font-mono text-slate-400">Live Task Stopwatch</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
              isTimerRunning ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse' : 'bg-white/5 border-white/5 text-slate-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isTimerRunning ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
              {isTimerRunning ? 'RECORDING' : 'IDLE'}
            </span>
          </div>

          {/* Stopwatch Digital Display */}
          <div className="text-center py-4">
            <div className="font-mono text-5xl font-light text-white tracking-widest">
              {formatTimer(timerSeconds)}
            </div>
            <p className="text-slate-500 text-xs font-mono mt-1">Elapsed session duration</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block font-mono text-xs text-slate-300">Select Task *</label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                disabled={isTimerRunning}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="" className="bg-[#0E1424]">-- Select Active Task --</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0E1424]">
                    {t.title} ({t.priority})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-xs text-slate-300">Session Notes / Description (Optional)</label>
              <input
                type="text"
                placeholder="What are you working on right now?"
                value={timerDesc}
                onChange={(e) => setTimerDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              {!isTimerRunning ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedTaskId) {
                      alert('Please select a task before starting the timer.');
                      return;
                    }
                    setIsTimerRunning(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 text-black font-medium text-xs font-mono hover:bg-emerald-400 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Live Timer</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-black font-medium text-xs font-mono hover:bg-amber-400 transition-colors"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Timer</span>
                </button>
              )}

              {timerSeconds > 0 && (
                <button
                  type="button"
                  onClick={handleStopTimer}
                  className="px-4 py-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-medium text-xs font-mono transition-colors"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Log & Save</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Manual Timesheet Entry */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
          <div className="pb-2 border-b border-white/5">
            <span className="text-xs font-mono text-slate-400">Manual Timesheet Logger</span>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block font-mono text-xs text-slate-300">Task *</label>
              <select
                required
                value={manualTask}
                onChange={(e) => setManualTask(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
              >
                <option value="" className="bg-[#0E1424]">-- Select Task --</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0E1424]">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Hours Logged</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  required
                  value={manualHours}
                  onChange={(e) => setManualHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Billable</label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="billable-check"
                    checked={manualBillable}
                    onChange={(e) => setManualBillable(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-0"
                  />
                  <label htmlFor="billable-check" className="font-mono text-xs text-slate-300">
                    Client Billable
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-mono text-xs text-slate-300">Work Delivered</label>
              <textarea
                rows={3}
                required
                placeholder="Engineered Edge database schema, resolved RLS policy recursion, pushed commits..."
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Timesheet Entry</span>
            </button>
          </form>
        </div>

      </div>

      {/* Logged Timesheets Table */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-white/10 text-xs font-mono">
          <span className="text-white font-medium">Recent Timesheet Entries</span>
          <span className="text-slate-400">{timeLogs.length} logs recorded</span>
        </div>

        <div className="space-y-2.5">
          {timeLogs.map((log) => {
            const taskObj = tasks.find(t => t.id === log.task_id);
            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{taskObj?.title || 'Studio Task'}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400 border border-white/5">
                      {log.is_billable ? 'Billable' : 'Internal'}
                    </span>
                  </div>
                  {log.description && (
                    <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">{log.description}</p>
                  )}
                  <div className="font-mono text-[11px] text-slate-500">
                    Logged on {new Date(log.logged_date || log.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="font-mono text-right shrink-0">
                  <div className="font-display text-lg text-emerald-400 font-normal">
                    {Number(log.hours).toFixed(1)} hrs
                  </div>
                </div>
              </div>
            );
          })}

          {timeLogs.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No time logged yet. Use the stopwatch above to start recording your focus session.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
