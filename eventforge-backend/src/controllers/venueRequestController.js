const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const VenueRequest = require('../models/VenueRequest');
const Venue = require('../models/Venue');
const Event = require('../models/Event');
const notify = require('../utils/notify');

// @desc    Organizer requests a venue for an event
// @route   POST /api/venue-requests
// @access  Private/Organizer
const createVenueRequest = asyncHandler(async (req, res) => {
  const { venueId, eventId, message } = req.body;
  const venue = await Venue.findById(venueId);
  const event = await Event.findById(eventId);
  if (!venue) throw new ApiError(404, 'Venue not found');
  if (!event) throw new ApiError(404, 'Event not found');
  if (event.organizer.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not your event');

  const request = await VenueRequest.create({ venue: venueId, event: eventId, organizer: req.user._id, message });

  await notify(req.app.get('io'), venue.owner, `New venue request for "${event.name}".`, { type: 'venue', relatedEvent: event._id });

  res.status(201).json({ success: true, message: 'Venue requested', data: request });
});

// @desc    List venue requests (organizer sees own, venue owner sees theirs, admin sees all)
// @route   GET /api/venue-requests
// @access  Private
const getVenueRequests = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'organizer') query.organizer = req.user._id;
  if (req.user.role === 'venue_owner') {
    const ownVenues = await Venue.find({ owner: req.user._id }).select('_id');
    query.venue = { $in: ownVenues.map((v) => v._id) };
  }
  const requests = await VenueRequest.find(query)
    .populate('venue', 'name location images coverImage pricePerDay')
    .populate('event', 'name date')
    .populate('organizer', 'name email')
    .sort('-createdAt');
  res.json({ success: true, data: requests });
});

// @desc    Venue owner responds to a request
// @route   PUT /api/venue-requests/:id/respond
// @access  Private/VenueOwner,Admin
const respondToVenueRequest = asyncHandler(async (req, res) => {
  const { status, ownerResponse } = req.body; // accepted | rejected | changes_requested
  const request = await VenueRequest.findById(req.params.id).populate('venue').populate('event');
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  request.status = status;
  request.ownerResponse = ownerResponse || '';
  await request.save();

  if (status === 'accepted') {
    const event = await Event.findById(request.event._id);
    event.venue = request.venue._id;
    event.venueConfirmed = true;
    if (event.status === 'DRAFT') event.status = 'PENDING';
    await event.save();
  }

  const messages = {
    accepted: `Venue request accepted for "${request.event.name}".`,
    rejected: `Venue request rejected for "${request.event.name}".`,
    changes_requested: `Venue owner requested changes for "${request.event.name}".`,
  };
  await notify(req.app.get('io'), request.organizer, messages[status] || 'Venue request updated', { type: 'venue' });

  res.json({ success: true, message: 'Response recorded', data: request });
});

module.exports = { createVenueRequest, getVenueRequests, respondToVenueRequest };
