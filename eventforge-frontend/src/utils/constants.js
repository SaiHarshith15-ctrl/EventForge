export const ROLES = [
  { value: 'attendee', label: 'Attendee', blurb: 'Discover and book events' },
  { value: 'organizer', label: 'Organizer', blurb: 'Create and run events' },
  { value: 'venue_owner', label: 'Venue Owner', blurb: 'List and rent your venue' },
  { value: 'speaker', label: 'Speaker', blurb: 'Get invited to speak' },
  { value: 'sponsor', label: 'Sponsor', blurb: 'Sponsor events that fit your brand' },
  { value: 'staff', label: 'Event Staff', blurb: 'Run check-ins on event day' },
  { value: 'admin', label: 'Admin', blurb: 'Platform administration' },
];

export const CATEGORIES = [
  'Conference', 'Hackathon', 'Workshop', 'Exhibition', 'Concert',
  'Wedding', 'Networking', 'Corporate', 'College Event', 'Other',
];

export const CITIES = ['Hyderabad', 'Mumbai', 'Bengaluru', 'Delhi', 'Chennai'];

export const NAV_BY_ROLE = {
  attendee: [
    { to: '/app/home', label: 'Home', icon: 'Home' },
    { to: '/discover', label: 'Discover Events', icon: 'Search' },
    { to: '/app/tickets', label: 'My Tickets', icon: 'Ticket' },
    { to: '/app/saved', label: 'Saved Events', icon: 'Heart' },
    { to: '/app/profile', label: 'Profile', icon: 'User' },
  ],
  organizer: [
    { to: '/app/overview', label: 'Overview', icon: 'LayoutGrid' },
    { to: '/app/my-events', label: 'My Events', icon: 'Calendar' },
    { to: '/app/create-event', label: 'Create Event', icon: 'PlusCircle' },
    { to: '/app/org-venues', label: 'Venues', icon: 'Building2' },
    { to: '/app/org-speakers', label: 'Speakers', icon: 'Mic2' },
    { to: '/app/org-sponsors', label: 'Sponsors', icon: 'Award' },
    { to: '/app/org-announcements', label: 'Announcements', icon: 'Megaphone' },
    { to: '/app/org-analytics', label: 'Analytics', icon: 'BarChart3' },
  ],
  venue_owner: [
    { to: '/app/venue-overview', label: 'Overview', icon: 'LayoutGrid' },
    { to: '/app/my-venues', label: 'My Venues', icon: 'Building2' },
    { to: '/app/venue-requests', label: 'Booking Requests', icon: 'Bell' },
    { to: '/app/venue-earnings', label: 'Earnings', icon: 'Wallet' },
  ],
  speaker: [
    { to: '/app/speaker-profile', label: 'Profile', icon: 'User' },
    { to: '/app/speaker-invitations', label: 'Invitations', icon: 'Bell' },
    { to: '/app/speaker-sessions', label: 'Confirmed Sessions', icon: 'Calendar' },
  ],
  sponsor: [
    { to: '/app/sponsor-overview', label: 'Overview', icon: 'LayoutGrid' },
    { to: '/discover', label: 'Discover Events', icon: 'Search' },
    { to: '/app/sponsor-requests', label: 'Requests', icon: 'Bell' },
    { to: '/app/sponsor-active', label: 'Active Sponsorships', icon: 'Award' },
  ],
  staff: [
    { to: '/app/staff-overview', label: 'Overview', icon: 'LayoutGrid' },
    { to: '/app/staff-scan', label: 'QR Check-In', icon: 'ScanLine' },
  ],
  admin: [
    { to: '/app/admin-overview', label: 'Overview', icon: 'LayoutGrid' },
    { to: '/app/admin-users', label: 'Users', icon: 'Users' },
    { to: '/app/admin-events', label: 'Events', icon: 'Calendar' },
    { to: '/app/admin-analytics', label: 'Reports', icon: 'BarChart3' },
  ],
};

export const DASHBOARD_HOME = {
  attendee: '/app/home',
  organizer: '/app/overview',
  venue_owner: '/app/venue-overview',
  speaker: '/app/speaker-profile',
  sponsor: '/app/sponsor-overview',
  staff: '/app/staff-overview',
  admin: '/app/admin-overview',
};
