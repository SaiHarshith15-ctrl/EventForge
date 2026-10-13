const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  getSponsors, getSponsor, createSponsor, updateMySponsorProfile, deleteSponsor, uploadSponsorLogo,
} = require('../controllers/sponsorController');

router.get('/', getSponsors);
router.get('/:id', getSponsor);
router.post('/', protect, authorize('sponsor', 'organizer', 'admin'), createSponsor);
router.put('/me', protect, authorize('sponsor'), updateMySponsorProfile);
router.put('/:id/logo', protect, authorize('sponsor', 'organizer', 'admin'), upload.single('image'), uploadSponsorLogo);
router.delete('/:id', protect, authorize('sponsor', 'organizer', 'admin'), deleteSponsor);

module.exports = router;