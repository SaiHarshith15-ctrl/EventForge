import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center px-5 py-12">
      <div className="w-full max-w-sm bg-surface border border-line rounded-2xl shadow-lift p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 grid place-items-center mx-auto mb-4"><Mail className="w-5 h-5" /></div>
        <h1 className="font-display font-bold text-xl text-ink">Reset your password</h1>
        {sent ? (
          <p className="text-sm text-ink-soft mt-3">If that email exists, a reset link has been sent.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4 mt-5 text-left">
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
          </form>
        )}
        <Link to="/login" className="block text-sm font-semibold text-violet-600 mt-5 hover:underline">Back to login</Link>
      </div>
    </div>
  );
}
