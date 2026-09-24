const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const notify = require('../utils/notify');
const sendEmail = require('../utils/sendEmail');

// @desc    Organizer sends an announcement to all ticket holders of an event
// @route   POST /api/announcements
// @access  Private/Organizer,Admin
const createAnnouncement = asyncHandler(async (req, res) => {
  const { eventId, message } = req.body;
  if (!message) throw new ApiError(400, 'Message is required');

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }

  const announcement = await Announcement.create({ event: eventId, organizer: req.user._id, message });

  const bookings = await Booking.find({ event: eventId, status: { $ne: 'cancelled' } }).populate('attendee', 'email');
  const attendeeIds = bookings.map((b) => b.attendee._id);

  await notify(req.app.get('io'), attendeeIds, `${event.name}: ${message}`, {
    type: 'announcement', relatedEvent: event._id,
  });

  // Fire-and-forget bulk email (best-effort, doesn't block the response)
  bookings.forEach((b) => {
    sendEmail({
      to: b.attendee.email,
      subject: `Update on ${event.name}`,
      html: `<p>${message}</p>`,
    }).catch(() => {});
  });

  res.status(201).json({ success: true, message: `Announcement sent to ${bookings.length} attendee(s)`, data: announcement });
});

// @desc    List announcements for an event
// @route   GET /api/announcements/event/:eventId
// @access  Public
const getEventAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({ event: req.params.eventId }).sort('-createdAt');
  res.json({ success: true, data: announcements });
});

module.exports = { createAnnouncement, getEventAnnouncements };
