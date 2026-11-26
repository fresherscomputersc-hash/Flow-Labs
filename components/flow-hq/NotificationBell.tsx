'use client';

import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NotificationRow {
  id: string;
  kind: string;
  title: string;
  body?: string;
  read_at?: string | null;
  created_at: string;
}

export default function NotificationBell({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);

  const loadNotifications = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('notifications')
      .select('id, kind, title, body, read_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(15);
    if (data) setItems(data);
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const unreadCount = items.filter((n) => !n.read_at).length;

  const markRead = async (id: string) => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: now } : n)));
    await supabase.from('notifications').update({ read_at: now }).eq('id', id);
  };

  const markAllRead = async () => {
    if (!userId || unreadCount === 0) return;
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || now })));
    await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', userId)
      .is('read_at', null);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) loadNotifications();
        }}
        className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-[#07090E] font-mono text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] z-50 rounded-2xl bg-[#0B0F19] border border-white/15 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="font-mono text-xs text-white font-medium">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left px-4 py-3 space-y-1 transition-colors hover:bg-white/[0.03] ${
                    !n.read_at ? 'bg-cyan-500/[0.04]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-medium ${!n.read_at ? 'text-white' : 'text-slate-400'}`}>
                      {n.title}
                    </span>
                    {!n.read_at && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
                  </div>
                  {n.body && <p className="text-[11px] text-slate-400 line-clamp-2">{n.body}</p>}
                  <div className="text-[10px] font-mono text-slate-500">
                    {new Date(n.created_at).toLocaleString('en-IN')}
                  </div>
                </button>
              ))}

              {items.length === 0 && (
                <div className="px-4 py-8 text-center text-xs font-mono text-slate-500">
                  All caught up. No notifications yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
