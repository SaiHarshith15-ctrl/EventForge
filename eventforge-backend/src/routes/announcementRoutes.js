const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const { createAnnouncement, getEventAnnouncements } = require('../controllers/announcementController');

router.post('/', protect, authorize('organizer', 'admin'), createAnnouncement);
router.get('/event/:eventId', getEventAnnouncements);

module.exports = router;
