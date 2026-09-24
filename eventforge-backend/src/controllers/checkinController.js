const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const Booking = require('../models/Booking');
const CheckIn = require('../models/CheckIn');
const Event = require('../models/Event');
const notify = require('../utils/notify');

// @desc    Check in an attendee by scanning their QR (booking reference)
// @route   POST /api/checkins/scan
// @access  Private/Staff,Organizer,Admin
const scanCheckIn = asyncHandler(async (req, res) => {
  const { bookingRef, sessionTitle } = req.body;
  if (!bookingRef) throw new ApiError(400, 'bookingRef is required');

  const booking = await Booking.findOne({ bookingRef }).populate('event').populate('attendee', 'name');
  if (!booking) throw new ApiError(404, 'No booking found for this QR code');
  if (booking.status === 'cancelled') throw new ApiError(400, 'This booking has been cancelled');

  const authorized = ['staff', 'admin'].includes(req.user.role) || booking.event.organizer.toString() === req.user._id.toString();
  if (!authorized) throw new ApiError(403, 'Not authorized to check in attendees for this event');

  if (booking.checkedIn && !sessionTitle) {
    return res.json({ success: true, message: 'Already checked in', data: { booking, alreadyCheckedIn: true } });
  }

  const checkIn = await CheckIn.create({
    event: booking.event._id,
    booking: booking._id,
    attendeeName: booking.attendee.name,
    scannedBy: req.user._id,
    sessionTitle: sessionTitle || '',
  });

  if (!sessionTitle) {
    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    booking.status = 'checked_in';
    await booking.save();
  }

  const event = await Event.findById(booking.event._id);
  const totalCheckedIn = await CheckIn.countDocuments({ event: event._id, sessionTitle: '' });

  await notify(req.app.get('io'), event.organizer, `${booking.attendee.name} checked in for "${event.name}".`, {
    type: 'checkin', relatedEvent: event._id,
  });

  res.status(201).json({ success: true, message: `${booking.attendee.name} checked in!`, data: { checkIn, totalCheckedIn } });
});

// @desc    Get check-in stats/list for an event
// @route   GET /api/checkins/event/:eventId
// @access  Private/Staff,Organizer,Admin
const getEventCheckIns = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  const authorized = ['staff', 'admin'].includes(req.user.role) || event.organizer.toString() === req.user._id.toString();
  if (!authorized) throw new ApiError(403, 'Not authorized');

  const checkIns = await CheckIn.find({ event: event._id }).sort('-createdAt');
  res.json({
    success: true,
    data: checkIns,
    stats: { totalCheckedIn: checkIns.filter((c) => !c.sessionTitle).length, totalAttendees: event.booked },
  });
});

module.exports = { scanCheckIn, getEventCheckIns };
