import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { usersApi } from '../../api/users.api';
import EventCard from '../../components/shared/EventCard';
import EmptyState from '../../components/ui/EmptyState';
import { EventCardSkeleton } from '../../components/ui/Skeleton';

export default function SavedEvents() {
  const [events, setEvents] = useState(null);

  const load = () => usersApi.savedEvents().then((r) => setEvents(r.data)).catch(() => setEvents([]));
  useEffect(() => { load(); }, []);

  const toggleSave = async (id) => {
    await usersApi.toggleSaved(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Saved Events</h1>
        <p className="text-ink-soft mt-1">Your wishlist — come back anytime to book.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events === null
          ? Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)
          : events.length === 0
          ? <div className="col-span-full"><EmptyState icon={Heart} title="Nothing saved yet" subtitle="Tap the heart on any event to save it here." /></div>
          : events.map((ev, i) => <EventCard key={ev._id} event={ev} index={i} saved onToggleSave={toggleSave} />)}
      </div>
    </div>
  );
}
