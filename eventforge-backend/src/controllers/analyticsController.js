const asyncHandler = require('../middleware/asyncHandler');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Venue = require('../models/Venue');
const VenueRequest = require('../models/VenueRequest');
const CheckIn = require('../models/CheckIn');
const SponsorRequest = require('../models/SponsorRequest');
const Sponsor = require('../models/Sponsor');

// @desc    Organizer's own analytics — registrations, revenue, top events
// @route   GET /api/analytics/organizer
// @access  Private/Organizer
const organizerAnalytics = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id });
  const eventIds = events.map((e) => e._id);

  const totalRegistrations = events.reduce((sum, e) => sum + e.booked, 0);
  const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);
  const totalCheckIns = await CheckIn.countDocuments({ event: { $in: eventIds }, sessionTitle: '' });

  const topEvents = [...events].sort((a, b) => b.booked - a.booked).slice(0, 5)
    .map((e) => ({ id: e._id, name: e.name, booked: e.booked, capacity: e.capacity, revenue: e.revenue }));

  const bookingsByDay = await Booking.aggregate([
    { $match: { event: { $in: eventIds }, status: { $ne: 'cancelled' } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: '$quantity' }, revenue: { $sum: '$totalAmount' } } },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  res.json({
    success: true,
    data: {
      totalEvents: events.length,
      totalRegistrations,
      totalRevenue,
      totalCheckIns,
      topEvents,
      bookingsByDay,
    },
  });
});

// @desc    Venue owner earnings
// @route   GET /api/analytics/venue-owner
// @access  Private/VenueOwner
const venueOwnerAnalytics = asyncHandler(async (req, res) => {
  const venues = await Venue.find({ owner: req.user._id });
  const venueIds = venues.map((v) => v._id);
  const requests = await VenueRequest.find({ venue: { $in: venueIds } }).populate('venue', 'pricePerDay');

  const accepted = requests.filter((r) => r.status === 'accepted');
  const totalEarnings = accepted.reduce((sum, r) => sum + (r.venue?.pricePerDay || 0), 0);

  res.json({
    success: true,
    data: {
      totalVenues: venues.length,
      totalRequests: requests.length,
      accepted: accepted.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      totalEarnings,
    },
  });
});

// @desc    Sponsor analytics — spend, active sponsorships, estimated reach
// @route   GET /api/analytics/sponsor
// @access  Private/Sponsor
const sponsorAnalytics = asyncHandler(async (req, res) => {
  const sponsor = await Sponsor.findOne({ user: req.user._id });
  if (!sponsor) return res.json({ success: true, data: { totalSpend: 0, activeSponsorships: 0, estimatedReach: 0 } });

  const requests = await SponsorRequest.find({ sponsor: sponsor._id }).populate('event', 'capacity booked');
  const active = requests.filter((r) => r.status === 'accepted');
  const totalSpend = active.reduce((sum, r) => sum + r.amount, 0);
  const estimatedReach = active.reduce((sum, r) => sum + (r.event?.capacity || 0), 0);

  res.json({
    success: true,
    data: { totalSpend, activeSponsorships: active.length, estimatedReach, pendingRequests: requests.filter((r) => r.status === 'pending').length },
  });
});

// @desc    Platform-wide analytics for admin
// @route   GET /api/analytics/admin
// @access  Private/Admin
const adminAnalytics = asyncHandler(async (req, res) => {
  const [userCount, eventCount, bookingCount, venueCount, checkInCount] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Booking.countDocuments({ status: { $ne: 'cancelled' } }),
    Venue.countDocuments(),
    CheckIn.countDocuments({ sessionTitle: '' }),
  ]);

  const revenueAgg = await Booking.aggregate([
    { $match: { status: { $ne: 'cancelled' }, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  const eventsByCategory = await Event.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);

  const monthlyRevenue = await Booking.aggregate([
    { $match: { status: { $ne: 'cancelled' }, paymentStatus: 'paid' } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$totalAmount' } } },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  res.json({
    success: true,
    data: {
      userCount, eventCount, bookingCount, venueCount, checkInCount, totalRevenue,
      usersByRole, eventsByCategory, monthlyRevenue,
    },
  });
});

module.exports = { organizerAnalytics, venueOwnerAnalytics, sponsorAnalytics, adminAnalytics };
