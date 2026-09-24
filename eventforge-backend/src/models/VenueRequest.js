const mongoose = require('mongoose');

const venueRequestSchema = new mongoose.Schema(
  {
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'changes_requested'], default: 'pending' },
    message: { type: String, default: '' },
    ownerResponse: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VenueRequest', venueRequestSchema);
