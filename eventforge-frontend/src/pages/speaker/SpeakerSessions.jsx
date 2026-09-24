import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { speakerInvitesApi } from '../../api/speakers.api';
import EmptyState from '../../components/ui/EmptyState';
import Card from '../../components/ui/Card';
import { fmtDate } from '../../utils/format';

export default function SpeakerSessions() {
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    speakerInvitesApi.list().then((r) => setSessions(r.data.filter((i) => i.status === 'accepted'))).catch(() => setSessions([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Confirmed Sessions</h1>
        <p className="text-ink-soft mt-1">Talks you're confirmed to give.</p>
      </div>

      {sessions === null ? null : sessions.length === 0 ? (
        <EmptyState icon={Calendar} title="No confirmed sessions yet" subtitle="Accepted invitations will appear here." />
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s._id} className="p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${s.event?.coverImage})` }} />
              <div>
                <div className="font-semibold text-ink">{s.event?.name}</div>
                <div className="text-xs text-ink-soft">{s.session} · {s.event?.date && fmtDate(s.event.date)} · {s.event?.location}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
