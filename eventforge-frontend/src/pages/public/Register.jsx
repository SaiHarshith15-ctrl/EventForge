import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { ROLES, DASHBOARD_HOME } from '../../utils/constants';

export default function Register() {
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('attendee');
  const [form, setForm] = useState({ name: '', email: '', password: '', city: 'Hyderabad' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      toast.success(`Welcome to EventForge, ${user.name.split(' ')[0]}!`);
      navigate(DASHBOARD_HOME[user.role] || '/app');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center px-5 py-12 bg-gradient-to-br from-paper via-paper to-violet-50">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-lift p-8">
        <div className="flex items-center gap-2 font-display font-bold text-lg text-ink mb-1">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 grid place-items-center text-white"><Ticket className="w-4 h-4" /></span>
          EventForge
        </div>

        {step === 0 ? (
          <>
            <h1 className="font-display font-bold text-2xl text-ink mt-4">How will you use EventForge?</h1>
            <p className="text-sm text-ink-soft mt-1">Pick a role — you can always be invited into others later.</p>
            <div className="grid sm:grid-cols-2 gap-2.5 mt-6">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-colors relative ${
                    role === r.value ? 'border-violet-500 bg-violet-50' : 'border-line hover:border-violet-200'
                  }`}
                >
                  {role === r.value && <Check className="w-4 h-4 text-violet-600 absolute top-3 right-3" />}
                  <div className="font-semibold text-sm text-ink">{r.label}</div>
                  <div className="text-xs text-ink-soft mt-0.5">{r.blurb}</div>
                </button>
              ))}
            </div>
            <Button className="w-full mt-6" icon={ArrowRight} onClick={() => setStep(1)}>Continue</Button>
          </>
        ) : (
          <motion.form initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} onSubmit={submit} className="space-y-4 mt-6">
            <h1 className="font-display font-bold text-2xl text-ink">Create your account</h1>
            <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Aarav Sharma" />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            <Input label="Password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Hyderabad" />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button type="submit" className="flex-1" loading={loading}>Create account</Button>
            </div>
          </motion.form>
        )}

        <p className="text-center text-sm text-ink-soft mt-6">
          Already have an account? <Link to="/login" className="text-violet-600 font-semibold hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
