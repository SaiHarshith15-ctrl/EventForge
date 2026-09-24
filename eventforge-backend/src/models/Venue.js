const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: true },
    address: { type: String, default: '' },
    capacity: { type: Number, required: true, min: 1 },
    pricePerDay: { type: Number, required: true, min: 0 },
    amenities: [{ type: String }],
    images: [{ type: String }],
    coverImage: { type: String, default: '' },
    description: { type: String, default: '', maxlength: 2000 },
    isActive: { type: Boolean, default: true },
    blockedDates: [{ type: Date }],
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

venueSchema.index({ name: 'text', location: 'text' });
venueSchema.index({ owner: 1 });

module.exports = mongoose.model('Venue', venueSchema);
