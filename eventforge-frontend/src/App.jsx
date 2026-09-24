import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSocket } from './hooks/useSocket';
import { DASHBOARD_HOME } from './utils/constants';

import PublicLayout from './components/layout/PublicLayout';
import DashboardShell from './components/layout/DashboardShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppToaster from './components/ui/Toaster';
import AIAssistant from './components/shared/AIAssistant';

import Landing from './pages/public/Landing';
import Discover from './pages/public/Discover';
import EventDetail from './pages/public/EventDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import NotFound from './pages/public/NotFound';

import AttendeeHome from './pages/attendee/AttendeeHome';
import MyTickets from './pages/attendee/MyTickets';
import SavedEvents from './pages/attendee/SavedEvents';
import Profile from './pages/attendee/Profile';

import OrganizerOverview from './pages/organizer/OrganizerOverview';
import MyEvents from './pages/organizer/MyEvents';
import CreateEventWizard from './pages/organizer/CreateEventWizard';
import OrgVenues from './pages/organizer/OrgVenues';
import OrgSpeakers from './pages/organizer/OrgSpeakers';
import OrgSponsors from './pages/organizer/OrgSponsors';
import OrgAnnouncements from './pages/organizer/OrgAnnouncements';
import OrgAnalytics from './pages/organizer/OrgAnalytics';
import EventManage from './pages/organizer/EventManage';

import VenueOverview from './pages/venueOwner/VenueOverview';
import MyVenues from './pages/venueOwner/MyVenues';
import VenueRequests from './pages/venueOwner/VenueRequests';
import VenueEarnings from './pages/venueOwner/VenueEarnings';

import SpeakerProfile from './pages/speaker/SpeakerProfile';
import SpeakerInvitations from './pages/speaker/SpeakerInvitations';
import SpeakerSessions from './pages/speaker/SpeakerSessions';

import SponsorOverview from './pages/sponsor/SponsorOverview';
import SponsorRequests from './pages/sponsor/SponsorRequests';
import SponsorActive from './pages/sponsor/SponsorActive';

import StaffOverview from './pages/staff/StaffOverview';
import StaffScan from './pages/staff/StaffScan';

import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function RoleRedirect() {
  const { user } = useAuthStore();
  return <Navigate to={DASHBOARD_HOME[user?.role] || '/app/home'} replace />;
}

export default function App() {
  const init = useAuthStore((s) => s.init);
  useSocket();

  useEffect(() => { init(); }, [init]);

  return (
    <>
      <AppToaster />
      <AIAssistant />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardShell />}>
            <Route path="/app" element={<RoleRedirect />} />

            <Route path="/app/home" element={<AttendeeHome />} />
            <Route path="/app/tickets" element={<MyTickets />} />
            <Route path="/app/saved" element={<SavedEvents />} />
            <Route path="/app/profile" element={<Profile />} />

            <Route element={<ProtectedRoute roles={['organizer', 'admin']} />}>
              <Route path="/app/overview" element={<OrganizerOverview />} />
              <Route path="/app/my-events" element={<MyEvents />} />
              <Route path="/app/create-event" element={<CreateEventWizard />} />
              <Route path="/app/manage-event/:id" element={<EventManage />} />
              <Route path="/app/org-venues" element={<OrgVenues />} />
              <Route path="/app/org-speakers" element={<OrgSpeakers />} />
              <Route path="/app/org-sponsors" element={<OrgSponsors />} />
              <Route path="/app/org-announcements" element={<OrgAnnouncements />} />
              <Route path="/app/org-analytics" element={<OrgAnalytics />} />
            </Route>

            <Route element={<ProtectedRoute roles={['venue_owner', 'admin']} />}>
              <Route path="/app/venue-overview" element={<VenueOverview />} />
              <Route path="/app/my-venues" element={<MyVenues />} />
              <Route path="/app/venue-requests" element={<VenueRequests />} />
              <Route path="/app/venue-earnings" element={<VenueEarnings />} />
            </Route>

            <Route element={<ProtectedRoute roles={['speaker']} />}>
              <Route path="/app/speaker-profile" element={<SpeakerProfile />} />
              <Route path="/app/speaker-invitations" element={<SpeakerInvitations />} />
              <Route path="/app/speaker-sessions" element={<SpeakerSessions />} />
            </Route>

            <Route element={<ProtectedRoute roles={['sponsor']} />}>
              <Route path="/app/sponsor-overview" element={<SponsorOverview />} />
              <Route path="/app/sponsor-requests" element={<SponsorRequests />} />
              <Route path="/app/sponsor-active" element={<SponsorActive />} />
            </Route>

            <Route element={<ProtectedRoute roles={['staff', 'admin']} />}>
              <Route path="/app/staff-overview" element={<StaffOverview />} />
              <Route path="/app/staff-scan" element={<StaffScan />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/app/admin-overview" element={<AdminOverview />} />
              <Route path="/app/admin-users" element={<AdminUsers />} />
              <Route path="/app/admin-events" element={<AdminEvents />} />
              <Route path="/app/admin-analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
