import { MapPin, Users } from 'lucide-react';
import { fmtINR } from '../../utils/format';
import Card from '../ui/Card';
import SafeImage from './SafeImage';

export default function VenueCard({ venue, action }) {
  return (
    <Card hover className="overflow-hidden">
      <SafeImage src={venue.coverImage || venue.images?.[0]} kind="venue" alt={venue.name} className="w-full h-32 object-cover" />
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
