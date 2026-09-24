import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Plus, Trash2, Rocket, Ban, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { eventsApi } from '../../api/events.api';
import { venuesApi, venueRequestsApi } from '../../api/venues.api';
import { speakersApi, speakerInvitesApi } from '../../api/speakers.api';
import { bookingsApi } from '../../api/bookings.api';
import Tabs from '../../components/ui/Tabs';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import ProgressBar from '../../components/ui/ProgressBar';
import { fmtDate } from '../../utils/format';

const TABS = [
  { value: 'readiness', label: 'Readiness' },
  { value: 'venue', label: 'Venue' },
  { value: 'speakers', label: 'Speakers' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'attendees', label: 'Attendees' },
];

export default function EventManage() {
  const { id } = useParams();
  const [tab, setTab] = useState('readiness');
  const [event, setEvent] = useState(null);
  const [checklist, setChecklist] = useState([]);

  const load = () => {
    eventsApi.get(id).then((r) => setEvent(r.data));
    eventsApi.readiness(id).then((r) => setChecklist(r.data.checklist));
  };
  useEffect(() => { load(); }, [id]);

  if (!event) return <div className="grid place-items-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>;

  const publish = async () => {
    try {
      await eventsApi.publish(id);
      toast.success('Event published!');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const cancelEvent = async () => {
    if (!confirm('Cancel this event? All ticket holders will be notified.')) return;
    await eventsApi.cancel(id);
    toast.success('Event cancelled');
    load();
  };

  const readyCount = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">{event.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge tone={event.isPublished ? 'mint' : 'neutral'}>{event.status}</Badge>
            <span className="text-sm text-ink-soft">{fmtDate(event.date)} · {event.location}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!event.isPublished && event.status !== 'CANCELLED' && (
            <Button icon={Rocket} onClick={publish} disabled={readyCount < checklist.length}>Publish Event</Button>
          )}
          {event.status !== 'CANCELLED' && <Button icon={Ban} variant="danger" onClick={cancelEvent}>Cancel</Button>}
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'readiness' && <ReadinessTab checklist={checklist} />}
      {tab === 'venue' && <VenueTab event={event} reload={load} />}
      {tab === 'speakers' && <SpeakersTab event={event} reload={load} />}
      {tab === 'schedule' && <ScheduleTab event={event} reload={load} />}
      {tab === 'attendees' && <AttendeesTab eventId={id} />}
    </div>
  );
}

function ReadinessTab({ checklist }) {
  const done = checklist.filter((c) => c.done).length;
  return (
    <Card className="p-6 max-w-lg">
      <div className="flex justify-between text-sm font-semibold mb-2"><span>Readiness</span><span>{done}/{checklist.length}</span></div>
      <ProgressBar value={(done / (checklist.length || 1)) * 100} className="mb-5" />
      <div className="space-y-3">
        {checklist.map((c) => (
          <div key={c.label} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-md grid place-items-center shrink-0 ${c.done ? 'bg-mint-500 text-white' : 'bg-violet-50 text-transparent'}`}>
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className={c.done ? 'text-ink' : 'text-ink-soft'}>{c.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function VenueTab({ event, reload }) {
  const [venues, setVenues] = useState([]);
  useEffect(() => { venuesApi.list({ limit: 20 }).then((r) => setVenues(r.data)); }, []);

  const request = async (venueId) => {
    try {
      await venueRequestsApi.create({ venueId, eventId: event._id });
      toast.success('Venue requested — waiting for owner approval');
      reload();
    } catch (err) { toast.error(err.message); }
  };

  if (event.venueConfirmed) {
    return <Card className="p-6 max-w-md"><Badge tone="mint">Venue confirmed</Badge><div className="font-display font-bold text-lg mt-2">{event.venue?.name}</div></Card>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {venues.map((v) => (
        <Card key={v._id} className="p-4">
          <div className="font-semibold text-ink">{v.name}</div>
          <div className="text-xs text-ink-soft">{v.location} · {v.capacity} cap</div>
          <Button size="sm" className="w-full mt-3" onClick={() => request(v._id)}>Request Venue</Button>
        </Card>
      ))}
      {venues.length === 0 && <p className="text-sm text-ink-soft col-span-full">No venues listed yet.</p>}
    </div>
  );
}

function SpeakersTab({ event, reload }) {
  const [speakers, setSpeakers] = useState([]);
  useEffect(() => { speakersApi.list({ limit: 20 }).then((r) => setSpeakers(r.data)); }, []);

  const invite = async (speakerId) => {
    try {
      await speakerInvitesApi.create({ speakerId, eventId: event._id, session: event.schedule?.[0]?.title || 'Keynote' });
      toast.success('Invitation sent');
      reload();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {speakers.map((s) => {
        const invited = event.speakers?.some((es) => es._id === s._id);
        return (
          <Card key={s._id} className="p-4 text-center">
            <div className="font-semibold text-ink">{s.name}</div>
            <div className="text-xs text-ink-soft">{s.role} · {s.company}</div>
            <Button size="sm" className="w-full mt-3" disabled={invited} onClick={() => invite(s._id)}>{invited ? 'Invited' : 'Invite'}</Button>
          </Card>
        );
      })}
      {speakers.length === 0 && <p className="text-sm text-ink-soft col-span-full">No speakers registered yet.</p>}
    </div>
  );
}

function ScheduleTab({ event, reload }) {
  const [form, setForm] = useState({ time: '', title: '', speakerName: '', room: '' });

  const add = async () => {
    if (!form.time || !form.title) return toast.error('Time and title are required');
    await eventsApi.addSchedule(event._id, form);
    setForm({ time: '', title: '', speakerName: '', room: '' });
    toast.success('Session added');
    reload();
  };

  const remove = async (itemId) => {
    await eventsApi.removeSchedule(event._id, itemId);
    reload();
  };

  return (
    <div className="space-y-6 max-w-xl">
      <Card className="p-5 grid grid-cols-2 gap-3">
        <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Keynote" />
        <Input label="Speaker" value={form.speakerName} onChange={(e) => setForm({ ...form, speakerName: e.target.value })} />
        <Input label="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
        <Button size="sm" icon={Plus} className="col-span-2" onClick={add}>Add session</Button>
      </Card>
      <div className="space-y-2">
        {event.schedule?.map((s) => (
          <div key={s._id} className="flex items-center gap-3 bg-surface border border-line rounded-xl p-3">
            <span className="font-display font-bold text-violet-600 w-16">{s.time}</span>
            <div className="flex-1"><div className="font-semibold text-sm">{s.title}</div><div className="text-xs text-ink-soft">{s.speakerName} · {s.room}</div></div>
            <button onClick={() => remove(s._id)}><Trash2 className="w-4 h-4 text-ink-faint hover:text-red-500" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendeesTab({ eventId }) {
  const [bookings, setBookings] = useState(null);
  useEffect(() => { bookingsApi.eventBookings(eventId).then((r) => setBookings(r.data)).catch(() => setBookings([])); }, [eventId]);

  if (bookings === null) return null;
  if (bookings.length === 0) return <p className="text-sm text-ink-soft">No attendees yet.</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full text-sm">
        <thead className="bg-violet-50 text-ink-soft text-xs uppercase"><tr><th className="text-left p-3">Attendee</th><th className="text-left p-3">Ticket</th><th className="text-left p-3">Qty</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Status</th></tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id} className="border-t border-line">
              <td className="p-3">{b.attendee?.name}</td>
              <td className="p-3">{b.ticketTypeName}</td>
              <td className="p-3">{b.quantity}</td>
              <td className="p-3">₹{b.totalAmount}</td>
              <td className="p-3"><Badge tone={b.status === 'cancelled' ? 'red' : 'mint'}>{b.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
