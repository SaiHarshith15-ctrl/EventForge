const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const { createSponsorRequest, getSponsorRequests, respondToSponsorRequest } = require('../controllers/sponsorRequestController');

router.post('/', protect, authorize('sponsor', 'admin'), createSponsorRequest);
router.get('/', protect, getSponsorRequests);
router.put('/:id/respond', protect, authorize('organizer', 'admin'), respondToSponsorRequest);

module.exports = router;
