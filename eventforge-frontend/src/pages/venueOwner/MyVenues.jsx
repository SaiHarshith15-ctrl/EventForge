import { useEffect, useState } from 'react';
import { Building2, Plus, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { venuesApi } from '../../api/venues.api';
import VenueCard from '../../components/shared/VenueCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { CITIES } from '../../utils/constants';

export default function MyVenues() {
  const [venues, setVenues] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', location: 'Hyderabad', capacity: 100, pricePerDay: 0, amenities: '' });

  const load = () => venuesApi.list({ mine: true, limit: 50 }).then((r) => setVenues(r.data)).catch(() => setVenues([]));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setSaving(true);
    try {
      await venuesApi.create({ ...form, amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean) });
      toast.success('Venue listed');
      setOpen(false);
      setForm({ name: '', location: 'Hyderabad', capacity: 100, pricePerDay: 0, amenities: '' });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Remove this venue listing?')) return;
    await venuesApi.remove(id);
    toast.success('Venue removed');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">My Venues</h1>
          <p className="text-ink-soft mt-1">Venues you've listed on EventForge.</p>
        </div>
        <Button icon={Plus} onClick={() => setOpen(true)}>List a Venue</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {venues === null ? null : venues.length === 0 ? (
          <div className="col-span-full"><EmptyState icon={Building2} title="No venues yet" subtitle="List your first venue to start receiving requests." action={<Button icon={Plus} onClick={() => setOpen(true)}>List a Venue</Button>} /></div>
        ) : (
          venues.map((v) => (
            <VenueCard
              key={v._id}
              venue={v}
              action={
                <button onClick={() => remove(v._id)} className="w-full mt-2 text-xs font-semibold text-red-500 inline-flex items-center justify-center gap-1 py-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Remove listing
                </button>
              }
            />
          ))
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="List a Venue">
        <div className="space-y-4">
          <Input label="Venue name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="The Grand Hall" />
          <Input label="City" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} list="cities" />
          <datalist id="cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Capacity" type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            <Input label="Price/day (₹)" type="number" min={0} value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: Number(e.target.value) })} />
          </div>
          <Textarea label="Amenities (comma separated)" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Parking, AV Setup, Catering" />
          <Button className="w-full" loading={saving} onClick={submit}>List venue</Button>
        </div>
      </Modal>
    </div>
  );
}
