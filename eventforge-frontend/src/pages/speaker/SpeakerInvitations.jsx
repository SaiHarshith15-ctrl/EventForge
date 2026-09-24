import { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { speakerInvitesApi } from '../../api/speakers.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { fmtDate } from '../../utils/format';

export default function SpeakerInvitations() {
  const [invites, setInvites] = useState(null);

  const load = () => speakerInvitesApi.list().then((r) => setInvites(r.data)).catch(() => setInvites([]));
  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    try {
      await speakerInvitesApi.respond(id, status);
      toast.success(status === 'accepted' ? 'Invitation accepted' : 'Invitation declined');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pending = (invites || []).filter((i) => i.status === 'pending');
  const past = (invites || []).filter((i) => i.status !== 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Invitations</h1>
        <p className="text-ink-soft mt-1">Speaking invitations from organizers.</p>
      </div>

      {invites === null ? null : pending.length === 0 && past.length === 0 ? (
        <EmptyState icon={Bell} title="No invitations yet" subtitle="Organizers will invite you to speak here." />
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-lg text-ink mb-3">Pending</h2>
              <div className="space-y-3">
                {pending.map((i) => (
                  <Card key={i._id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">{i.event?.name}</div>
                      <div className="text-xs text-ink-soft">{i.session} {i.event?.date && `· ${fmtDate(i.event.date)}`}</div>
                      <div className="text-xs text-ink-faint mt-0.5">Invited by {i.organizer?.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="success" icon={Check} onClick={() => respond(i._id, 'accepted')}>Accept</Button>
                      <Button size="sm" variant="danger" icon={X} onClick={() => respond(i._id, 'declined')}>Decline</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-lg text-ink mb-3">History</h2>
              <div className="space-y-2">
                {past.map((i) => (
                  <div key={i._id} className="flex items-center justify-between bg-surface border border-line rounded-xl p-3">
                    <div>
                      <div className="font-semibold text-sm text-ink">{i.event?.name}</div>
                      <div className="text-xs text-ink-soft">{i.session}</div>
                    </div>
                    <Badge tone={i.status === 'accepted' ? 'mint' : 'red'}>{i.status}</Badge>
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
