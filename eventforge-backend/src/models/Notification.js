const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ['booking', 'venue', 'speaker', 'sponsor', 'announcement', 'system', 'checkin'],
      default: 'system',
    },
    relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
