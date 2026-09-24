import { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '../../api/users.api';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { Select } from '../../components/ui/Input';
import { useDebounce } from '../../hooks/useDebounce';
import { ROLES } from '../../utils/constants';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const debounced = useDebounce(search);
  const [users, setUsers] = useState(null);

  const load = () => usersApi.list({ search: debounced || undefined, role: role !== 'all' ? role : undefined, limit: 100 })
    .then((r) => setUsers(r.data)).catch(() => setUsers([]));
  useEffect(() => { load(); }, [debounced, role]);

  const toggleSuspend = async (u) => {
    try {
      await usersApi.toggleSuspend(u._id);
      toast.success(u.suspended ? 'User reinstated' : 'User suspended');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const changeRole = async (u, newRole) => {
    try {
      await usersApi.changeRole(u._id, newRole);
      toast.success('Role updated');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const remove = async (u) => {
    if (!confirm(`Delete ${u.name}'s account? This cannot be undone.`)) return;
    try {
      await usersApi.remove(u._id);
      toast.success('User deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Users</h1>
        <p className="text-ink-soft mt-1">Manage every account on the platform.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-ink-faint absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-line focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 text-sm"
          />
        </div>
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-auto">
          <option value="all">All Roles</option>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </Select>
      </div>

      {users === null ? null : users.length === 0 ? (
        <EmptyState icon={Search} title="No users found" subtitle="Try a different search or filter." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-violet-50 text-ink-soft text-xs uppercase">
              <tr><th className="text-left p-3">User</th><th className="text-left p-3">Role</th><th className="text-left p-3">Status</th><th className="text-left p-3">Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-line">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} src={u.avatar} size="sm" />
                      <div><div className="font-semibold text-ink">{u.name}</div><div className="text-xs text-ink-soft">{u.email}</div></div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Select value={u.role} onChange={(e) => changeRole(u, e.target.value)} className="text-xs py-1.5">
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </Select>
                  </td>
                  <td className="p-3"><Badge tone={u.suspended ? 'red' : 'mint'}>{u.suspended ? 'Suspended' : 'Active'}</Badge></td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSuspend(u)} title={u.suspended ? 'Reinstate' : 'Suspend'} className="text-ink-faint hover:text-amber-600">
                        {u.suspended ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                      <button onClick={() => remove(u)} title="Delete" className="text-ink-faint hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
