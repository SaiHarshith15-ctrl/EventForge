/**
 * Seeds the database with demo data matching the EventForge frontend prototype:
 * one user per role (all password: demo123), sample venues, speakers, sponsors and events.
 *
 * Usage:
 *   npm run seed            # populate
 *   npm run seed:destroy    # wipe all collections
 */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Speaker = require('../models/Speaker');
const Sponsor = require('../models/Sponsor');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const VenueRequest = require('../models/VenueRequest');
const SpeakerInvite = require('../models/SpeakerInvite');
const SponsorRequest = require('../models/SponsorRequest');
const CheckIn = require('../models/CheckIn');
const Announcement = require('../models/Announcement');
const Review = require('../models/Review');

const img = {
  conf: 'https://images.unsplash.com/photo-1540575467063-17843e7da652?w=800&q=70',
  hack: 'https://images.unsplash.com/photo-1531482615726-e842f0189746?w=800&q=70',
  work: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=70',
  music: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbb2633?w=800&q=70',
  network: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=70',
  venue1: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=70',
  venue2: 'https://images.unsplash.com/photo-1559666126-84f389727b7a?w=800&q=70',
};

const destroy = async () => {
  await Promise.all([
    User.deleteMany(), Event.deleteMany(), Venue.deleteMany(), Speaker.deleteMany(),
    Sponsor.deleteMany(), Booking.deleteMany(), Notification.deleteMany(),
    VenueRequest.deleteMany(), SpeakerInvite.deleteMany(), SponsorRequest.deleteMany(),
    CheckIn.deleteMany(), Announcement.deleteMany(), Review.deleteMany(),
  ]);
  console.log('All collections cleared.');
  process.exit(0);
};

const seed = async () => {
  await connectDB();

  const existing = await User.countDocuments();
  if (existing > 0) {
    console.log('Database already has data. Run "npm run seed:destroy" first if you want to reseed.');
    process.exit(0);
  }

  const users = await User.create([
    { name: 'Aarav Sharma', email: 'attendee@demo.com', password: 'demo123', role: 'attendee', city: 'Hyderabad' },
    { name: 'Neha Gupta', email: 'organizer@demo.com', password: 'demo123', role: 'organizer', company: 'EventForge Events', city: 'Hyderabad' },
    { name: 'Raj Malhotra', email: 'venue@demo.com', password: 'demo123', role: 'venue_owner', company: 'HICC Group', city: 'Hyderabad' },
    { name: 'Dr. Anika Rao', email: 'speaker@demo.com', password: 'demo123', role: 'speaker', company: 'NeuraLabs', city: 'Hyderabad' },
    { name: 'TechCorp India', email: 'sponsor@demo.com', password: 'demo123', role: 'sponsor', company: 'TechCorp', city: 'Bengaluru' },
    { name: 'Karan Verma', email: 'staff@demo.com', password: 'demo123', role: 'staff', company: 'EventForge Ops', city: 'Hyderabad' },
    { name: 'Admin User', email: 'admin@demo.com', password: 'demo123', role: 'admin', company: 'EventForge', city: 'Hyderabad' },
  ]);
  const [attendee, organizer, venueOwner, speakerUser, sponsorUser, staff, admin] = users;
  console.log(`Seeded ${users.length} demo users (password for all: demo123)`);

  const venues = await Venue.create([
    { name: 'Hyderabad International Convention Centre', owner: venueOwner._id, location: 'Hyderabad', capacity: 2500, pricePerDay: 250000, amenities: ['Parking', 'WiFi', 'Stage', 'Projector', 'Catering', 'Security'], coverImage: img.venue1, images: [img.venue1] },
    { name: 'Bengaluru Tech Park Auditorium', owner: venueOwner._id, location: 'Bengaluru', capacity: 400, pricePerDay: 80000, amenities: ['WiFi', 'Projector', 'Parking', 'AC'], coverImage: img.venue2, images: [img.venue2] },
    { name: 'Mumbai Innovation Arena', owner: venueOwner._id, location: 'Mumbai', capacity: 600, pricePerDay: 150000, amenities: ['Parking', 'WiFi', 'Stage', 'Catering'], coverImage: img.venue1, images: [img.venue1] },
  ]);
  console.log(`Seeded ${venues.length} venues`);

  const speakers = await Speaker.create([
    { user: speakerUser._id, name: 'Dr. Anika Rao', role: 'AI Researcher', company: 'NeuraLabs', expertise: ['AI', 'Generative Models', 'NLP'], bio: 'Leading researcher in generative AI with 15+ years in machine learning.', availability: 'Available' },
    { name: 'Vikram Sethi', role: 'CTO', company: 'BuildOS', expertise: ['Cloud', 'DevOps', 'AI Infra'], bio: 'Builder of developer tools and scalable cloud platforms.', availability: 'Available' },
    { name: 'Priya Nair', role: 'Founder', company: 'StartUp Circle', expertise: ['Startups', 'Fundraising', 'Community'], bio: 'Community builder connecting founders across India.', availability: 'Available' },
  ]);
  console.log(`Seeded ${speakers.length} speakers`);

  const sponsors = await Sponsor.create([
    { user: sponsorUser._id, name: 'TechCorp India', tier: 'Gold', budget: 500000, benefits: ['Main stage branding', 'Booth', 'Social media', 'Logo placement', 'VIP tickets'], contactEmail: sponsorUser.email },
    { name: 'CloudWorks', tier: 'Silver', budget: 250000, benefits: ['Booth', 'Logo placement', 'Social media'], contactEmail: 'cloudworks@demo.com' },
  ]);
  console.log(`Seeded ${sponsors.length} sponsors`);

  const in20days = new Date(Date.now() + 20 * 86400000);
  const in35days = new Date(Date.now() + 35 * 86400000);

  const events = await Event.create([
    {
      name: 'AI & Future Tech Summit', category: 'Conference', organizer: organizer._id,
      description: 'A flagship summit exploring artificial intelligence, generative models, and the future of human-computer interaction.',
      coverImage: img.conf, date: in20days, time: '09:00', registrationDeadline: in20days,
      location: 'Hyderabad', venue: venues[0]._id, venueConfirmed: true,
      speakers: [speakers[0]._id, speakers[1]._id], speakerConfirmed: true,
      sponsors: [{ sponsor: sponsors[0]._id, tier: 'Gold' }], sponsorConfirmed: true,
      tickets: [
        { name: 'General', price: 999, capacity: 300, booked: 12 },
        { name: 'VIP', price: 2499, capacity: 150, booked: 4 },
        { name: 'Premium', price: 4999, capacity: 50, booked: 1 },
      ],
      schedule: [
        { time: '09:00', title: 'Keynote: The AI Era', speakerName: 'Dr. Anika Rao', room: 'Main Hall' },
        { time: '11:00', title: 'Generative Models Panel', speakerName: 'Vikram Sethi', room: 'Hall A' },
      ],
      capacity: 500, booked: 17, revenue: 12000 + 9996 + 4999,
      status: 'PUBLISHED', isPublished: true,
    },
    {
      name: 'Hyderabad Startup Meetup', category: 'Networking', organizer: organizer._id,
      description: 'Connect with founders, investors, and builders across the Hyderabad startup ecosystem.',
      coverImage: img.network, date: in20days, time: '18:00', registrationDeadline: in20days,
      location: 'Hyderabad', venueConfirmed: false, speakerConfirmed: true, speakers: [speakers[2]._id],
      tickets: [{ name: 'Free', price: 0, capacity: 200, booked: 5 }],
      schedule: [{ time: '18:00', title: 'Fireside Chat', speakerName: 'Priya Nair', room: 'Lounge' }],
      capacity: 200, booked: 5, status: 'PUBLISHED', isPublished: true,
    },
    {
      name: 'India AI Hackathon', category: 'Hackathon', organizer: organizer._id,
      description: '48 hours of building with the latest AI tools. Prizes worth ₹10 lakh.',
      coverImage: img.hack, date: in35days, time: '08:00', registrationDeadline: in35days,
      location: 'Bengaluru', venue: venues[1]._id, venueConfirmed: true,
      speakerConfirmed: false,
      tickets: [{ name: 'Participant', price: 499, capacity: 300, booked: 0 }],
      schedule: [{ time: '08:00', title: 'Opening & Rules', speakerName: 'Vikram Sethi', room: 'Arena' }],
      capacity: 300, status: 'DRAFT', isPublished: false,
    },
  ]);
  console.log(`Seeded ${events.length} events (2 published, 1 draft)`);

  await notifyDemo(attendee, organizer);

  console.log('\nSeed complete. Demo logins (password: demo123):');
  users.forEach((u) => console.log(`  ${u.role.padEnd(12)} -> ${u.email}`));
  process.exit(0);
};

async function notifyDemo(attendee, organizer) {
  await require('../models/Notification').create([
    { recipient: attendee._id, text: 'Welcome to EventForge! Explore events near you.', type: 'system' },
    { recipient: organizer._id, text: 'Welcome to your organizer dashboard.', type: 'system' },
  ]);
}

if (process.argv.includes('--destroy')) {
  connectDB().then(destroy);
} else {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
