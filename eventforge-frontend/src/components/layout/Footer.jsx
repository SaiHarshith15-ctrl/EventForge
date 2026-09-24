import { Ticket } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink text-violet-200 mt-24">
      <div className="max-w-7xl mx-auto px-5 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 font-display font-bold text-lg text-white">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 grid place-items-center">
              <Ticket className="w-4 h-4" />
            </span>
            EventForge
          </div>
          <p className="text-sm mt-3 max-w-xs text-violet-300">The operating system & marketplace for events — plan, discover, book, and experience.</p>
        </div>
        <div>
          <div className="text-xs font-bold text-white uppercase tracking-wide mb-3">Platform</div>
          <ul className="space-y-2 text-sm">
            <li>Discover Events</li><li>Create an Event</li><li>List a Venue</li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold text-white uppercase tracking-wide mb-3">Company</div>
          <ul className="space-y-2 text-sm"><li>About</li><li>Support</li><li>Terms</li></ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs text-violet-400 py-5">
        © {new Date().getFullYear()} EventForge. Built as a full-stack demo project.
      </div>
    </footer>
  );
}
