import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, Heart, Search } from 'lucide-react';
import { bookingsApi } from '../../api/bookings.api';
import { usersApi } from '../../api/users.api';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { fmtDate } from '../../utils/format';

export default function AttendeeHome() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState(null);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    bookingsApi.myBookings().then((r) => setBookings(r.data)).catch(() => setBookings([]));
    usersApi.savedEvents().then((r) => setSaved(r.data)).catch(() => {});
  }, []);

  const upcoming = (bookings || []).filter((b) => b.event && new Date(b.event.date) >= new Date() && b.status !== 'cancelled');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-ink-soft mt-1">Here's what's happening with your events.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Upcoming Events" value={upcoming.length} tone="violet" />
        <StatCard icon={Ticket} label="Total Tickets" value={(bookings || []).length} tone="amber" />
        <StatCard icon={Heart} label="Saved Events" value={saved.length} tone="mint" />
        <StatCard icon={Calendar} label="Events Attended" value={(bookings || []).filter((b) => b.checkedIn).length} tone="ink" />
      </div>

      <div>
        <h2 className="font-display font-bold text-lg text-ink mb-4">Upcoming bookings</h2>
        {bookings === null ? null : upcoming.length === 0 ? (
          <EmptyState icon={Calendar} title="No upcoming events" subtitle="Book an event to see it here." action={<Link to="/discover"><Button icon={Search}>Discover events</Button></Link>} />
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b._id} className="flex items-center gap-4 bg-surface border border-line rounded-2xl p-4">
                <div className="w-14 h-14 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${b.event.coverImage})` }} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink truncate">{b.event.name}</div>
                  <div className="text-xs text-ink-soft">{fmtDate(b.event.date)} · {b.event.location} · {b.ticketTypeName}</div>
                </div>
                <Link to="/app/tickets"><Button variant="outline" size="sm">View</Button></Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
