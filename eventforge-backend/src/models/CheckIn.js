const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    attendeeName: { type: String, required: true },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionTitle: { type: String, default: '' },
  },
  { timestamps: true }
);

checkInSchema.index({ event: 1 });

module.exports = mongoose.model('CheckIn', checkInSchema);
