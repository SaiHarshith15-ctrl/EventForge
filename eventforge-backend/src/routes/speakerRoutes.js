const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  getSpeakers, getSpeaker, createSpeaker, updateMySpeakerProfile,
  updateAvailability, uploadSpeakerAvatar, deleteSpeaker,
} = require('../controllers/speakerController');

router.get('/', getSpeakers);
router.get('/:id', getSpeaker);
router.post('/', protect, authorize('speaker', 'admin'), createSpeaker);
router.put('/me', protect, authorize('speaker'), updateMySpeakerProfile);
router.put('/me/availability', protect, authorize('speaker'), updateAvailability);
router.put('/me/avatar', protect, authorize('speaker'), upload.single('avatar'), uploadSpeakerAvatar);
router.delete('/:id', protect, authorize('speaker', 'admin'), deleteSpeaker);

module.exports = router;
