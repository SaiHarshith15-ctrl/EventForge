const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const { getSponsors, getSponsor, createSponsor, updateMySponsorProfile, deleteSponsor } = require('../controllers/sponsorController');

router.get('/', getSponsors);
router.get('/:id', getSponsor);
router.post('/', protect, authorize('sponsor', 'organizer','admin'), createSponsor);
router.put('/me', protect, authorize('sponsor'), updateMySponsorProfile);
router.delete('/:id', protect, authorize('sponsor', 'organizer','admin'), deleteSponsor);

module.exports = router;
