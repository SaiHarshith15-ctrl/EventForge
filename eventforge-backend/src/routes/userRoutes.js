const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  updateProfile, updateAvatar, toggleSavedEvent, getSavedEvents,
  listUsers, getUser, toggleSuspendUser, changeUserRole, deleteUser,
} = require('../controllers/userController');

router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);
router.get('/saved-events', protect, getSavedEvents);
router.put('/saved-events/:eventId', protect, toggleSavedEvent);

router.get('/', protect, authorize('admin'), listUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id/suspend', protect, authorize('admin'), toggleSuspendUser);
router.put('/:id/role', protect, authorize('admin'), changeUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
