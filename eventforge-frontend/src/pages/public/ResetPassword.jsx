import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password reset — please log in');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center px-5 py-12">
      <div className="w-full max-w-sm bg-surface border border-line rounded-2xl shadow-lift p-8">
        <h1 className="font-display font-bold text-xl text-ink mb-5">Set a new password</h1>
        <form onSubmit={submit} className="space-y-4">
          <Input label="New password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="w-full" loading={loading}>Reset password</Button>
        </form>
      </div>
    </div>
  );
}
