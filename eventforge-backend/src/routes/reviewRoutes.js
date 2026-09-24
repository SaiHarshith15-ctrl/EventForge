const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getEventReviews, deleteReview } = require('../controllers/reviewController');

router.get('/event/:eventId', getEventReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
