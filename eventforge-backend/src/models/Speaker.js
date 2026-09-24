const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    expertise: [{ type: String }],
    bio: { type: String, default: '', maxlength: 2000 },
    avatar: { type: String, default: '' },
    availability: { type: String, enum: ['Available', 'Busy'], default: 'Available' },
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String,
    },
  },
  { timestamps: true }
);

speakerSchema.index({ name: 'text', company: 'text', expertise: 'text' });

module.exports = mongoose.model('Speaker', speakerSchema);
