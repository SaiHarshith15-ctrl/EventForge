const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const generateQRCode = require('../utils/qrGenerator');
const streamTicketPDF = require('../utils/generateInvoicePDF');
const sendEmail = require('../utils/sendEmail');
const notify = require('../utils/notify');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

const findTicketType = (event, ticketTypeId) => {
  if (ticketTypeId) return event.tickets.id(ticketTypeId);
  return event.tickets[0];
};

// @desc    Create a Razorpay order for a ticket purchase (real payment flow)
// @route   POST /api/bookings/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { eventId, ticketTypeId, quantity = 1 } = req.body;
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  const ticket = findTicketType(event, ticketTypeId);
  if (!ticket) throw new ApiError(404, 'Ticket type not found');

  const remaining = ticket.capacity - ticket.booked;
  if (remaining < quantity) throw new ApiError(400, `Only ${remaining} tickets remaining for ${ticket.name}`);

  const totalAmount = ticket.price * quantity;

  if (totalAmount === 0) {
    return res.json({ success: true, message: 'Free ticket — no payment required', data: { free: true, totalAmount: 0 } });
  }

  if (!razorpay) {
    // Payment gateway not configured — the frontend should fall back to /simulate-payment
    return res.json({
      success: true,
      message: 'Razorpay not configured on this server; use the simulated payment flow.',
      data: { simulated: true, totalAmount },
    });
  }

  const order = await razorpay.orders.create({
    amount: totalAmount * 100, // paise
    currency: 'INR',
    receipt: `ef_${Date.now()}`,
    notes: { eventId, ticketTypeId: String(ticket._id), quantity: String(quantity), userId: String(req.user._id) },
  });

  res.json({ success: true, data: { order, keyId: process.env.RAZORPAY_KEY_ID, totalAmount } });
});

// Shared logic to finalize a booking once payment is confirmed (real or simulated)
const finalizeBooking = async (req, { event, ticket, quantity, paymentMethod, paymentStatus, razorpayIds = {} }) => {
  const totalAmount = ticket.price * quantity;

  const booking = await Booking.create({
    event: event._id,
    attendee: req.user._id,
    ticketTypeId: ticket._id,
    ticketTypeName: ticket.name,
    pricePerTicket: ticket.price,
    quantity,
    totalAmount,
    paymentStatus,
    paymentMethod,
    ...razorpayIds,
  });

  const qrCode = await generateQRCode({ bookingRef: booking.bookingRef, eventId: String(event._id) });
  booking.qrCode = qrCode;
  await booking.save();

  ticket.booked += quantity;
  event.booked += quantity;
  event.revenue += totalAmount;
  await event.save();

  await notify(req.app.get('io'), req.user._id, `Your ticket for "${event.name}" is confirmed. Booking ID: ${booking.bookingRef}`, {
    type: 'booking', relatedEvent: event._id,
  });
  await notify(req.app.get('io'), event.organizer, `New registration for "${event.name}" — ${quantity} ${ticket.name} ticket(s).`, {
    type: 'booking', relatedEvent: event._id,
  });

  sendEmail({
    to: req.user.email,
    subject: `Your ticket for ${event.name}`,
    html: `<p>Hi ${req.user.name},</p><p>Your booking (${booking.bookingRef}) for <b>${event.name}</b> is confirmed.</p>`,
  }).catch(() => {});

  return booking;
};

// @desc    Verify Razorpay payment signature and confirm the booking
// @route   POST /api/bookings/verify-payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { eventId, ticketTypeId, quantity = 1, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, 'Payment verification failed — signature mismatch');
  }

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  const ticket = findTicketType(event, ticketTypeId);
  if (!ticket) throw new ApiError(404, 'Ticket type not found');

  const booking = await finalizeBooking(req, {
    event, ticket, quantity,
    paymentMethod: 'upi', paymentStatus: 'paid',
    razorpayIds: { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature },
  });

  res.status(201).json({ success: true, message: 'Payment verified, booking confirmed', data: booking });
});

// @desc    Simulated payment success — used when Razorpay isn't configured (demo/dev mode),
//          and always available for free tickets.
// @route   POST /api/bookings/simulate-payment
// @access  Private
const simulatePayment = asyncHandler(async (req, res) => {
  const { eventId, ticketTypeId, quantity = 1 } = req.body;
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  const ticket = findTicketType(event, ticketTypeId);
  if (!ticket) throw new ApiError(404, 'Ticket type not found');

  const remaining = ticket.capacity - ticket.booked;
  if (remaining < quantity) throw new ApiError(400, `Only ${remaining} tickets remaining for ${ticket.name}`);

  const booking = await finalizeBooking(req, {
    event, ticket, quantity,
    paymentMethod: ticket.price === 0 ? 'free' : 'simulated',
    paymentStatus: 'paid',
  });

  res.status(201).json({ success: true, message: 'Booking confirmed', data: booking });
});

// @desc    Get my bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ attendee: req.user._id })
    .populate('event', 'name date time location coverImage category')
    .sort('-createdAt');
  res.json({ success: true, data: bookings });
});

// @desc    Get a single booking (ticket view)
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('event').populate('attendee', 'name email');
  if (!booking) throw new ApiError(404, 'Booking not found');
  const isOwner = booking.attendee._id.toString() === req.user._id.toString();
  const isOrganizer = booking.event.organizer.toString() === req.user._id.toString();
  if (!isOwner && !isOrganizer && req.user.role !== 'admin' && req.user.role !== 'staff') {
    throw new ApiError(403, 'Not authorized to view this booking');
  }
  res.json({ success: true, data: booking });
});

// @desc    Download ticket as PDF
// @route   GET /api/bookings/:id/pdf
// @access  Private
const downloadTicketPDF = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('event').populate('attendee', 'name email');
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.attendee._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  streamTicketPDF(res, {
    booking: { ...booking.toObject(), attendeeName: booking.attendee.name },
    event: booking.event,
    qrDataUrl: booking.qrCode,
  });
});

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('event');
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.attendee.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  if (booking.status === 'cancelled') throw new ApiError(400, 'Booking already cancelled');

  booking.status = 'cancelled';
  booking.paymentStatus = booking.paymentStatus === 'paid' ? 'refunded' : booking.paymentStatus;
  await booking.save();

  const event = await Event.findById(booking.event._id);
  const ticket = event.tickets.id(booking.ticketTypeId);
  if (ticket) ticket.booked = Math.max(0, ticket.booked - booking.quantity);
  event.booked = Math.max(0, event.booked - booking.quantity);
  event.revenue = Math.max(0, event.revenue - booking.totalAmount);
  await event.save();

  await notify(req.app.get('io'), event.organizer, `Booking ${booking.bookingRef} for "${event.name}" was cancelled.`, {
    type: 'booking', relatedEvent: event._id,
  });

  res.json({ success: true, message: 'Booking cancelled', data: booking });
});

// @desc    Get attendee list for an event (organizer view)
// @route   GET /api/bookings/event/:eventId
// @access  Private/Organizer,Admin,Staff
const getEventBookings = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== req.user._id.toString() && !['admin', 'staff'].includes(req.user.role)) {
    throw new ApiError(403, 'Not authorized');
  }
  const bookings = await Booking.find({ event: event._id }).populate('attendee', 'name email').sort('-createdAt');
  res.json({ success: true, data: bookings });
});

module.exports = {
  createOrder, verifyPayment, simulatePayment,
  getMyBookings, getBooking, downloadTicketPDF, cancelBooking, getEventBookings,
};
