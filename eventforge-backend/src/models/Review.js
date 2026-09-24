const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ event: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
