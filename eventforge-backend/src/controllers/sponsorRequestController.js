const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const SponsorRequest = require('../models/SponsorRequest');
const Sponsor = require('../models/Sponsor');
const Event = require('../models/Event');
const notify = require('../utils/notify');

// @desc    Sponsor requests to sponsor an event
// @route   POST /api/sponsor-requests
// @access  Private/Sponsor
const createSponsorRequest = asyncHandler(async (req, res) => {
  const { eventId, tier, amount } = req.body;
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  const sponsor = await Sponsor.findOne({ user: req.user._id });
  if (!sponsor) throw new ApiError(404, 'Create a sponsor profile first');

  const request = await SponsorRequest.create({
    sponsor: sponsor._id, event: eventId, organizer: event.organizer,
    tier: tier || sponsor.tier, amount: amount || sponsor.budget, initiatedBy: 'sponsor',
  });

  await notify(req.app.get('io'), event.organizer, `New sponsorship request for "${event.name}".`, {
    type: 'sponsor', relatedEvent: event._id,
  });

  res.status(201).json({ success: true, message: 'Sponsorship requested', data: request });
});

// @desc    List sponsor requests (sponsor sees own, organizer sees theirs)
// @route   GET /api/sponsor-requests
// @access  Private
const getSponsorRequests = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'organizer') query.organizer = req.user._id;
  if (req.user.role === 'sponsor') {
    const mySponsor = await Sponsor.findOne({ user: req.user._id });
    query.sponsor = mySponsor ? mySponsor._id : null;
  }
  const requests = await SponsorRequest.find(query)
    .populate('sponsor', 'name tier logo')
    .populate('event', 'name date sponsorsList')
    .populate('organizer', 'name email')
    .sort('-createdAt');
  res.json({ success: true, data: requests });
});

// @desc    Organizer accepts/rejects a sponsorship request
// @route   PUT /api/sponsor-requests/:id/respond
// @access  Private/Organizer
const respondToSponsorRequest = asyncHandler(async (req, res) => {
  const { status } = req.body; // accepted | rejected
  const request = await SponsorRequest.findById(req.params.id).populate('event').populate('sponsor');
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }

  request.status = status;
  await request.save();

  if (status === 'accepted') {
    const event = await Event.findById(request.event._id);
    const already = event.sponsors.some((s) => s.sponsor.toString() === request.sponsor._id.toString());
    if (!already) event.sponsors.push({ sponsor: request.sponsor._id, tier: request.tier });
    event.sponsorConfirmed = true;
    await event.save();
  }

  if (request.sponsor.user) {
    await notify(
      req.app.get('io'),
      request.sponsor.user,
      `Your sponsorship for "${request.event.name}" was ${status}.`,
      { type: 'sponsor' }
    );
  }

  res.json({ success: true, message: 'Response recorded', data: request });
});

module.exports = { createSponsorRequest, getSponsorRequests, respondToSponsorRequest };
