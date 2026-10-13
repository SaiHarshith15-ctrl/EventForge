import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Plus, Trash2, Rocket, Ban, Loader2, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsApi } from '../../api/events.api';
import { venuesApi, venueRequestsApi } from '../../api/venues.api';
import { speakersApi, speakerInvitesApi } from '../../api/speakers.api';
import { sponsorsApi } from '../../api/sponsors.api';
import { bookingsApi } from '../../api/bookings.api';
import Tabs from '../../components/ui/Tabs';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Input';
import ProgressBar from '../../components/ui/ProgressBar';
import SafeImage from '../../components/shared/SafeImage';
import { fmtDate } from '../../utils/format';

const TABS = [
  { value: 'readiness', label: 'Readiness' },
  { value: 'venue', label: 'Venue' },
  { value: 'speakers', label: 'Speakers' },
  { value: 'sponsors', label: 'Sponsors' },
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
      <CoverBar event={event} reload={load} />

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
      {tab === 'sponsors' && <SponsorsTab event={event} reload={load} />}
      {tab === 'schedule' && <ScheduleTab event={event} reload={load} />}
      {tab === 'attendees' && <AttendeesTab eventId={id} />}
    </div>
  );
}

function CoverBar({ event, reload }) {
  const [busy, setBusy] = useState(false);
  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await eventsApi.uploadCover(event._id, file);
      toast.success('Cover updated');
      reload();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); e.target.value = ''; }
  };
  return (
    <div className="relative h-44 sm:h-56 rounded-2xl overflow-hidden border border-line">
      <SafeImage src={event.coverImage} kind="event" alt={event.name} className="w-full h-full object-cover" />
      <label className="absolute bottom-3 right-3 cursor-pointer inline-flex items-center gap-2 bg-white/95 text-ink text-xs font-semibold px-3 py-2 rounded-xl shadow">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        {busy ? 'Uploading...' : 'Change cover'}
        <input type="file" accept="image/*" className="hidden" onChange={onPick} disabled={busy} />
      </label>
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
  useEffect(() => { venuesApi.list({ limit: 20 }).then((r) => setVenues(r.data)).catch(() => setVenues([])); }, []);

  const request = async (venueId) => {
    try {
      await venueRequestsApi.create({ venueId, eventId: event._id });
      toast.success('Venue requested — waiting for owner approval');
      reload();
    } catch (err) { toast.error(err.message); }
  };

  if (event.venueConfirmed) {
    return (
      <Card className="p-6 max-w-md">
        <Badge tone="mint">Venue confirmed</Badge>
        <div className="font-display font-bold text-lg mt-2">{event.venue?.name}</div>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {venues.map((v) => (
        <Card key={v._id} className="p-0 overflow-hidden">
          <SafeImage src={v.coverImage || v.images?.[0]} kind="venue" alt={v.name} className="w-full h-32 object-cover" />
          <div className="p-4">
            <div className="font-semibold text-ink">{v.name}</div>
            <div className="text-xs text-ink-soft">{v.location} · {v.capacity} cap · ₹{v.pricePerDay}/day</div>
            <Button size="sm" className="w-full mt-3" onClick={() => request(v._id)}>Request Venue</Button>
          </div>
        </Card>
      ))}
      {venues.length === 0 && <p className="text-sm text-ink-soft col-span-full">No venues listed yet. Log in as a venue owner and list one.</p>}
    </div>
  );
}

function SpeakersTab({ event, reload }) {
  const [all, setAll] = useState([]);
  const [form, setForm] = useState({ name: '', role: '', company: '' });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadAll = () => speakersApi.list({ limit: 50 }).then((r) => setAll(r.data)).catch(() => setAll([]));
  useEffect(() => { loadAll(); }, []);

  const isAdded = (id) => event.speakers?.some((s) => (s._id || s) === id);

  const addExisting = async (id) => {
    try { await eventsApi.addSpeaker(event._id, id); toast.success('Speaker added'); reload(); }
    catch (err) { toast.error(err.message); }
  };
  const removeFromEvent = async (id) => {
    try { await eventsApi.removeSpeaker(event._id, id); toast.success('Speaker removed'); reload(); }
    catch (err) { toast.error(err.message); }
  };
  const invite = async (speakerId) => {
    try {
      await speakerInvitesApi.create({ speakerId, eventId: event._id, session: event.schedule?.[0]?.title || 'Keynote' });
      toast.success('Invitation sent');
    } catch (err) { toast.error(err.message); }
  };

  const createAndAdd = async () => {
    if (!form.name.trim()) return toast.error('Speaker name is required');
    setBusy(true);
    try {
      const res = await speakersApi.create(form);
      const sp = res.data;
      if (file) {
        try { await speakersApi.uploadPhoto(sp._id, file); }
        catch (e) { toast.error('Speaker saved, photo failed: ' + e.message); }
      }
      await eventsApi.addSpeaker(event._id, sp._id);
      toast.success('Speaker added to event');
      setForm({ name: '', role: '', company: '' });
      setFile(null);
      loadAll();
      reload();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-8">
      <Card className="p-5 max-w-2xl">
        <h3 className="font-display font-bold text-ink mb-3">Add a new speaker</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="AI Engineer" />
          <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
          <Button size="sm" icon={Plus} loading={busy} onClick={createAndAdd}>Add to event</Button>
        </div>
      </Card>

      <div>
        <h3 className="font-display font-bold text-ink mb-3">On this event ({event.speakers?.length || 0})</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(event.speakers || []).map((s) => (
            <Card key={s._id} className="p-4 text-center">
              <SafeImage src={s.avatar} kind="avatar" alt={s.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
              <div className="font-semibold text-ink">{s.name}</div>
              <div className="text-xs text-ink-soft">{s.role} {s.company && `· ${s.company}`}</div>
              <button onClick={() => removeFromEvent(s._id)} className="mt-2 text-xs text-red-500 font-semibold inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
            </Card>
          ))}
          {(event.speakers || []).length === 0 && <p className="text-sm text-ink-soft col-span-full">No speakers added yet.</p>}
        </div>
      </div>

      <div>
        <h3 className="font-display font-bold text-ink mb-3">All speakers</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {all.map((s) => (
            <Card key={s._id} className="p-4 text-center">
              <SafeImage src={s.avatar} kind="avatar" alt={s.name} className="w-14 h-14 rounded-full object-cover mx-auto mb-2" />
              <div className="font-semibold text-ink">{s.name}</div>
              <div className="text-xs text-ink-soft">{s.role} {s.company && `· ${s.company}`}</div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1" disabled={isAdded(s._id)} onClick={() => addExisting(s._id)}>{isAdded(s._id) ? 'Added' : 'Add'}</Button>
                {s.user && !isAdded(s._id) && <Button size="sm" variant="outline" className="flex-1" onClick={() => invite(s._id)}>Invite</Button>}
              </div>
            </Card>
          ))}
          {all.length === 0 && <p className="text-sm text-ink-soft col-span-full">No speakers yet.</p>}
        </div>
      </div>
    </div>
  );
}

function SponsorsTab({ event, reload }) {
  const [all, setAll] = useState([]);
  const [form, setForm] = useState({ name: '', tier: 'Gold', budget: 0 });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadAll = () => sponsorsApi.list({ limit: 50 }).then((r) => setAll(r.data)).catch(() => setAll([]));
  useEffect(() => { loadAll(); }, []);

  const isAdded = (id) => event.sponsors?.some((s) => (s.sponsor?._id || s.sponsor) === id);

  const addExisting = async (sp) => {
    try { await eventsApi.addSponsor(event._id, sp._id, sp.tier); toast.success('Sponsor added'); reload(); }
    catch (err) { toast.error(err.message); }
  };
  const removeFromEvent = async (id) => {
    try { await eventsApi.removeSponsor(event._id, id); toast.success('Sponsor removed'); reload(); }
    catch (err) { toast.error(err.message); }
  };

  const createAndAdd = async () => {
    if (!form.name.trim()) return toast.error('Sponsor name is required');
    setBusy(true);
    try {
      const res = await sponsorsApi.create(form);
      const sp = res.data;
      if (file) {
        try { await sponsorsApi.uploadLogo(sp._id, file); }
        catch (e) { toast.error('Sponsor saved, logo failed: ' + e.message); }
      }
      await eventsApi.addSponsor(event._id, sp._id, form.tier);
      toast.success('Sponsor added to event');
      setForm({ name: '', tier: 'Gold', budget: 0 });
      setFile(null);
      loadAll();
      reload();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-8">
      <Card className="p-5 max-w-2xl">
        <h3 className="font-display font-bold text-ink mb-3">Add a new sponsor</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input label="Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Tier" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
            {['Gold', 'Silver', 'Bronze'].map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Input label="Budget (₹)" type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
          <Button size="sm" icon={Plus} loading={busy} onClick={createAndAdd}>Add to event</Button>
        </div>
      </Card>

      <div>
        <h3 className="font-display font-bold text-ink mb-3">On this event ({event.sponsors?.length || 0})</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(event.sponsors || []).map((s) => (
            <Card key={s.sponsor?._id || s._id} className="p-4 text-center">
              <SafeImage src={s.sponsor?.logo} kind="logo" alt={s.sponsor?.name} className="w-full h-20 object-cover rounded-lg mb-2" />
              <div className="font-semibold text-ink">{s.sponsor?.name}</div>
              <Badge tone="amber">{s.tier}</Badge>
              <div>
                <button onClick={() => removeFromEvent(s.sponsor?._id)} className="mt-2 text-xs text-red-500 font-semibold inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
              </div>
            </Card>
          ))}
          {(event.sponsors || []).length === 0 && <p className="text-sm text-ink-soft col-span-full">No sponsors added yet.</p>}
        </div>
      </div>

      <div>
        <h3 className="font-display font-bold text-ink mb-3">All sponsors</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {all.map((s) => (
            <Card key={s._id} className="p-4 text-center">
              <SafeImage src={s.logo} kind="logo" alt={s.name} className="w-full h-16 object-cover rounded-lg mb-2" />
              <div className="font-semibold text-ink">{s.name}</div>
              <div className="text-xs text-ink-soft">{s.tier}</div>
              <Button size="sm" className="w-full mt-3" disabled={isAdded(s._id)} onClick={() => addExisting(s)}>{isAdded(s._id) ? 'Added' : 'Add'}</Button>
            </Card>
          ))}
          {all.length === 0 && <p className="text-sm text-ink-soft col-span-full">No sponsors yet.</p>}
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({ event, reload }) {
  const [form, setForm] = useState({ time: '', title: '', speakerName: '', room: '' });

  const add = async () => {
    if (!form.time || !form.title) return toast.error('Time and title are required');
    try {
      await eventsApi.addSchedule(event._id, form);
      setForm({ time: '', title: '', speakerName: '', room: '' });
      toast.success('Session added');
      reload();
    } catch (err) { toast.error(err.message); }
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