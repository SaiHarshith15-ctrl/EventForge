import { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { sponsorRequestsApi } from '../../api/sponsors.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { fmtDate } from '../../utils/format';

export default function SponsorRequests() {
  const [requests, setRequests] = useState(null);

  const load = () => sponsorRequestsApi.list().then((r) => setRequests(r.data)).catch(() => setRequests([]));
  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    try {
      await sponsorRequestsApi.respond(id, status);
      toast.success(status === 'accepted' ? 'Request accepted' : 'Request declined');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pending = (requests || []).filter((r) => r.status === 'pending');
  const past = (requests || []).filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Sponsorship Requests</h1>
        <p className="text-ink-soft mt-1">Organizers asking you to sponsor their event.</p>
      </div>

      {requests === null ? null : pending.length === 0 && past.length === 0 ? (
        <EmptyState icon={Bell} title="No requests yet" subtitle="Organizer requests will show up here." />
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              {pending.map((r) => (
                <Card key={r._id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-ink">{r.event?.name || 'General inquiry'}</div>
                    <div className="text-xs text-ink-soft">{r.event?.date && fmtDate(r.event.date)} · {r.event?.location}</div>
                    <div className="text-xs text-ink-faint mt-0.5">Requested by {r.organizer?.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="success" icon={Check} onClick={() => respond(r._id, 'accepted')}>Accept</Button>
                    <Button size="sm" variant="danger" icon={X} onClick={() => respond(r._id, 'rejected')}>Decline</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-lg text-ink mb-3">History</h2>
              <div className="space-y-2">
                {past.map((r) => (
                  <div key={r._id} className="flex items-center justify-between bg-surface border border-line rounded-xl p-3">
                    <div className="font-semibold text-sm text-ink">{r.event?.name || 'General inquiry'}</div>
                    <Badge tone={r.status === 'accepted' ? 'mint' : 'red'}>{r.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
