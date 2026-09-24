# EventForge Frontend

React + Vite + Tailwind frontend for EventForge, a multi-role events marketplace/OS.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL / VITE_SOCKET_URL at your backend
npm run dev
```

## Roles

Attendee, Organizer, Venue Owner, Speaker, Sponsor, Staff, Admin — each gets its own
dashboard (see `src/pages/<role>/` and `src/utils/constants.js` → `NAV_BY_ROLE`).

Built against the `eventforge-backend` API (auth, events, venues, speakers, sponsors,
bookings, checkins, announcements, analytics, notifications, ai, users, reviews).
