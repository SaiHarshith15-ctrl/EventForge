import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SuccessCheck from './SuccessCheck';
import { fireConfetti } from '../../utils/confetti';
import { fmtINR, fmtDate } from '../../utils/format';
import { bookingsApi } from '../../api/bookings.api';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Ticket', 'Quantity', 'Summary', 'Payment'];

export default function BookingModal({ event, onClose }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [ticketIdx, setTicketIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  if (!event) return null;

  if (!isAuthenticated) {
    return (
      <Modal open title="Sign in required" onClose={onClose}>
        <p className="text-sm text-ink-soft mb-5">Create a free account or sign in to book tickets for this event.</p>
        <Button className="w-full" onClick={() => { onClose(); navigate('/login'); }}>Go to login</Button>
      </Modal>
    );
  }

  const ticket = event.tickets[ticketIdx];
  const total = ticket ? ticket.price * qty : 0;

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.simulatePayment({ eventId: event._id, ticketTypeId: ticket._id, quantity: qty });
      setBooking(res.data);
      fireConfetti();
      setStep(4);
    } catch (err) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open title={step < 4 ? `Book "${event.name}"` : undefined} onClose={onClose} size={step === 4 ? 'sm' : 'md'}>
      {step < 4 && (
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-violet-500' : 'bg-violet-50'}`} />
              <div className="text-[10px] mt-1 text-ink-faint font-semibold">{label}</div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-2">
            {event.tickets.map((t, i) => (
              <button
                key={t._id}
                onClick={() => setTicketIdx(i)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex justify-between items-center ${
                  ticketIdx === i ? 'border-violet-500 bg-violet-50' : 'border-line hover:border-violet-200'
                }`}
              >
                <div>
                  <div className="font-semibold text-ink">{t.name}</div>
                  <div className="text-xs text-ink-soft">{t.capacity - t.booked} left</div>
                </div>
                <div className="font-display font-bold text-ink">{t.price === 0 ? 'Free' : fmtINR(t.price)}</div>
              </button>
            ))}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
            <p className="text-sm text-ink-soft mb-4">How many tickets?</p>
            <div className="flex items-center justify-center gap-6 mb-4">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 h-11 rounded-full border border-line grid place-items-center hover:border-violet-400">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-display font-bold text-3xl w-12 text-center">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(ticket.capacity - ticket.booked, q + 1))} className="w-11 h-11 rounded-full border border-line grid place-items-center hover:border-violet-400">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-violet-50 rounded-xl p-4 flex justify-between text-sm font-semibold">
              <span>{ticket.name} × {qty}</span>
              <span>{fmtINR(total)}</span>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-3">
            <div className="flex gap-3 items-center">
              <img src={event.coverImage} alt="" className="w-14 h-14 rounded-xl object-cover" />
              <div>
                <div className="font-semibold text-ink text-sm">{event.name}</div>
                <div className="text-xs text-ink-soft">{fmtDate(event.date)} · {event.location}</div>
              </div>
            </div>
            <div className="border border-line rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-ink-soft">Ticket type</span><span className="font-semibold">{ticket.name}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Quantity</span><span className="font-semibold">{qty}</span></div>
              <div className="flex justify-between pt-2 border-t border-line"><span className="font-bold">Total</span><span className="font-display font-bold text-lg">{fmtINR(total)}</span></div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="text-center space-y-4">
            <div className="bg-violet-50 rounded-2xl p-6">
              <p className="text-sm font-semibold text-ink mb-3">Scan to pay via UPI</p>
              <div className="bg-white p-3 rounded-xl inline-block">
                <QRCodeSVG value={`upi://pay?am=${total}&pn=EventForge`} size={140} />
              </div>
              <p className="text-xs text-ink-soft mt-3">Amount: {fmtINR(total)}</p>
            </div>
            <p className="text-[11px] text-ink-faint">This is a demo checkout — click below to simulate a successful payment.</p>
          </motion.div>
        )}

        {step === 4 && booking && (
          <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
            <SuccessCheck />
            <h3 className="font-display font-bold text-xl text-ink mt-4">Booking Confirmed!</h3>
            <p className="text-sm text-ink-soft mt-1">Your ticket has been generated.</p>
            <div className="mt-3 inline-block bg-mint-50 text-mint-600 text-xs font-bold px-3 py-1.5 rounded-full font-mono">
              {booking.bookingRef}
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
              <Button className="flex-1" onClick={() => { onClose(); navigate('/app/tickets'); }}>View Ticket</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 4 && (
        <div className="flex gap-2 mt-6">
          {step > 0 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < 3 ? (
            <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>Continue</Button>
          ) : (
            <Button className="flex-1" onClick={handlePay} loading={loading} icon={loading ? Loader2 : undefined}>
              Simulate Payment Success
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
