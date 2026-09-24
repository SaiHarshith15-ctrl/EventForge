import { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { venueRequestsApi } from '../../api/venues.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { fmtDate } from '../../utils/format';

export default function VenueRequests() {
  const [requests, setRequests] = useState(null);

  const load = () => venueRequestsApi.list().then((r) => setRequests(r.data)).catch(() => setRequests([]));
  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    try {
      await venueRequestsApi.respond(id, { status });
      toast.success(status === 'accepted' ? 'Request accepted' : 'Request declined');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Booking Requests</h1>
        <p className="text-ink-soft mt-1">Organizers asking to use your venues.</p>
      </div>

      {requests === null ? null : requests.length === 0 ? (
        <EmptyState icon={Bell} title="No requests yet" subtitle="Requests from organizers will show up here." />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r._id} className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-ink">{r.venue?.name}</div>
                <div className="text-xs text-ink-soft">
                  {r.event?.name || 'General inquiry'} {r.event?.date && `· ${fmtDate(r.event.date)}`}
                </div>
                <div className="text-xs text-ink-faint mt-0.5">Requested by {r.organizer?.name}</div>
              </div>
              <div className="flex items-center gap-2">
                {r.status === 'pending' ? (
                  <>
                    <Button size="sm" variant="success" icon={Check} onClick={() => respond(r._id, 'accepted')}>Accept</Button>
                    <Button size="sm" variant="danger" icon={X} onClick={() => respond(r._id, 'rejected')}>Decline</Button>
                  </>
                ) : (
                  <Badge tone={r.status === 'accepted' ? 'mint' : 'red'}>{r.status}</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
