import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { sponsorRequestsApi } from '../../api/sponsors.api';
import EmptyState from '../../components/ui/EmptyState';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { fmtDate } from '../../utils/format';

export default function SponsorActive() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    sponsorRequestsApi.list().then((r) => setActive(r.data.filter((x) => x.status === 'accepted'))).catch(() => setActive([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Active Sponsorships</h1>
        <p className="text-ink-soft mt-1">Events your brand is currently backing.</p>
      </div>

      {active === null ? null : active.length === 0 ? (
        <EmptyState icon={Award} title="No active sponsorships" subtitle="Accepted sponsorship requests appear here." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {active.map((r) => (
            <Card key={r._id} className="p-5">
              <Badge tone="mint">Active</Badge>
              <div className="font-display font-bold text-ink mt-2">{r.event?.name}</div>
              <div className="text-xs text-ink-soft mt-1">{r.event?.date && fmtDate(r.event.date)} · {r.event?.location}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
