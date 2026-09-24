const mongoose = require('mongoose');

const speakerInviteSchema = new mongoose.Schema(
  {
    speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: String, default: 'Keynote' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SpeakerInvite', speakerInviteSchema);
