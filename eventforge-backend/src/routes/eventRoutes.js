const express = require('express');
const router = express.Router();
const { protect, attachUserIfPresent } = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  getEvents, getEvent, createEvent, updateEvent, uploadCoverImage, getReadiness,
  publishEvent, unpublishEvent, cancelEvent, deleteEvent,
  addScheduleItem, removeScheduleItem, addReview,
} = require('../controllers/eventController');

router.get('/', attachUserIfPresent, getEvents);
router.get('/:id', getEvent);

router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.put('/:id/cover', protect, authorize('organizer', 'admin'), upload.single('image'), uploadCoverImage);
router.get('/:id/readiness', protect, authorize('organizer', 'admin'), getReadiness);
router.put('/:id/publish', protect, authorize('organizer', 'admin'), publishEvent);
router.put('/:id/unpublish', protect, authorize('organizer', 'admin'), unpublishEvent);
router.put('/:id/cancel', protect, authorize('organizer', 'admin'), cancelEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

router.post('/:id/schedule', protect, authorize('organizer', 'admin'), addScheduleItem);
router.delete('/:id/schedule/:itemId', protect, authorize('organizer', 'admin'), removeScheduleItem);

router.post('/:id/reviews', protect, authorize('attendee'), addReview);

module.exports = router;
