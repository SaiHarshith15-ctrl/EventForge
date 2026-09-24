import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

export default function SpeakerCard({ speaker, action }) {
  return (
    <Card hover className="p-5 text-center">
      <Avatar src={speaker.avatar} name={speaker.name} size="lg" className="mx-auto" />
      <h3 className="font-display font-bold text-ink mt-3">{speaker.name}</h3>
      <p className="text-xs text-ink-soft">{speaker.role} {speaker.company && `· ${speaker.company}`}</p>
      <div className="flex flex-wrap gap-1.5 justify-center mt-3">
        {(speaker.expertise || []).slice(0, 3).map((e) => (
          <span key={e} className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-semibold">{e}</span>
        ))}
      </div>
      <div className="mt-3">
        <Badge tone={speaker.availability === 'Available' ? 'mint' : 'amber'}>{speaker.availability}</Badge>
      </div>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
