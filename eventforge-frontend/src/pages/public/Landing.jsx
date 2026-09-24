import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, PlusCircle, Sparkles, ArrowRight, Users, Building2, Mic2, Award,
  Calendar, Zap, Presentation, Music, Heart, Network, Briefcase, GraduationCap, LayoutGrid,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { EventCardSkeleton } from '../../components/ui/Skeleton';
import EventCard from '../../components/shared/EventCard';
import { eventsApi } from '../../api/events.api';
import { CATEGORIES } from '../../utils/constants';

const CATEGORY_ICONS = {
  Conference: Users, Hackathon: Zap, Workshop: Presentation, Exhibition: LayoutGrid,
  Concert: Music, Wedding: Heart, Networking: Network, Corporate: Briefcase,
  'College Event': GraduationCap, Other: Calendar,
};

const ROLE_CARDS = [
  { label: 'Attendees', desc: 'Discover and book events that fit your world.', icon: Users },
  { label: 'Organizers', desc: 'Plan, publish and run events end to end.', icon: Briefcase },
  { label: 'Venue Owners', desc: 'List your space and fill your calendar.', icon: Building2 },
  { label: 'Speakers', desc: 'Get invited, manage sessions, grow your reach.', icon: Mic2 },
  { label: 'Sponsors', desc: 'Find the right stage for your brand.', icon: Award },
];

const TICKET_STACK = [
  { tone: 'from-violet-500 to-violet-700', tilt: -8, label: 'AI Summit', sub: 'Hyderabad · Sep 20', top: '0%', left: '8%' },
  { tone: 'from-amber-500 to-amber-600', tilt: 6, label: 'Music Fest', sub: 'Hyderabad · Oct 18', top: '20%', left: '38%' },
  { tone: 'from-mint-500 to-mint-600', tilt: -3, label: 'AI Hackathon', sub: 'Bengaluru · Oct 5', top: '46%', left: '14%' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    eventsApi.list({ limit: 6, sort: '-createdAt' })
      .then((res) => setFeatured(res.data))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-paper">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="absolute top-40 right-0 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-5 pt-16 pb-24 lg:pt-24 lg:pb-32 relative grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI-assisted event discovery
            </motion.div>

            <h1 className="font-display font-bold text-ink text-[13vw] leading-[0.98] sm:text-6xl lg:text-[3.6rem] tracking-tight">
              {['Plan.', 'Discover.', 'Book.', 'Experience.'].map((word, i) => (
                <span key={word} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6, delay: 0.12 * i, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="text-ink-soft text-lg mt-6 max-w-md text-balance"
            >
              One intelligent platform connecting attendees, organizers, venues, speakers and sponsors — from first idea to sold-out night.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
              className="flex flex-wrap gap-3 mt-8"
            >
              <Button size="lg" icon={Search} onClick={() => navigate('/discover')}>Explore Events</Button>
              <Button size="lg" variant="outline" icon={PlusCircle} onClick={() => navigate('/register')}>Create an Event</Button>
            </motion.div>
          </div>

          <div className="relative h-[360px] hidden lg:block">
            {TICKET_STACK.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 40, rotate: 0, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, rotate: t.tilt, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="absolute w-64 animate-floaty"
                style={{ top: t.top, left: t.left, '--tilt': `${t.tilt}deg`, animationDelay: `${i * 0.4}s` }}
              >
                <div className={`rounded-2xl bg-gradient-to-br ${t.tone} text-white p-5 shadow-lift`}>
                  <div className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Live Event</div>
                  <div className="font-display font-bold text-lg mt-1">{t.label}</div>
                  <div className="text-xs opacity-80 mt-0.5">{t.sub}</div>
                  <div className="ticket-notch mt-4" style={{ '--notch-bg': '#F6F4FC', filter: 'brightness(1.3)' }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display font-bold text-3xl text-ink">Discover by category</h2>
          <Link to="/discover" className="text-sm font-semibold text-violet-600 inline-flex items-center gap-1 hover:gap-1.5 transition-all">
            Browse all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.filter((c) => c !== 'Other').map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Calendar;
            return (
              <button
                key={cat}
                onClick={() => navigate(`/discover?category=${encodeURIComponent(cat)}`)}
                className="group bg-surface border border-line rounded-2xl p-5 text-left hover:border-violet-300 hover:shadow-lift transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 grid place-items-center text-white mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-display font-bold text-sm text-ink">{cat}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="bg-ink text-white py-20">
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="font-display font-bold text-3xl mb-12">How EventForge works</h2>
          <div className="grid sm:grid-cols-5 gap-6">
            {[
              ['Discover', 'Find events that match your interests.'],
              ['Plan', 'Organizers build the full event.'],
              ['Connect', 'Speakers, venues, sponsors link up.'],
              ['Book', 'Attendees book in seconds.'],
              ['Attend', 'Check in and enjoy the event.'],
            ].map(([title, desc], i) => (
              <div key={title} className="relative">
                <div className="font-display font-bold text-4xl text-violet-400/50">{String(i + 1).padStart(2, '0')}</div>
                <div className="font-display font-bold mt-2">{title}</div>
                <div className="text-sm text-violet-200 mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="max-w-7xl mx-auto px-5 py-20">
        <h2 className="font-display font-bold text-3xl text-ink mb-10">Built for everyone in the room</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ROLE_CARDS.map((r) => (
            <motion.div
              key={r.label}
              whileHover={{ y: -4 }}
              onClick={() => navigate('/register')}
              className="cursor-pointer bg-surface border border-line rounded-2xl p-5 hover:border-violet-300 hover:shadow-lift transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 grid place-items-center mb-3">
                <r.icon className="w-5 h-5" />
              </div>
              <div className="font-display font-bold text-ink">{r.label}</div>
              <div className="text-xs text-ink-soft mt-1">{r.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-surface border-t border-line py-20">
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="font-display font-bold text-3xl text-ink mb-10">Featured events</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured === null
              ? Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)
              : featured.length === 0
              ? <p className="text-ink-soft col-span-full">No published events yet — be the first to create one.</p>
              : featured.map((ev, i) => <EventCard key={ev._id} event={ev} index={i} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
