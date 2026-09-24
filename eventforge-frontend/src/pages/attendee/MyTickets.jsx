import { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';
import { bookingsApi } from '../../api/bookings.api';
import TicketCard from '../../components/shared/TicketCard';
import EmptyState from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export default function MyTickets() {
  const [bookings, setBookings] = useState(null);

  useEffect(() => {
    bookingsApi.myBookings().then((r) => setBookings(r.data)).catch(() => setBookings([]));
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">My Tickets</h1>
        <p className="text-ink-soft mt-1">All your event tickets, ready to scan at the door.</p>
      </div>

      {bookings === null ? (
        <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
      ) : bookings.length === 0 ? (
        <EmptyState icon={Ticket} title="No tickets yet" subtitle="Book an event to get your first ticket." />
      ) : (
        <div className="space-y-5">
          {bookings.map((b) => <TicketCard key={b._id} booking={b} />)}
        </div>
      )}
    </div>
  );
}
