const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  organizerAnalytics, venueOwnerAnalytics, sponsorAnalytics, adminAnalytics,
} = require('../controllers/analyticsController');

router.get('/organizer', protect, authorize('organizer', 'admin'), organizerAnalytics);
router.get('/venue-owner', protect, authorize('venue_owner', 'admin'), venueOwnerAnalytics);
router.get('/sponsor', protect, authorize('sponsor', 'admin'), sponsorAnalytics);
router.get('/admin', protect, authorize('admin'), adminAnalytics);

module.exports = router;
