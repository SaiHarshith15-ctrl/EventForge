import { useEffect, useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsApi } from '../../api/events.api';
import { announcementsApi } from '../../api/announcements.api';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Select, Textarea } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';

export default function OrgAnnouncements() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    eventsApi.list({ organizer: user._id, includeUnpublished: true, limit: 50 }).then((r) => {
      setEvents(r.data);
      if (r.data.length) setEventId(r.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!eventId) return;
    announcementsApi.forEvent(eventId).then((r) => setHistory(r.data)).catch(() => setHistory([]));
  }, [eventId]);

  const send = async () => {
    if (!message.trim()) return toast.error('Write a message first');
    setSending(true);
    try {
      await announcementsApi.create({ eventId, message });
      toast.success('Announcement sent to all attendees');
      setMessage('');
      announcementsApi.forEvent(eventId).then((r) => setHistory(r.data));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Announcements</h1>
        <p className="text-ink-soft mt-1">Notify every attendee of an event in one message.</p>
      </div>

      {events.length === 0 ? (
        <EmptyState icon={Megaphone} title="No events yet" subtitle="Create an event first to send announcements." />
      ) : (
        <>
          <Card className="p-5 space-y-4">
            <Select label="Event" value={eventId} onChange={(e) => setEventId(e.target.value)}>
              {events.map((ev) => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
            </Select>
            <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Venue update: we've moved to Hall B" />
            <Button icon={Send} loading={sending} onClick={send}>Send to all attendees</Button>
          </Card>

          <div>
            <h2 className="font-display font-bold text-lg text-ink mb-3">History</h2>
            {history === null ? null : history.length === 0 ? (
              <p className="text-sm text-ink-soft">No announcements sent for this event yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map((a) => (
                  <div key={a._id} className="bg-surface border border-line rounded-xl p-3 text-sm">
                    <div className="text-ink">{a.message}</div>
                    <div className="text-[11px] text-ink-faint mt-1">{new Date(a.createdAt).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
