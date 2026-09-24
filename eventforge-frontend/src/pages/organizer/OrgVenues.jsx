import { useEffect, useState } from 'react';
import { Building2, Search } from 'lucide-react';
import { venuesApi, venueRequestsApi } from '../../api/venues.api';
import VenueCard from '../../components/shared/VenueCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

export default function OrgVenues() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [venues, setVenues] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    venuesApi.list({ search: debounced || undefined, limit: 24 }).then((r) => setVenues(r.data)).catch(() => setVenues([]));
  }, [debounced]);

  const loadRequests = () => venueRequestsApi.list().then((r) => setRequests(r.data)).catch(() => setRequests([]));
  useEffect(() => { loadRequests(); }, []);

  const requestVenue = async (venueId) => {
    try {
      await venueRequestsApi.create({ venueId });
      toast.success('Request sent to venue owner');
      loadRequests();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Venues</h1>
        <p className="text-ink-soft mt-1">Browse listed venues and track your booking requests.</p>
      </div>

      {requests.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg text-ink mb-3">Your requests</h2>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r._id} className="flex items-center justify-between bg-surface border border-line rounded-xl p-3">
                <div>
                  <div className="font-semibold text-sm text-ink">{r.venue?.name}</div>
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
          placeholder="Search venues by name or city..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-line focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {venues === null ? null : venues.length === 0 ? (
          <div className="col-span-full"><EmptyState icon={Building2} title="No venues found" subtitle="Try a different search." /></div>
        ) : (
          venues.map((v) => (
            <VenueCard key={v._id} venue={v} action={<Button size="sm" className="w-full mt-2" onClick={() => requestVenue(v._id)}>Request Booking</Button>} />
          ))
        )}
      </div>
    </div>
  );
}
