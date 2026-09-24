import { useEffect, useState } from 'react';
import { Mic2, Search } from 'lucide-react';
import { speakersApi, speakerInvitesApi } from '../../api/speakers.api';
import SpeakerCard from '../../components/shared/SpeakerCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

export default function OrgSpeakers() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [speakers, setSpeakers] = useState(null);
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    speakersApi.list({ search: debounced || undefined, limit: 24 }).then((r) => setSpeakers(r.data)).catch(() => setSpeakers([]));
  }, [debounced]);

  const loadInvites = () => speakerInvitesApi.list().then((r) => setInvites(r.data)).catch(() => setInvites([]));
  useEffect(() => { loadInvites(); }, []);

  const invite = async (speakerId) => {
    try {
      await speakerInvitesApi.create({ speakerId, session: 'Keynote' });
      toast.success('Invitation sent');
      loadInvites();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">Speakers</h1>
        <p className="text-ink-soft mt-1">Find and invite speakers for your events.</p>
      </div>

      {invites.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-lg text-ink mb-3">Your invitations</h2>
          <div className="space-y-2">
            {invites.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between bg-surface border border-line rounded-xl p-3">
                <div>
                  <div className="font-semibold text-sm text-ink">{inv.speaker?.name}</div>
                  <div className="text-xs text-ink-soft">{inv.session}</div>
                </div>
                <Badge tone={inv.status === 'accepted' ? 'mint' : inv.status === 'declined' ? 'red' : 'amber'}>{inv.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-ink-faint absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search speakers by name or expertise..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-line focus:outline-none focus:ring-4 focus:ring-violet-100 focus:border-violet-400 text-sm"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {speakers === null ? null : speakers.length === 0 ? (
          <div className="col-span-full"><EmptyState icon={Mic2} title="No speakers found" subtitle="Try a different search." /></div>
        ) : (
          speakers.map((s) => (
            <SpeakerCard key={s._id} speaker={s} action={<Button size="sm" className="w-full" onClick={() => invite(s._id)}>Invite</Button>} />
          ))
        )}
      </div>
    </div>
  );
}
