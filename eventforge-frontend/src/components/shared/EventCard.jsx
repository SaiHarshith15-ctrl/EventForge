import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fmtDateShort, fmtINR } from '../../utils/format';
import Badge from '../ui/Badge';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1540575467063-17843e7da652?w=600&q=70';

export default function EventCard({ event, onToggleSave, saved = false, index = 0 }) {
  const lowestTicket = event.tickets?.[0];
  const price = lowestTicket ? lowestTicket.price : 0;
  const seatsLeft = event.capacity - event.booked;
  const pct = event.capacity ? Math.min(100, Math.round((event.booked / event.capacity) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -5 }}
      className="group relative bg-surface border border-line rounded-2xl overflow-hidden shadow-soft hover:shadow-lift transition-shadow"
    >
      <Link to={`/events/${event._id}`} className="block">
        <div
          className="h-40 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${event.coverImage || FALLBACK_IMG})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          <Badge tone="ink" className="absolute top-3 left-3 backdrop-blur-sm bg-ink/70">{event.category}</Badge>
          {onToggleSave && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleSave(event._id); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 grid place-items-center hover:bg-white transition-colors"
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : 'text-ink-soft'}`} />
            </button>
          )}
        </div>

        <div className="ticket-notch" style={{ '--notch-bg': '#F6F4FC' }} />

        <div className="px-4 pb-4 pt-1 space-y-2">
          <h3 className="font-display font-bold text-ink leading-snug line-clamp-1">{event.name}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmtDateShort(event.date)}</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
          </div>

          <div className="h-1 rounded-full bg-violet-50 overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-violet-500 to-amber-400 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-[11px] text-ink-faint">{seatsLeft > 0 ? `${seatsLeft} seats remaining` : 'Sold out'}</div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-display font-bold text-ink">{price === 0 ? 'Free' : fmtINR(price)}</span>
            <span className="text-xs font-semibold text-violet-600 group-hover:translate-x-0.5 transition-transform">View details</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
