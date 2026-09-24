import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import EventCard from '../../components/shared/EventCard';
import { EventCardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { Select } from '../../components/ui/Input';
import { eventsApi } from '../../api/events.api';
import { usersApi } from '../../api/users.api';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuthStore } from '../../store/authStore';
import { CATEGORIES, CITIES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function Discover() {
  const [params] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [location, setLocation] = useState('All');
  const [price, setPrice] = useState('all');
  const [events, setEvents] = useState(null);
  const [saved, setSaved] = useState([]);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setEvents(null);
    eventsApi.list({
      search: debouncedSearch || undefined,
      category: category !== 'All' ? category : undefined,
      location: location !== 'All' ? location : undefined,
      price: price !== 'all' ? price : undefined,
      limit: 24,
    }).then((res) => setEvents(res.data)).catch(() => setEvents([]));
  }, [debouncedSearch, category, location, price]);

  useEffect(() => {
    if (isAuthenticated) usersApi.savedEvents().then((r) => setSaved(r.data.map((e) => e._id))).catch(() => {});
  }, [isAuthenticated]);

  const toggleSave = async (id) => {
    if (!isAuthenticated) return toast.error('Sign in to save events');
    const res = await usersApi.toggleSaved(id);
    setSaved((s) => (res.data.saved ? [...s, id] : s.filter((x) => x !== id)));
    toast.success(res.message);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <h1 className="font-display font-bold text-3xl text-ink">Discover Events</h1>
      <p className="text-ink-soft mt-1">Find your next experience.</p>

      <div className="bg-surface border border-line rounded-2xl p-4 mt-6 shadow-soft">
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-ink-faint absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, conferences, hackathons..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-line focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <SlidersHorizontal className="w-4 h-4 text-ink-faint" />
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-auto">
            <option>All</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Select value={location} onChange={(e) => setLocation(e.target.value)} className="w-auto">
            <option>All</option>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Select value={price} onChange={(e) => setPrice(e.target.value)} className="w-auto">
            <option value="all">All Prices</option>
            <option value="free">Free Only</option>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {events === null
          ? Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)
          : events.length === 0
          ? <div className="col-span-full"><EmptyState icon={Search} title="No events found" subtitle="Try different filters or search terms." /></div>
          : events.map((ev, i) => (
              <EventCard key={ev._id} event={ev} index={i} saved={saved.includes(ev._id)} onToggleSave={toggleSave} />
            ))}
      </div>
    </div>
  );
}
