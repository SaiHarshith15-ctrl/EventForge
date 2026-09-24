import { useEffect, useState } from 'react';
import { Award, Search } from 'lucide-react';
import { sponsorsApi, sponsorRequestsApi } from '../../api/sponsors.api';
import SponsorCard from '../../components/shared/SponsorCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

export default function OrgSponsors() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [sponsors, setSponsors] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    sponsorsApi.list({ search: debounced || undefined, limit: 24 }).then((r) => setSponsors(r.data)).catch(() => setSponsors([]));
  }, [debounced]);

  const loadRequests = () => sponsorRequestsApi.list().then((r) => setRequests(r.data)).catch(() => setRequests([]));
  useEffect(() => { loadRequests(); }, []);

  const request = async (sponsorId) => {
    try {
      await sponsorRequestsApi.create({ sponsorId });
      toast.success('Sponsorship request sent');
      loadRequests();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Sponsors</h1>
        <p className="text-ink-soft mt-1">Find sponsors that fit your event's audience.</p>
      </div>

      {requests.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg text-ink mb-3">Your requests</h2>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r._id} className="flex items-center justify-between bg-surface border border-line rounded-xl p-3">
                <div>
                  <div className="font-semibold text-sm text-ink">{r.sponsor?.name}</div>
                  <div className="text-xs text-ink-soft">{r.event?.name || 'General inquiry'}</div>
                </div>
                <Badge tone={r.status === 'accepted' ? 'mint' : r.status === 'rejected' ? 'red' : 'amber'}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-ink-faint absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sponsors by name..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-line focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sponsors === null ? null : sponsors.length === 0 ? (
          <div className="col-span-full"><EmptyState icon={Award} title="No sponsors found" subtitle="Try a different search." /></div>
        ) : (
          sponsors.map((s) => (
            <SponsorCard key={s._id} sponsor={s} action={<Button size="sm" className="w-full" onClick={() => request(s._id)}>Request Sponsorship</Button>} />
          ))
        )}
      </div>
    </div>
  );
}
