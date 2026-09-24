import { useEffect, useState } from 'react';
import { Building2, Wallet, CalendarCheck, Bell } from 'lucide-react';
import { analyticsApi } from '../../api/analytics.api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import MiniBarChart from '../../components/shared/MiniBarChart';

export default function VenueOverview() {
  const [data, setData] = useState(null);

  useEffect(() => { analyticsApi.venueOwner().then((r) => setData(r.data)).catch(() => setData({})); }, []);

  const chart = (data?.bookingsByMonth || []).slice(-6).map((d) => ({ label: d._id.slice(5), value: d.count }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Venue Overview</h1>
        <p className="text-ink-soft mt-1">Track how your listed venues are performing.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Listed Venues" value={data?.totalVenues ?? 0} tone="violet" />
        <StatCard icon={CalendarCheck} label="Confirmed Bookings" value={data?.confirmedBookings ?? 0} tone="mint" />
        <StatCard icon={Bell} label="Pending Requests" value={data?.pendingRequests ?? 0} tone="amber" />
        <StatCard icon={Wallet} label="Earnings" value={data?.totalEarnings ?? 0} prefix="₹" tone="ink" />
      </div>

      <Card className="p-6">
        <h3 className="font-display font-bold text-ink mb-2">Bookings — last 6 months</h3>
        {chart.length > 0 ? <MiniBarChart data={chart} /> : <p className="text-sm text-ink-soft py-10 text-center">No bookings yet.</p>}
      </Card>
    </div>
  );
}
