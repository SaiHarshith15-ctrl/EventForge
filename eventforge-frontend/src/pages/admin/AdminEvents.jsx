import { useEffect, useState } from 'react';
import { Search, Ban, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsApi } from '../../api/events.api';
import Badge from '../../components/ui/Badge';
import { useDebounce } from '../../hooks/useDebounce';
import EmptyState from '../../components/ui/EmptyState';
import { fmtDate } from '../../utils/format';

export default function AdminEvents() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [events, setEvents] = useState(null);

  const load = () => eventsApi.list({ search: debounced || undefined, includeUnpublished: true, limit: 100 })
    .then((r) => setEvents(r.data)).catch(() => setEvents([]));
  useEffect(() => { load(); }, [debounced]);

  const cancelEvent = async (ev) => {
    if (!confirm(`Cancel "${ev.name}"? Attendees will be notified.`)) return;
    try {
      await eventsApi.cancel(ev._id);
      toast.success('Event cancelled');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const remove = async (ev) => {
    if (!confirm(`Permanently delete "${ev.name}"?`)) return;
    try {
      await eventsApi.remove(ev._id);
      toast.success('Event deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Events</h1>
        <p className="text-ink-soft mt-1">Moderate every event on the platform.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-ink-faint absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events by name..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-line focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 text-sm"
        />
      </div>

      {events === null ? null : events.length === 0 ? (
        <EmptyState icon={Search} title="No events found" subtitle="Try a different search." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-violet-50 text-ink-soft text-xs uppercase">
              <tr><th className="text-left p-3">Event</th><th className="text-left p-3">Organizer</th><th className="text-left p-3">Date</th><th className="text-left p-3">Status</th><th className="text-left p-3">Actions</th></tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev._id} className="border-t border-line">
                  <td className="p-3 font-semibold text-ink">{ev.name}</td>
                  <td className="p-3 text-ink-soft">{ev.organizer?.name}</td>
                  <td className="p-3 text-ink-soft">{fmtDate(ev.date)}</td>
                  <td className="p-3"><Badge tone={ev.status === 'CANCELLED' ? 'red' : ev.isPublished ? 'mint' : 'neutral'}>{ev.status}</Badge></td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {ev.status !== 'CANCELLED' && (
                        <button onClick={() => cancelEvent(ev)} title="Cancel" className="text-ink-faint hover:text-amber-600"><Ban className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => remove(ev)} title="Delete" className="text-ink-faint hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
