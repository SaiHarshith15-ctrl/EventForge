const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const { createVenueRequest, getVenueRequests, respondToVenueRequest } = require('../controllers/venueRequestController');

router.post('/', protect, authorize('organizer', 'admin'), createVenueRequest);
router.get('/', protect, getVenueRequests);
router.put('/:id/respond', protect, authorize('venue_owner', 'admin'), respondToVenueRequest);

module.exports = router;
