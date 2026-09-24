const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/events', require('./eventRoutes'));
router.use('/venues', require('./venueRoutes'));
router.use('/venue-requests', require('./venueRequestRoutes'));
router.use('/speakers', require('./speakerRoutes'));
router.use('/speaker-invites', require('./speakerInviteRoutes'));
router.use('/sponsors', require('./sponsorRoutes'));
router.use('/sponsor-requests', require('./sponsorRequestRoutes'));
router.use('/bookings', require('./bookingRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/checkins', require('./checkinRoutes'));
router.use('/announcements', require('./announcementRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/ai', require('./aiRoutes'));
router.use('/reviews', require('./reviewRoutes'));

module.exports = router;
