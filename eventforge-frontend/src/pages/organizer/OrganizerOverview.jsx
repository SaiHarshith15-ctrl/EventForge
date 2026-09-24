import { useEffect, useState } from 'react';
import { Calendar, Users, Wallet, Award } from 'lucide-react';
import { analyticsApi } from '../../api/analytics.api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import MiniBarChart from '../../components/shared/MiniBarChart';

export default function OrganizerOverview() {
  const [data, setData] = useState(null);

  useEffect(() => { analyticsApi.organizer().then((r) => setData(r.data)).catch(() => setData({})); }, []);

  const chart = (data?.bookingsByDay || []).slice(-7).map((d) => ({ label: d._id.slice(5), value: d.count }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Organizer Overview</h1>
        <p className="text-ink-soft mt-1">Manage your events end to end.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Events" value={data?.totalEvents ?? 0} tone="violet" />
        <StatCard icon={Users} label="Registrations" value={data?.totalRegistrations ?? 0} tone="amber" trend={data?.totalRegistrations ? '+ live' : undefined} />
        <StatCard icon={Wallet} label="Revenue" value={data?.totalRevenue ?? 0} prefix="₹" tone="mint" />
        <StatCard icon={Award} label="Check-ins" value={data?.totalCheckIns ?? 0} tone="ink" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display font-bold text-ink mb-2">Registrations — last 7 days</h3>
          {chart.length > 0 ? <MiniBarChart data={chart} /> : <p className="text-sm text-ink-soft py-10 text-center">No bookings yet.</p>}
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-bold text-ink mb-4">Top events</h3>
          <div className="space-y-3">
            {(data?.topEvents || []).length === 0 && <p className="text-sm text-ink-soft">No events yet.</p>}
            {(data?.topEvents || []).map((e) => (
              <div key={e.id}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-ink truncate">{e.name}</span><span className="font-bold">{e.booked}/{e.capacity}</span></div>
                <div className="h-1.5 bg-violet-50 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-amber-400" style={{ width: `${(e.booked / (e.capacity || 1)) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
