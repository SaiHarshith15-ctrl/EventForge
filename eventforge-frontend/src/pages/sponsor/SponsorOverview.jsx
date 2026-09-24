import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Wallet, Bell, CalendarCheck, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsApi } from '../../api/analytics.api';
import { sponsorsApi } from '../../api/sponsors.api';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';

export default function SponsorOverview() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', tier: 'Silver', budget: 0, benefits: '' });

  useEffect(() => { analyticsApi.sponsor().then((r) => setData(r.data)).catch(() => setData({})); }, []);
  useEffect(() => {
    sponsorsApi.list({ userId: user._id }).then((r) => {
      const mine = r.data?.[0];
      if (mine) setForm({ name: mine.name || '', tier: mine.tier || 'Silver', budget: mine.budget || 0, benefits: (mine.benefits || []).join(', ') });
    }).catch(() => {});
  }, []);

  const submit = async () => {
    setSaving(true);
    try {
      await sponsorsApi.updateMe({ ...form, benefits: form.benefits.split(',').map((b) => b.trim()).filter(Boolean) });
      toast.success('Sponsor profile saved');
      setOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Sponsor Overview</h1>
          <p className="text-ink-soft mt-1">Manage your brand's presence across events.</p>
        </div>
        <Button variant="outline" icon={Pencil} onClick={() => setOpen(true)}>Edit sponsor profile</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Award} label="Active Sponsorships" value={data?.activeSponsorships ?? 0} tone="violet" />
        <StatCard icon={Bell} label="Pending Requests" value={data?.pendingRequests ?? 0} tone="amber" />
        <StatCard icon={CalendarCheck} label="Events Reached" value={data?.eventsReached ?? 0} tone="mint" />
        <StatCard icon={Wallet} label="Total Committed" value={data?.totalCommitted ?? 0} prefix="₹" tone="ink" />
      </div>

      <Card className="p-6">
        <h3 className="font-display font-bold text-ink mb-3">Your sponsor profile</h3>
        <div className="text-sm text-ink-soft">
          {form.name ? (
            <>
              <div><span className="font-semibold text-ink">{form.name}</span> · {form.tier} tier</div>
              <div className="mt-1">Budget: ₹{form.budget?.toLocaleString('en-IN')}</div>
            </>
          ) : (
            'You haven\'t set up your sponsor profile yet — organizers can\'t discover you until you do.'
          )}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Sponsor Profile">
        <div className="space-y-4">
          <Input label="Brand / Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Tier" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
            <option>Gold</option><option>Silver</option><option>Bronze</option>
          </Select>
          <Input label="Budget (₹)" type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} />
          <Textarea label="Benefits offered (comma separated)" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} placeholder="Logo placement, Booth, Keynote mention" />
          <Button className="w-full" loading={saving} onClick={submit}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
