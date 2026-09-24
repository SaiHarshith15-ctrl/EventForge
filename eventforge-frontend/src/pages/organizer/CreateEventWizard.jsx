import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { eventsApi } from '../../api/events.api';
import { CATEGORIES } from '../../utils/constants';

export default function CreateEventWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', category: 'Conference', description: '', date: '', time: '09:00', location: 'Hyderabad',
    tickets: [{ name: 'General', price: 0, capacity: 100 }],
  });

  const updateTicket = (i, patch) => {
    const tickets = [...form.tickets];
    tickets[i] = { ...tickets[i], ...patch };
    setForm({ ...form, tickets });
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await eventsApi.create(form);
      toast.success('Event draft created — now build it out.');
      navigate(`/app/manage-event/${res.data._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Details', 'Tickets', 'Review'];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Create Event</h1>
        <p className="text-ink-soft mt-1">Start with the basics — you'll add venue, speakers and schedule next.</p>
      </div>

      <div className="flex gap-1.5">
        {steps.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-violet-500' : 'bg-violet-50'}`} />
            <div className="text-[11px] mt-1 font-semibold text-ink-faint">{label}</div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
            <Input label="Event name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="AI & Future Tech Summit" />
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your event..." />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            <Input label="Location / City" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-3">
            {form.tickets.map((t, i) => (
              <div key={i} className="border border-line rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Ticket name" value={t.name} onChange={(e) => updateTicket(i, { name: e.target.value })} />
                  <Input label="Price (₹)" type="number" min={0} value={t.price} onChange={(e) => updateTicket(i, { price: Number(e.target.value) })} />
                </div>
                <Input label="Capacity" type="number" min={1} value={t.capacity} onChange={(e) => updateTicket(i, { capacity: Number(e.target.value) })} />
                {form.tickets.length > 1 && (
                  <button onClick={() => setForm({ ...form, tickets: form.tickets.filter((_, x) => x !== i) })} className="text-xs text-red-500 font-semibold inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" icon={Plus} onClick={() => setForm({ ...form, tickets: [...form.tickets, { name: 'New', price: 0, capacity: 100 }] })}>
              Add ticket type
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="border border-line rounded-xl p-5 space-y-2 text-sm">
            <div className="font-display font-bold text-lg text-ink mb-2">{form.name || 'Untitled event'}</div>
            <div className="text-ink-soft">{form.category} · {form.location}</div>
            <div className="text-ink-soft">{form.date} at {form.time}</div>
            <div className="pt-2 border-t border-line mt-2">
              {form.tickets.map((t, i) => (
                <div key={i} className="flex justify-between"><span>{t.name}</span><span className="font-semibold">{t.price === 0 ? 'Free' : `₹${t.price}`} × {t.capacity}</span></div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        {step > 0 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
        {step < 2 ? (
          <Button className="flex-1" onClick={() => setStep((s) => s + 1)} disabled={step === 0 && (!form.name || !form.date)}>Continue</Button>
        ) : (
          <Button className="flex-1" loading={loading} onClick={submit}>Create draft</Button>
        )}
      </div>
    </div>
  );
}
