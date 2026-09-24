import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { DASHBOARD_HOME } from '../../utils/constants';

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(location.state?.from || DASHBOARD_HOME[user.role] || '/app');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center px-5 py-12 bg-gradient-to-br from-paper via-paper to-violet-50">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-surface border border-line rounded-2xl shadow-lift p-8">
        <div className="flex items-center gap-2 font-display font-bold text-lg text-ink mb-1">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 grid place-items-center text-white"><Ticket className="w-4 h-4" /></span>
          EventForge
        </div>
        <h1 className="font-display font-bold text-2xl text-ink mt-4">Welcome back</h1>
        <p className="text-sm text-ink-soft mt-1">Sign in to continue to your dashboard.</p>

        <form onSubmit={submit} className="space-y-4 mt-6">
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-semibold text-violet-600 hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" className="w-full" icon={LogIn} loading={loading}>Login</Button>
        </form>

        <p className="text-center text-sm text-ink-soft mt-6">
          Don't have an account? <Link to="/register" className="text-violet-600 font-semibold hover:underline">Sign up</Link>
        </p>

        <div className="mt-6 pt-6 border-t border-line text-[11px] text-ink-faint text-center">
          Demo logins (after seeding the backend) — password <b>demo123</b>:<br />
          attendee@demo.com · organizer@demo.com · venue@demo.com · speaker@demo.com · sponsor@demo.com · staff@demo.com · admin@demo.com
        </div>
      </motion.div>
    </div>
  );
}
