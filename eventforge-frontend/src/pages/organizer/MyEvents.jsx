import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsApi } from '../../api/events.api';
import { useAuthStore } from '../../store/authStore';
import EventCard from '../../components/shared/EventCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { EventCardSkeleton } from '../../components/ui/Skeleton';

export default function MyEvents() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState(null);

  const load = () => eventsApi.list({ organizer: user._id, includeUnpublished: true, limit: 50 }).then((r) => setEvents(r.data)).catch(() => setEvents([]));
  useEffect(() => { load(); }, []);

  const togglePublish = async (ev) => {
    try {
      if (ev.isPublished) {
        await eventsApi.unpublish(ev._id);
        toast.success('Event unpublished');
      } else {
        await eventsApi.publish(ev._id);
        toast.success('Event published — now discoverable!');
      }
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">My Events</h1>
          <p className="text-ink-soft mt-1">All events you're organizing.</p>
        </div>
        <Link to="/app/create-event"><Button icon={Plus}>Create Event</Button></Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events === null ? (
          Array.from({ length: 3 }).map((_, i) => <EventCardSkeleton key={i} />)
        ) : events.length === 0 ? (
          <div className="col-span-full"><EmptyState icon={Calendar} title="No events yet" subtitle="Create your first event to get started." action={<Link to="/app/create-event"><Button icon={Plus}>Create Event</Button></Link>} /></div>
        ) : (
          events.map((ev, i) => (
            <div key={ev._id} className="space-y-2">
              <EventCard event={ev} index={i} />
              <div className="flex gap-2 px-1">
                <Badge tone={ev.isPublished ? 'mint' : 'neutral'}>{ev.status}</Badge>
                <Link to={`/app/manage-event/${ev._id}`} className="ml-auto text-xs font-semibold text-violet-600 hover:underline">Manage</Link>
                <button onClick={() => togglePublish(ev)} className="text-xs font-semibold text-ink-soft hover:text-ink">
                  {ev.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
