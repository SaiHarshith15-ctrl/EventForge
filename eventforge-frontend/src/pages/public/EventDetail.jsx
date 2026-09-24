import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Share2, Heart, Star, Loader2 } from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import { usersApi } from '../../api/users.api';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { fmtDate, fmtINR, daysUntil } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import BookingModal from '../../components/shared/BookingModal';
import toast from 'react-hot-toast';

export default function EventDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const { bookingEvent, openBooking, closeBooking } = useUiStore();
  const [event, setEvent] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    eventsApi.get(id).then((res) => setEvent(res.data)).catch(() => setEvent(false));
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && event) {
      usersApi.savedEvents().then((r) => setSaved(r.data.some((e) => e._id === event._id))).catch(() => {});
    }
  }, [isAuthenticated, event]);

  if (event === null) return <div className="grid place-items-center h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>;
  if (event === false) return <div className="max-w-3xl mx-auto px-5 py-20 text-center text-ink-soft">Event not found.</div>;

  const dd = event.registrationDeadline ? daysUntil(event.registrationDeadline) : null;

  const toggleSave = async () => {
    if (!isAuthenticated) return toast.error('Sign in to save events');
    const res = await usersApi.toggleSaved(event._id);
    setSaved(res.data.saved);
    toast.success(res.message);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden h-64 sm:h-80 bg-cover bg-center relative shadow-lift" style={{ backgroundImage: `url(${event.coverImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
          <div>
            <Badge tone="amber">{event.category}</Badge>
            <h1 className="font-display font-bold text-2xl sm:text-4xl text-white mt-2">{event.name}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleSave} className="w-10 h-10 rounded-full bg-white/90 grid place-items-center"><Heart className={`w-4 h-4 ${saved ? 'fill-amber-500 text-amber-500' : 'text-ink-soft'}`} /></button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }} className="w-10 h-10 rounded-full bg-white/90 grid place-items-center"><Share2 className="w-4 h-4 text-ink-soft" /></button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-wrap gap-4 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" />{fmtDate(event.date)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" />{event.time}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" />{event.location}</span>
            {dd !== null && dd >= 0 && <Badge tone="amber">Registration closes in {dd}d</Badge>}
          </div>

          <p className="text-ink-soft leading-relaxed">{event.description}</p>

          {event.speakers?.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-ink mb-3">Speakers</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {event.speakers.map((s) => (
                  <div key={s._id} className="flex items-center gap-3 bg-surface border border-line rounded-xl p-3">
                    <Avatar name={s.name} src={s.avatar} />
                    <div><div className="font-semibold text-sm text-ink">{s.name}</div><div className="text-xs text-ink-soft">{s.role} · {s.company}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.schedule?.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-ink mb-3">Schedule</h3>
              <div className="space-y-2">
                {event.schedule.map((s) => (
                  <div key={s._id} className="flex gap-4 bg-surface border border-line rounded-xl p-3">
                    <span className="font-display font-bold text-violet-600 w-16 shrink-0">{s.time}</span>
                    <div><div className="font-semibold text-sm text-ink">{s.title}</div><div className="text-xs text-ink-soft">{s.speakerName} · {s.room}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.venue && (
            <div>
              <h3 className="font-display font-bold text-ink mb-3">Venue</h3>
              <div className="flex items-center gap-3 bg-surface border border-line rounded-xl p-3">
                <div className="w-14 h-14 rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${event.venue.coverImage})` }} />
                <div><div className="font-semibold text-sm text-ink">{event.venue.name}</div><div className="text-xs text-ink-soft">Capacity {event.venue.capacity} · {event.venue.location}</div></div>
              </div>
            </div>
          )}

          {event.reviews?.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-ink mb-3">Reviews</h3>
              <div className="space-y-2">
                {event.reviews.map((r) => (
                  <div key={r._id} className="bg-surface border border-line rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar name={r.author?.name} src={r.author?.avatar} size="sm" />
                      <span className="text-sm font-semibold">{r.author?.name}</span>
                      <span className="inline-flex items-center gap-0.5 text-amber-500 text-xs ml-auto"><Star className="w-3.5 h-3.5 fill-amber-500" />{r.rating}</span>
                    </div>
                    {r.comment && <p className="text-sm text-ink-soft">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Card className="p-5 sticky top-24 space-y-3">
            <h3 className="font-display font-bold text-ink">Tickets</h3>
            {event.tickets.map((t) => (
              <div key={t._id} className="flex items-center justify-between border border-line rounded-xl p-3">
                <div>
                  <div className="font-semibold text-sm text-ink">{t.name}</div>
                  <div className="text-xs text-ink-soft">{t.capacity - t.booked} left</div>
                </div>
                <div className="font-display font-bold text-ink">{t.price === 0 ? 'Free' : fmtINR(t.price)}</div>
              </div>
            ))}
            <Button className="w-full" onClick={() => openBooking(event)}>Book Now</Button>
          </Card>
        </div>
      </div>

      {bookingEvent && <BookingModal event={bookingEvent} onClose={closeBooking} />}
    </div>
  );
}
