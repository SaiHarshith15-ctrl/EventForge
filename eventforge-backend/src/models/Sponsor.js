const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    tier: { type: String, enum: ['Gold', 'Silver', 'Bronze'], default: 'Bronze' },
    budget: { type: Number, default: 0 },
    benefits: [{ type: String }],
    contactEmail: { type: String, default: '' },
    logo: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sponsor', sponsorSchema);
