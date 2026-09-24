const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const Review = require('../models/Review');

const getEventReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ event: req.params.eventId }).populate('author', 'name avatar').sort('-createdAt');
  res.json({ success: true, data: reviews });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
});

module.exports = { getEventReviews, deleteReview };
