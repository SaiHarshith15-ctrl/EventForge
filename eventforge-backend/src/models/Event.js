const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    booked: { type: Number, default: 0 },
  },
  { _id: true }
);

const scheduleItemSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    title: { type: String, required: true },
    speakerName: { type: String, default: 'TBD' },
    room: { type: String, default: 'TBD' },
  },
  { _id: true }
);

const CATEGORIES = [
  'Conference', 'Hackathon', 'Workshop', 'Exhibition', 'Concert',
  'Wedding', 'Networking', 'Corporate', 'College Event', 'Other',
];

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Event name is required'], trim: true, maxlength: 150 },
    slug: { type: String, unique: true, index: true },
    category: { type: String, enum: CATEGORIES, default: 'Other' },
    description: { type: String, default: '', maxlength: 5000 },
    coverImage: { type: String, default: '' },
    gallery: [{ type: String }],

    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    date: { type: Date, required: [true, 'Event date is required'] },
    time: { type: String, default: '09:00' },
    registrationDeadline: { type: Date },
    location: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    onlineLink: { type: String, default: '' },

    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    venueConfirmed: { type: Boolean, default: false },

    speakers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' }],
    speakerConfirmed: { type: Boolean, default: false },

    sponsors: [
      {
        sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor' },
        tier: { type: String, enum: ['Gold', 'Silver', 'Bronze'], default: 'Bronze' },
      },
    ],
    sponsorConfirmed: { type: Boolean, default: false },

    tickets: [ticketTypeSchema],
    schedule: [scheduleItemSchema],

    capacity: { type: Number, default: 0 },
    booked: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'READY', 'PUBLISHED', 'LIVE', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
    },
    isPublished: { type: Boolean, default: false },

    tags: [{ type: String }],
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

eventSchema.index({ name: 'text', description: 'text', location: 'text', category: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ isPublished: 1, status: 1 });

eventSchema.pre('validate', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 7);
  }
  next();
});

// Readiness checklist used by the organizer dashboard before publishing
eventSchema.methods.readinessChecklist = function () {
  return [
    { label: 'Venue confirmed', done: !!this.venueConfirmed },
    { label: 'Speakers confirmed', done: !!this.speakerConfirmed || this.speakers.length > 0 },
    { label: 'Sponsors confirmed', done: !!this.sponsorConfirmed || this.sponsors.length > 0 },
    { label: 'Tickets configured', done: this.tickets.length > 0 },
    { label: 'Schedule configured', done: this.schedule.length > 0 },
    { label: 'Event details completed', done: !!this.name && !!this.date && !!this.location },
  ];
};

eventSchema.methods.isReadyToPublish = function () {
  return this.readinessChecklist().every((c) => c.done);
};

module.exports = mongoose.model('Event', eventSchema);
module.exports.CATEGORIES = CATEGORIES;
