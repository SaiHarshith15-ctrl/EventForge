import { useEffect, useState } from 'react';
import { TrendingUp, Users, Wallet, Calendar } from 'lucide-react';
import { analyticsApi } from '../../api/analytics.api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import MiniBarChart from '../../components/shared/MiniBarChart';
import { fmtINR } from '../../utils/format';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => { analyticsApi.admin().then((r) => setData(r.data)).catch(() => setData({})); }, []);

  const revenueByMonth = (data?.revenueByMonth || []).slice(-6).map((d) => ({ label: d._id.slice(5), value: d.total }));
  const byCategory = data?.eventsByCategory || [];
  const maxCat = Math.max(...byCategory.map((c) => c.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Reports</h1>
        <p className="text-ink-soft mt-1">Platform-wide analytics for leadership.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={data?.totalUsers ?? 0} tone="violet" />
        <StatCard icon={Calendar} label="Total Events" value={data?.totalEvents ?? 0} tone="amber" />
        <StatCard icon={Wallet} label="Platform Revenue" value={data?.totalRevenue ?? 0} prefix="₹" tone="mint" />
        <StatCard icon={TrendingUp} label="Avg. Booking Value" value={data?.avgBookingValue ?? 0} prefix="₹" tone="ink" />
      </div>

      <Card className="p-6">
        <h3 className="font-display font-bold text-ink mb-2">Revenue — last 6 months</h3>
        {revenueByMonth.length > 0 ? <MiniBarChart data={revenueByMonth} formatValue={(v) => fmtINR(v)} /> : <p className="text-sm text-ink-soft py-10 text-center">No revenue data yet.</p>}
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-bold text-ink mb-4">Events by category</h3>
        {byCategory.length === 0 ? <p className="text-sm text-ink-soft">No category data yet.</p> : (
          <div className="space-y-3">
            {byCategory.map((c) => (
              <div key={c._id}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-ink">{c._id}</span><span className="font-bold">{c.count}</span></div>
                <div className="h-1.5 bg-violet-50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-amber-400" style={{ width: `${(c.count / maxCat) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
