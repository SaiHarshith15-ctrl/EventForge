# EventForge Frontend

React + Vite + Tailwind frontend for **EventForge** — a multi-role events
marketplace/OS with dashboards for Attendees, Organizers, Venue Owners,
Speakers, Sponsors, Staff, and Admins.

Built against the `eventforge-backend` API (auth, events, venues, speakers,
sponsors, bookings, checkins, announcements, analytics, notifications, ai,
users, reviews).

---

## 1. Local setup

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

Runs on `http://localhost:5173` by default.

## 2. Environment variables (`.env`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | Yes | Your backend's REST base URL, e.g. `http://localhost:5000/api` in dev, or `https://your-backend.onrender.com/api` in production. |
| `VITE_SOCKET_URL` | Yes | Your backend's Socket.io URL (usually the same host as the API, without `/api`), e.g. `http://localhost:5000`. Powers the live notification bell. |
| `VITE_RAZORPAY_KEY_ID` | Optional | Your Razorpay **key id** (public, safe in frontend — e.g. `rzp_test_xxxxxxxx`). Only used as a fallback; normally the checked-out key comes from the backend's `/bookings/create-order` response. |

Never put `RAZORPAY_KEY_SECRET` or any other secret in this file — secrets
stay backend-only.

## 3. Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally to sanity-check it
```

## 4. Deploying

### Vercel
This repo includes a `vercel.json` that rewrites every route to
`index.html`, which is required for a client-side-routed React app —
without it, refreshing a deep link like `/app/tickets` or `/events/:id`
returns a 404 because Vercel looks for a matching file/route that doesn't
exist on the server.

Steps:
1. Import the repo/folder into Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build`, Output directory: `dist`.
4. Add the environment variables from the table above under
   **Project Settings → Environment Variables**.
5. Redeploy after adding env vars (Vercel doesn't hot-reload them into an
   existing build).

### Netlify
Same underlying issue — add a `public/_redirects` file containing:
```
/*  /index.html  200
```

### Any other static host (Render, S3+CloudFront, nginx, etc.)
Configure a fallback / rewrite rule so any unmatched path serves
`index.html` with a 200 status, not a 404. On nginx this is typically:
```
location / {
  try_files $uri $uri/ /index.html;
}
```

## 5. Razorpay payments

The booking flow (`src/components/shared/BookingModal.jsx`) calls:
- `POST /bookings/create-order` — backend decides: free ticket, Razorpay
  not configured (dev/demo fallback), or a real Razorpay order.
- Razorpay Checkout opens in a popup for paid tickets.
- `POST /bookings/verify-payment` — backend verifies the signature and
  finalizes the booking.

To test payments:
- Use **test mode** keys (`rzp_test_...`) on the backend.
- Make sure **UPI** (and any other methods you want) are enabled under
  Razorpay Dashboard → Settings → Payment Methods — Checkout only shows
  methods that are actually enabled on the account.
- Test UPI success/failure with the fake VPAs `success@razorpay` and
  `failure@razorpay`.

## 6. AI Assistant

The floating assistant (`src/components/shared/AIAssistant.jsx`) calls
`POST /ai/chat` with `{ message, history }` and expects back
`{ data: { reply, events } }`. Which model answers is entirely a backend
decision (`aiController.js`) — the frontend has no model-specific code.

## 7. Roles & navigation

Role → default landing page and sidebar links are defined in
`src/utils/constants.js` (`DASHBOARD_HOME`, `NAV_BY_ROLE`). Add a new role
or nav item there; the sidebar and post-login redirect pick it up
automatically.

## 8. Known gaps / still to wire up

- Real file upload UI for event cover images / venue photos / avatars
  (the API calls exist in `src/api/*.api.js`, but the forms currently use
  plain text/URL fields, not a file picker).
- Socket.io notification events need to be `emit`-ed from the backend for
  the bell to update live (booking confirmations, request responses, etc.)
- Analytics dashboards assume specific response shapes (e.g.
  `bookingsByDay`, `topEvents`, `usersByRole`) — verify your
  `analyticsController.js` returns matching keys, or charts will render
  empty states instead of erroring.