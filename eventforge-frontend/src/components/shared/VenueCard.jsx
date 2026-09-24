import { MapPin, Users } from 'lucide-react';
import { fmtINR } from '../../utils/format';
import Card from '../ui/Card';

const FALLBACK = 'https://images.unsplash.com/photo-1519167758481-83f550d39cd3?w=600&q=70';

export default function VenueCard({ venue, action }) {
  return (
    <Card hover className="overflow-hidden">
      <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${venue.coverImage || venue.images?.[0] || FALLBACK})` }} />
      <div className="p-4 space-y-2">
        <h3 className="font-display font-bold text-ink line-clamp-1">{venue.name}</h3>
        <div className="flex gap-3 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{venue.location}</span>
          <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{venue.capacity}</span>
        </div>
        <div className="font-display font-bold text-ink">{fmtINR(venue.pricePerDay)}<span className="text-xs text-ink-faint font-sans font-normal">/day</span></div>
        <div className="flex flex-wrap gap-1.5">
          {(venue.amenities || []).slice(0, 4).map((a) => (
            <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-semibold">{a}</span>
          ))}
        </div>
        {action}
      </div>
    </Card>
  );
}
