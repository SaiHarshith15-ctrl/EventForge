const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const { createInvite, getInvites, respondToInvite } = require('../controllers/speakerInviteController');

router.post('/', protect, authorize('organizer', 'admin'), createInvite);
router.get('/', protect, getInvites);
router.put('/:id/respond', protect, authorize('speaker'), respondToInvite);

module.exports = router;
