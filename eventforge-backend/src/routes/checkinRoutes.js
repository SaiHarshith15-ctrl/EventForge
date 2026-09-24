const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/role');
const { scanCheckIn, getEventCheckIns } = require('../controllers/checkinController');

router.post('/scan', protect, authorize('staff', 'organizer', 'admin'), scanCheckIn);
router.get('/event/:eventId', protect, authorize('staff', 'organizer', 'admin'), getEventCheckIns);

module.exports = router;
