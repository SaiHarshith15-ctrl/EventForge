# EventForge — Backend (MERN)

Node.js + Express + MongoDB backend for **EventForge**, built to power the HTML prototype
(the Operating System & Marketplace for Events). Covers all 7 roles from the prototype —
Attendee, Organizer, Venue Owner, Speaker, Sponsor, Staff, Admin — plus a few extras that
weren't in the demo (real payments, PDF tickets, email notifications, live sockets, reviews).

## Stack

- **Express** — REST API
- **MongoDB / Mongoose** — data
- **JWT (httpOnly cookie + Bearer token)** — auth
- **Socket.io** — real-time notifications & live check-in counters
- **Cloudinary** — image uploads (event covers, venue photos, avatars)
- **Razorpay** — real UPI/card payments (optional — falls back to a simulated payment flow if not configured, so you can run the whole thing without a payment gateway account)
- **Nodemailer** — booking confirmations, invites, password reset emails (optional — logs to console if not configured)
- **PDFKit** — downloadable ticket PDFs with embedded QR code
- **qrcode** — ticket QR generation

## Getting started

```bash
cd eventforge-backend
npm install
cp .env.example .env     # fill in MONGO_URI at minimum
npm run seed              # optional: creates 1 demo user per role + sample events/venues
npm run dev                # starts on http://localhost:5000
```

Everything else in `.env` (Cloudinary, Razorpay, SMTP, OpenAI) is **optional**. The app
degrades gracefully without them:
- No Razorpay keys → booking uses the simulated payment flow (`/api/bookings/simulate-payment`), same as the prototype's "Simulate Payment Success" button.
- No SMTP creds → emails are skipped and logged to the console instead of throwing.
- No OpenAI key → the AI assistant falls back to the built-in rule-based responder (same logic as the frontend prototype, but backed by live DB data).

## Demo accounts (after `npm run seed`)

All passwords: `demo123`

| Role | Email |
|---|---|
| Attendee | attendee@demo.com |
| Organizer | organizer@demo.com |
| Venue Owner | venue@demo.com |
| Speaker | speaker@demo.com |
| Sponsor | sponsor@demo.com |
| Staff | staff@demo.com |
| Admin | admin@demo.com |

## Project structure

```
src/
  config/        # db.js, cloudinary.js
  models/        # User, Event, Venue, Speaker, Sponsor, Booking,
                 # VenueRequest, SpeakerInvite, SponsorRequest,
                 # Notification, CheckIn, Announcement, Review
  middleware/    # auth (JWT), role (RBAC), upload (multer), errorHandler
  controllers/   # one per resource, matches routes/ 1:1
  routes/        # one per resource + index.js mounting them all
  sockets/       # Socket.io init — per-user rooms for live notifications
  utils/         # generateToken, qrGenerator, sendEmail, notify (DB+socket), 
                 # generateInvoicePDF, uploadToCloudinary, ApiError
  seed/          # seed.js — demo data matching the prototype
server.js        # entry point
```

## Connecting your frontend

- Base URL: `http://localhost:5000/api`
- Auth: send `Authorization: Bearer <token>` (returned from `/auth/login` and `/auth/register`), or rely on the httpOnly cookie the API also sets — either works.
- CORS is locked to `CLIENT_URL` in `.env` — set it to your frontend's dev URL (e.g. `http://localhost:5173` for Vite).
- Socket.io: connect to the same origin as the API, passing the JWT: 
  ```js
  const socket = io('http://localhost:5000', { auth: { token } });
  socket.on('notification', (n) => { /* new notification pushed in real time */ });
  ```

## API reference

All responses follow `{ success, message?, data, pagination? }`. Errors follow `{ success: false, message }`.

### Auth — `/api/auth`
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/register` | Public | body: name, email, password, role (attendee\|organizer\|venue_owner\|speaker\|sponsor\|staff\|admin) |
| POST | `/login` | Public | body: email, password |
| POST | `/logout` | Private | |
| GET | `/me` | Private | current user |
| PUT | `/update-password` | Private | |
| POST | `/forgot-password` | Public | emails reset link |
| PUT | `/reset-password/:token` | Public | |

### Users — `/api/users`
| Method | Route | Access |
|---|---|---|
| PUT | `/profile` | Private |
| PUT | `/avatar` | Private (multipart `avatar` field) |
| GET / PUT | `/saved-events`, `/saved-events/:eventId` | Private — wishlist toggle |
| GET | `/` | Admin — search/filter/paginate |
| GET | `/:id` | Admin |
| PUT | `/:id/suspend` | Admin |
| PUT | `/:id/role` | Admin |
| DELETE | `/:id` | Admin |

### Events — `/api/events`
| Method | Route | Access |
|---|---|---|
| GET | `/` | Public — `?search=&category=&location=&price=free&page=&limit=` |
| GET | `/:id` | Public — full detail incl. reviews |
| POST | `/` | Organizer/Admin — creates a DRAFT |
| PUT | `/:id` | Owner/Admin |
| PUT | `/:id/cover` | Owner/Admin — multipart `image` |
| GET | `/:id/readiness` | Owner/Admin — checklist used before publish |
| PUT | `/:id/publish` \| `/:id/unpublish` \| `/:id/cancel` | Owner/Admin |
| DELETE | `/:id` | Owner/Admin |
| POST / DELETE | `/:id/schedule`, `/:id/schedule/:itemId` | Owner/Admin |
| POST | `/:id/reviews` | Attendee who booked |

### Venues — `/api/venues`, Venue requests — `/api/venue-requests`
Standard CRUD for venue owner listings; organizers request a venue for their event,
the owner accepts/rejects/requests changes — mirrors the prototype's flow exactly.

### Speakers — `/api/speakers`, Invites — `/api/speaker-invites`
Speakers manage their own profile + availability; organizers invite them to a session,
speakers accept/reject.

### Sponsors — `/api/sponsors`, Requests — `/api/sponsor-requests`
Sponsors manage their profile/tier/budget; can request to sponsor an event, or organizers
can be extended to invite sponsors the same way (symmetric to speaker invites).

### Bookings / Tickets — `/api/bookings`
| Method | Route | Notes |
|---|---|---|
| POST | `/create-order` | Creates a Razorpay order (or returns `simulated: true` if not configured) |
| POST | `/verify-payment` | Verifies Razorpay signature, confirms booking, generates QR |
| POST | `/simulate-payment` | Instantly confirms booking — used for free tickets and demo/dev mode |
| GET | `/my` | My tickets |
| GET | `/:id` | Ticket detail (owner, event organizer, staff, or admin) |
| GET | `/:id/pdf` | Downloads a PDF ticket with embedded QR |
| PUT | `/:id/cancel` | Cancels + frees up capacity |
| GET | `/event/:eventId` | Organizer/staff/admin — attendee list for an event |

### Notifications — `/api/notifications`
GET list (+ unread count), PUT `/:id/read`, PUT `/read-all`. Pushed live via Socket.io too.

### Check-ins — `/api/checkins`
POST `/scan` (body: `bookingRef`, optional `sessionTitle` for per-session attendance),
GET `/event/:eventId` for stats — powers the staff QR scanner screen.

### Announcements — `/api/announcements`
Organizer broadcasts a message to every ticket holder of an event (in-app notification + email).

### Analytics — `/api/analytics`
`/organizer`, `/venue-owner`, `/sponsor`, `/admin` — role-scoped dashboards (registrations,
revenue, top events, monthly trends, platform-wide stats for admin).

### AI Assistant — `/api/ai/chat`
POST `{ message, history? }` → `{ reply, events }`. Uses OpenAI if `OPENAI_API_KEY` is set
(grounded in your live published events), otherwise the same rule-based logic as the
prototype's chat widget, querying real data instead of the hardcoded demo array.

### Reviews — `/api/reviews`
GET `/event/:eventId`, DELETE `/:id` (author or admin). Creating a review happens via
`POST /api/events/:id/reviews` (must have a booking for that event).

## Extra features added beyond the HTML prototype

- Real payments via Razorpay (order + signature verification) alongside the simulated flow
- Downloadable PDF tickets with embedded QR (`GET /bookings/:id/pdf`)
- Email notifications (booking confirmation, invites, announcements, password reset)
- Live updates over Socket.io (notifications, check-in counts) instead of polling
- Event reviews & ratings
- Wishlist / saved events
- Password reset flow
- Role-based access control + account suspension (admin)
- Rate limiting, Helmet, Mongo sanitize, XSS clean for security
- Pagination + full-text search on events/venues/speakers/users
