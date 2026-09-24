const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const uploadBufferToCloudinary = require('../utils/uploadToCloudinary');
const notify = require('../utils/notify');

// @desc    Discover published events (search, filter, paginate) — public
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const {
    search = '', category, location, price, page = 1, limit = 12,
    sort = '-createdAt', organizer, status, includeUnpublished,
  } = req.query;

  const query = {};

  // Public discovery only shows published events, unless explicitly scoped (organizer's own dashboard)
  if (!includeUnpublished) query.isPublished = true;
  if (organizer) query.organizer = organizer;
  if (status) query.status = status;
  if (category && category !== 'All') query.category = category;
  if (location && location !== 'All') query.location = new RegExp(`^${location}$`, 'i');
  if (price === 'free') query['tickets.0.price'] = 0;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('venue', 'name location capacity')
      .populate('speakers', 'name role company')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Event.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: events,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get single event with full details
// @route   GET /api/events/:id
// @access  Public
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('venue')
    .populate('speakers')
    .populate('sponsors.sponsor')
    .populate('organizer', 'name email company');

  if (!event) throw new ApiError(404, 'Event not found');

  const reviews = await Review.find({ event: event._id }).populate('author', 'name avatar').sort('-createdAt').limit(20);

  res.json({ success: true, data: { ...event.toObject(), reviews } });
});

// @desc    Create a new event (draft)
// @route   POST /api/events
// @access  Private/Organizer,Admin
const createEvent = asyncHandler(async (req, res) => {
  const body = req.body;

  const capacity = Array.isArray(body.tickets)
    ? body.tickets.reduce((sum, t) => sum + Number(t.capacity || 0), 0)
    : Number(body.capacity || 0);

  const event = await Event.create({
    name: body.name,
    category: body.category,
    description: body.description,
    date: body.date,
    time: body.time,
    registrationDeadline: body.registrationDeadline || body.date,
    location: body.location,
    isOnline: body.isOnline || false,
    onlineLink: body.onlineLink,
    organizer: req.user._id,
    tickets: body.tickets || [],
    schedule: body.schedule || [],
    capacity,
    status: 'DRAFT',
  });

  res.status(201).json({ success: true, message: 'Event draft created', data: event });
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Owner(Organizer),Admin
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to edit this event');
  }

  const allowed = [
    'name', 'category', 'description', 'date', 'time', 'registrationDeadline',
    'location', 'isOnline', 'onlineLink', 'tickets', 'schedule', 'tags', 'coverImage',
  ];
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) event[f] = req.body[f];
  });

  if (Array.isArray(event.tickets) && event.tickets.length) {
    event.capacity = event.tickets.reduce((sum, t) => sum + Number(t.capacity || 0), 0);
  }

  await event.save();
  res.json({ success: true, message: 'Event updated', data: event });
});

// @desc    Upload event cover image
// @route   PUT /api/events/:id/cover
// @access  Private/Owner,Admin
const uploadCoverImage = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  if (!req.file) throw new ApiError(400, 'No image provided');

  const result = await uploadBufferToCloudinary(req.file.buffer, 'eventforge/events');
  event.coverImage = result.secure_url;
  await event.save();
  res.json({ success: true, message: 'Cover image updated', data: event });
});

// @desc    Readiness checklist for the publish flow
// @route   GET /api/events/:id/readiness
// @access  Private/Owner,Admin
const getReadiness = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  res.json({ success: true, data: { checklist: event.readinessChecklist(), ready: event.isReadyToPublish() } });
});

// @desc    Publish an event
// @route   PUT /api/events/:id/publish
// @access  Private/Owner,Admin
const publishEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  if (!event.isReadyToPublish()) {
    throw new ApiError(400, 'Event is not ready to publish. Complete the readiness checklist first.');
  }
  event.isPublished = true;
  event.status = 'PUBLISHED';
  await event.save();
  res.json({ success: true, message: 'Event published', data: event });
});

// @desc    Unpublish an event
// @route   PUT /api/events/:id/unpublish
// @access  Private/Owner,Admin
const unpublishEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  event.isPublished = false;
  event.status = 'DRAFT';
  await event.save();
  res.json({ success: true, message: 'Event unpublished', data: event });
});

// @desc    Cancel an event (organizer/admin) — notifies all ticket holders
// @route   PUT /api/events/:id/cancel
// @access  Private/Owner,Admin
const cancelEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  event.status = 'CANCELLED';
  event.isPublished = false;
  await event.save();

  const bookings = await Booking.find({ event: event._id, status: 'confirmed' });
  const attendeeIds = bookings.map((b) => b.attendee);
  await notify(req.app.get('io'), attendeeIds, `Event "${event.name}" has been cancelled by the organizer.`, {
    type: 'system',
    relatedEvent: event._id,
  });

  res.json({ success: true, message: 'Event cancelled and attendees notified', data: event });
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Owner,Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  await event.deleteOne();
  res.json({ success: true, message: 'Event deleted' });
});

// @desc    Add / update / remove a schedule session
// @route   POST /api/events/:id/schedule
// @access  Private/Owner,Admin
const addScheduleItem = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  const { time, title, speakerName, room } = req.body;
  if (!time || !title) throw new ApiError(400, 'time and title are required');

  event.schedule.push({ time, title, speakerName, room });
  event.schedule.sort((a, b) => a.time.localeCompare(b.time));
  await event.save();
  res.status(201).json({ success: true, message: 'Session added', data: event.schedule });
});

const removeScheduleItem = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  event.schedule = event.schedule.filter((s) => s._id.toString() !== req.params.itemId);
  await event.save();
  res.json({ success: true, message: 'Session removed', data: event.schedule });
});

// @desc    Add a review for an event (attendee who booked)
// @route   POST /api/events/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating) throw new ApiError(400, 'Rating is required');

  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');

  const hasBooking = await Booking.exists({ event: event._id, attendee: req.user._id, status: { $ne: 'cancelled' } });
  if (!hasBooking) throw new ApiError(403, 'Only attendees who booked this event can leave a review');

  const existing = await Review.findOne({ event: event._id, author: req.user._id });
  if (existing) throw new ApiError(409, 'You already reviewed this event');

  const review = await Review.create({ event: event._id, author: req.user._id, rating, comment });

  const allReviews = await Review.find({ event: event._id });
  event.ratingCount = allReviews.length;
  event.ratingAvg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  await event.save();

  res.status(201).json({ success: true, message: 'Review added', data: review });
});

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  uploadCoverImage,
  getReadiness,
  publishEvent,
  unpublishEvent,
  cancelEvent,
  deleteEvent,
  addScheduleItem,
  removeScheduleItem,
  addReview,
};
