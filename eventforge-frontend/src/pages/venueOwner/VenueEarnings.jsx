import { useEffect, useState } from 'react';
import { Wallet, TrendingUp } from 'lucide-react';
import { analyticsApi } from '../../api/analytics.api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import MiniBarChart from '../../components/shared/MiniBarChart';
import { fmtINR } from '../../utils/format';

export default function VenueEarnings() {
  const [data, setData] = useState(null);

  useEffect(() => { analyticsApi.venueOwner().then((r) => setData(r.data)).catch(() => setData({})); }, []);

  const chart = (data?.earningsByMonth || []).slice(-6).map((d) => ({ label: d._id.slice(5), value: d.total }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Earnings</h1>
        <p className="text-ink-soft mt-1">Revenue from confirmed venue bookings.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <StatCard icon={Wallet} label="Total Earnings" value={data?.totalEarnings ?? 0} prefix="₹" tone="mint" />
        <StatCard icon={TrendingUp} label="Confirmed Bookings" value={data?.confirmedBookings ?? 0} tone="violet" />
      </div>

      <Card className="p-6">
        <h3 className="font-display font-bold text-ink mb-2">Earnings — last 6 months</h3>
        {chart.length > 0 ? <MiniBarChart data={chart} formatValue={(v) => fmtINR(v)} /> : <p className="text-sm text-ink-soft py-10 text-center">No earnings yet.</p>}
      </Card>
    </div>
  );
}
