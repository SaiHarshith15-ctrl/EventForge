import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SuccessCheck from './SuccessCheck';
import { fireConfetti } from '../../utils/confetti';
import { fmtINR, fmtDate } from '../../utils/format';
import { bookingsApi } from '../../api/bookings.api';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Ticket', 'Quantity', 'Summary'];

export default function BookingModal({ event, onClose }) {
  const { isAuthenticated, user } = useAuthStore();
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

  const finishAsSimulated = async () => {
    try {
      const res = await bookingsApi.simulatePayment({ eventId: event._id, ticketTypeId: ticket._id, quantity: qty });
      setBooking(res.data);
      fireConfetti();
      setStep(3);
    } catch (err) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      // 1. Ask backend to create an order. Backend decides: free ticket, no Razorpay
      // configured (dev/demo), or a real Razorpay order.
      const orderRes = await bookingsApi.createOrder({ eventId: event._id, ticketTypeId: ticket._id, quantity: qty });
      const data = orderRes.data;

      if (data.free || data.simulated) {
        await finishAsSimulated();
        return;
      }

      if (!window.Razorpay) {
        toast.error('Payment widget failed to load. Check your connection and try again.');
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout using the order Razorpay itself created
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: 'EventForge',
        description: `${event.name} — ${ticket.name} × ${qty}`,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#6C4CF1' },
        handler: async (response) => {
          // 3. Verify the signature on the backend, then finalize the booking
          try {
            const verifyRes = await bookingsApi.verifyPayment({
              eventId: event._id,
              ticketTypeId: ticket._id,
              quantity: qty,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setBooking(verifyRes.data);
            fireConfetti();
            setStep(3);
          } catch (err) {
            toast.error(err.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.on('payment.failed', (resp) => {
        toast.error(resp.error?.description || 'Payment failed');
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Could not start payment');
      setLoading(false);
    }
  };

  return (
    <Modal open title={step < 3 ? `Book "${event.name}"` : undefined} onClose={onClose} size={step === 3 ? 'sm' : 'md'}>
      {step < 3 && (
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
            {total > 0 && <p className="text-[11px] text-ink-faint">You'll pay securely via Razorpay in the next step.</p>}
          </motion.div>
        )}

        {step === 3 && booking && (
          <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
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

      {step < 3 && (
        <div className="flex gap-2 mt-6">
          {step > 0 && <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < 2 ? (
            <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>Continue</Button>
          ) : (
            <Button className="flex-1" onClick={handlePay} loading={loading} icon={loading ? Loader2 : undefined}>
              {total === 0 ? 'Confirm Free Booking' : `Pay ${fmtINR(total)}`}
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}