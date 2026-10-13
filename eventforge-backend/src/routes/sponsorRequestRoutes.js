const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');
const { createSponsorRequest, getSponsorRequests, respondToSponsorRequest } = require('../controllers/sponsorRequestController');

router.post('/', protect, authorize('sponsor', 'organizer', 'admin'), createSponsor);
router.get('/', protect, getSponsorRequests);
router.put('/:id/respond', protect, authorize('organizer', 'admin'), respondToSponsorRequest);
router.delete('/:id', protect, authorize('sponsor', 'organizer', 'admin'), deleteSponsor);
router.put('/:id/logo', protect, authorize('sponsor', 'organizer', 'admin'), upload.single('image'), require('../controllers/sponsorController').uploadSponsorLogo);

module.exports = router;
