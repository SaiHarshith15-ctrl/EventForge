import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, CalendarCheck, Ticket, Clock } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import EventCard from '../../components/shared/EventCard';
import Button from '../../components/ui/Button';
import { EventCardSkeleton } from '../../components/ui/Skeleton';

export default function StaffOverview() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    eventsApi.list({ upcoming: true, limit: 12 }).then((r) => setEvents(r.data)).catch(() => setEvents([]));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Staff Overview</h1>
        <p className="text-ink-soft mt-1">Run check-ins for upcoming events.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={CalendarCheck} label="Upcoming Events" value={(events || []).length} tone="violet" />
        <StatCard icon={ScanLine} label="Scanner Ready" value="Live" tone="mint" />
        <StatCard icon={Clock} label="Today" value={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} tone="amber" />
      </div>

      <div className="flex justify-end">
        <Link to="/app/staff-scan"><Button icon={ScanLine}>Open QR Scanner</Button></Link>
      </div>

      <div>
        <h2 className="font-display font-bold text-lg text-ink mb-4">Upcoming events</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events === null ? (
            Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)
          ) : events.length === 0 ? (
            <div className="col-span-full"><EmptyState icon={Ticket} title="No upcoming events" subtitle="Assigned events will appear here." /></div>
          ) : (
            events.map((ev, i) => <EventCard key={ev._id} event={ev} index={i} />)
          )}
        </div>
      </div>
    </div>
  );
}
