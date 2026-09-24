import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Input, Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { speakersApi } from '../../api/speakers.api';

export default function SpeakerProfile() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ role: '', company: '', bio: '', expertise: '', availability: 'Available' });
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    speakersApi.list({ userId: user._id }).then((r) => {
      const mine = r.data?.[0];
      if (mine) {
        setForm({
          role: mine.role || '', company: mine.company || '', bio: mine.bio || '',
          expertise: (mine.expertise || []).join(', '), availability: mine.availability || 'Available',
        });
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await speakersApi.updateMe({ ...form, expertise: form.expertise.split(',').map((x) => x.trim()).filter(Boolean) });
      toast.success('Speaker profile saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) return null;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display font-bold text-2xl text-ink">Speaker Profile</h1>
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name} src={user?.avatar} size="xl" />
          <div>
            <div className="font-display font-bold text-lg text-ink">{user?.name}</div>
            <div className="text-sm text-ink-soft">{user?.email}</div>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Role / Title" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Senior ML Engineer" />
          <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Textarea label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A short bio organizers will see" />
          <Input label="Expertise (comma separated)" value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} placeholder="AI, Public Speaking, Product" />
          <Select label="Availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
            <option>Available</option>
            <option>Booked</option>
          </Select>
          <Button type="submit" loading={loading}>Save profile</Button>
        </form>
      </Card>
    </div>
  );
}
