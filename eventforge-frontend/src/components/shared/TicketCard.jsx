import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Calendar, MapPin } from 'lucide-react';
import { fmtDate } from '../../utils/format';
import Button from '../ui/Button';
import { bookingsApi } from '../../api/bookings.api';

export default function TicketCard({ booking }) {
  const event = booking.event;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 220 }}
      className="rounded-2xl overflow-hidden shadow-lift bg-gradient-to-br from-ink to-violet-900 text-white"
    >
      <div className="p-6 flex justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-violet-300 font-bold">EventForge Ticket</div>
          <div className="font-display font-bold text-xl mt-1 leading-snug">{event?.name}</div>
          <div className="flex flex-wrap gap-3 text-xs text-violet-200 mt-2">
            <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{event && fmtDate(event.date)}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event?.location}</span>
          </div>
        </div>
        <span className="shrink-0 h-fit text-[11px] font-bold px-2.5 py-1 rounded-full bg-mint-400 text-ink">
          {booking.ticketTypeName}
        </span>
      </div>

      <div className="ticket-notch" style={{ '--notch-bg': '#17153A', filter: 'brightness(1.15)' }} />
      <div className="perf-line opacity-20 mx-6" />

      <div className="p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs space-y-1.5">
          <div><span className="text-violet-300">Attendee</span><div className="font-semibold">{booking.attendeeName || booking.attendee?.name}</div></div>
          <div><span className="text-violet-300">Booking ID</span><div className="font-semibold font-mono">{booking.bookingRef}</div></div>
          <div><span className="text-violet-300">Qty</span><div className="font-semibold">{booking.quantity}</div></div>
          <Button
            size="sm" variant="accent" icon={Download}
            className="mt-2"
            onClick={() => window.open(bookingsApi.downloadPdfUrl(booking._id) + `?token=${localStorage.getItem('ef_token')}`, '_blank')}
          >
            Download PDF
          </Button>
        </div>
        <div className="bg-white p-2.5 rounded-xl shrink-0">
          <QRCodeSVG value={booking.bookingRef} size={104} />
        </div>
      </div>
    </motion.div>
  );
}
