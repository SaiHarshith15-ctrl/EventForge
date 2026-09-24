import { useEffect, useState } from 'react';
import { TrendingUp, Users, Wallet, Ticket } from 'lucide-react';
import { analyticsApi } from '../../api/analytics.api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import MiniBarChart from '../../components/shared/MiniBarChart';
import { fmtINR } from '../../utils/format';

export default function OrgAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => { analyticsApi.organizer().then((r) => setData(r.data)).catch(() => setData({})); }, []);

  const byDay = (data?.bookingsByDay || []).slice(-14).map((d) => ({ label: d._id.slice(5), value: d.count }));
  const byCategory = data?.revenueByCategory || [];
  const maxCat = Math.max(...byCategory.map((c) => c.revenue), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Analytics</h1>
        <p className="text-ink-soft mt-1">Deeper insight into how your events are performing.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Events" value={data?.totalEvents ?? 0} tone="violet" />
        <StatCard icon={Users} label="Registrations" value={data?.totalRegistrations ?? 0} tone="amber" />
        <StatCard icon={Wallet} label="Revenue" value={data?.totalRevenue ?? 0} prefix="₹" tone="mint" />
        <StatCard icon={Ticket} label="Avg. Ticket Price" value={data?.avgTicketPrice ?? 0} prefix="₹" tone="ink" />
      </div>

      <Card className="p-6">
        <h3 className="font-display font-bold text-ink mb-2">Registrations — last 14 days</h3>
        {byDay.length > 0 ? <MiniBarChart data={byDay} /> : <p className="text-sm text-ink-soft py-10 text-center">No data yet.</p>}
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-bold text-ink mb-4">Revenue by category</h3>
        {byCategory.length === 0 ? (
          <p className="text-sm text-ink-soft">No revenue data yet.</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map((c) => (
              <div key={c._id}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-ink">{c._id}</span><span className="font-bold">{fmtINR(c.revenue)}</span></div>
                <div className="h-1.5 bg-violet-50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-amber-400" style={{ width: `${(c.revenue / maxCat) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
