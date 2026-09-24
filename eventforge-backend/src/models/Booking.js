const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: { type: String, unique: true, default: () => 'EF' + uuidv4().split('-')[0].toUpperCase() },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    ticketTypeId: { type: mongoose.Schema.Types.ObjectId },
    ticketTypeName: { type: String, required: true },
    pricePerTicket: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },

    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, enum: ['upi', 'card', 'netbanking', 'free', 'simulated'], default: 'simulated' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    status: { type: String, enum: ['confirmed', 'cancelled', 'checked_in'], default: 'confirmed' },
    qrCode: { type: String }, // base64 data URL

    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ event: 1 });
bookingSchema.index({ attendee: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
