import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useClickOutside } from '../../hooks/useClickOutside';

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function NotificationBell() {
  const { items, unreadCount, fetch, markRead, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative w-10 h-10 rounded-full hover:bg-violet-50 grid place-items-center text-ink-soft transition-colors">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulseGlow"
          />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto scrollbar-thin bg-surface border border-line rounded-2xl shadow-lift z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <span className="font-display font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-violet-600 font-semibold hover:underline">Mark all read</button>
              )}
            </div>
            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-ink-soft">You're all caught up.</div>
            ) : (
              items.slice(0, 20).map((n) => (
                <button
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  className={`w-full text-left px-4 py-3 border-b border-line last:border-0 hover:bg-violet-50 transition-colors ${!n.read ? 'bg-violet-50/60' : ''}`}
                >
                  <div className="text-sm text-ink">{n.text}</div>
                  <div className="text-[11px] text-ink-faint mt-0.5">{timeAgo(n.createdAt)}</div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
