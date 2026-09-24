import { useEffect, useState } from 'react';
import { Users, Calendar, Building2, Wallet } from 'lucide-react';
import { analyticsApi } from '../../api/analytics.api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import MiniBarChart from '../../components/shared/MiniBarChart';

export default function AdminOverview() {
  const [data, setData] = useState(null);

  useEffect(() => { analyticsApi.admin().then((r) => setData(r.data)).catch(() => setData({})); }, []);

  const chart = (data?.signupsByDay || []).slice(-14).map((d) => ({ label: d._id.slice(5), value: d.count }));
  const byRole = data?.usersByRole || [];
  const maxRole = Math.max(...byRole.map((r) => r.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Admin Overview</h1>
        <p className="text-ink-soft mt-1">Platform-wide health at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={data?.totalUsers ?? 0} tone="violet" />
        <StatCard icon={Calendar} label="Total Events" value={data?.totalEvents ?? 0} tone="amber" />
        <StatCard icon={Building2} label="Total Venues" value={data?.totalVenues ?? 0} tone="mint" />
        <StatCard icon={Wallet} label="Platform Revenue" value={data?.totalRevenue ?? 0} prefix="₹" tone="ink" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display font-bold text-ink mb-2">Signups — last 14 days</h3>
          {chart.length > 0 ? <MiniBarChart data={chart} /> : <p className="text-sm text-ink-soft py-10 text-center">No signups yet.</p>}
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-bold text-ink mb-4">Users by role</h3>
          {byRole.length === 0 ? <p className="text-sm text-ink-soft">No user data yet.</p> : (
            <div className="space-y-3">
              {byRole.map((r) => (
                <div key={r._id}>
                  <div className="flex justify-between text-sm mb-1"><span className="font-medium text-ink capitalize">{r._id?.replace('_', ' ')}</span><span className="font-bold">{r.count}</span></div>
                  <div className="h-1.5 bg-violet-50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-amber-400" style={{ width: `${(r.count / maxRole) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
