const mongoose = require('mongoose');

const sponsorRequestSchema = new mongoose.Schema(
  {
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tier: { type: String, enum: ['Gold', 'Silver', 'Bronze'], default: 'Bronze' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    initiatedBy: { type: String, enum: ['sponsor', 'organizer'], default: 'sponsor' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SponsorRequest', sponsorRequestSchema);
