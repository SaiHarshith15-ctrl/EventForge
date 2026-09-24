const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  getVenues, getVenue, createVenue, updateVenue, uploadVenueImage, deleteVenue,
} = require('../controllers/venueController');

router.get('/', getVenues);
router.get('/:id', getVenue);
router.post('/', protect, authorize('venue_owner', 'admin'), createVenue);
router.put('/:id', protect, authorize('venue_owner', 'admin'), updateVenue);
router.put('/:id/image', protect, authorize('venue_owner', 'admin'), upload.single('image'), uploadVenueImage);
router.delete('/:id', protect, authorize('venue_owner', 'admin'), deleteVenue);

module.exports = router;
