import { useState } from 'react';
import toast from 'react-hot-toast';
import { Input, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { usersApi } from '../../api/users.api';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', city: user?.city || '', phone: user?.phone || '', bio: user?.bio || '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await usersApi.updateProfile(form);
      updateUser(res.data);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display font-bold text-2xl text-ink">Profile</h1>
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={user?.name} src={user?.avatar} size="xl" />
          <div>
            <div className="font-display font-bold text-lg text-ink">{user?.name}</div>
            <div className="text-sm text-ink-soft">{user?.email}</div>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Textarea label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <Button type="submit" loading={loading}>Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
