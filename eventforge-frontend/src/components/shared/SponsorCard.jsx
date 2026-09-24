import { fmtINR } from '../../utils/format';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

const tierTone = { Gold: 'amber', Silver: 'neutral', Bronze: 'violet' };

export default function SponsorCard({ sponsor, action }) {
  return (
    <Card hover className="p-5">
      <Badge tone={tierTone[sponsor.tier] || 'neutral'}>{sponsor.tier}</Badge>
      <h3 className="font-display font-bold text-ink mt-3">{sponsor.name}</h3>
      <div className="font-display font-bold text-lg text-ink mt-1">{fmtINR(sponsor.budget)}</div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {(sponsor.benefits || []).slice(0, 3).map((b) => (
          <span key={b} className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-semibold">{b}</span>
        ))}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
