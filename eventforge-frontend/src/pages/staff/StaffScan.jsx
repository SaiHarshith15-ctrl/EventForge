import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, Check, X, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import { checkinsApi } from '../../api/checkins.api';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SuccessCheck from '../../components/shared/SuccessCheck';

export default function StaffScan() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);

  const scan = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await checkinsApi.scan({ bookingRef: code.trim() });
      setResult({ ok: true, booking: res.data });
      setLog((l) => [{ ok: true, name: res.data.attendeeName || res.data.attendee?.name, time: new Date() }, ...l].slice(0, 10));
      toast.success('Checked in successfully');
    } catch (err) {
      setResult({ ok: false, message: err.message });
      setLog((l) => [{ ok: false, name: code.trim(), time: new Date() }, ...l].slice(0, 10));
      toast.error(err.message);
    } finally {
      setLoading(false);
      setCode('');
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-ink">QR Check-In</h1>
        <p className="text-ink-soft mt-1">Scan or type a booking reference to check attendees in.</p>
      </div>

      <Card className="p-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 grid place-items-center mx-auto mb-4">
          <ScanLine className="w-7 h-7" />
        </div>
        <form onSubmit={scan} className="flex gap-2">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter booking reference (e.g. EF-XXXXXX)" className="flex-1" />
          <Button type="submit" loading={loading}>Check In</Button>
        </form>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.ok ? 'ok' : 'fail'}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center mt-6"
            >
              {result.ok ? (
                <>
                  <SuccessCheck size={56} />
                  <div className="font-display font-bold text-lg text-ink mt-3">{result.booking.attendeeName || result.booking.attendee?.name}</div>
                  <div className="text-sm text-ink-soft">{result.booking.ticketTypeName}</div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 grid place-items-center mx-auto"><X className="w-7 h-7" /></div>
                  <div className="font-semibold text-red-500 mt-3">{result.message}</div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {log.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-ink mb-3">Recent scans</h3>
          <div className="space-y-2">
            {log.map((l, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface border border-line rounded-xl p-3 text-sm">
                <div className={`w-7 h-7 rounded-full grid place-items-center shrink-0 ${l.ok ? 'bg-mint-50 text-mint-600' : 'bg-red-50 text-red-500'}`}>
                  {l.ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                </div>
                <span className="flex-1 truncate">{l.name}</span>
                <span className="text-xs text-ink-faint">{l.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
