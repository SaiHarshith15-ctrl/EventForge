import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center text-center px-5">
      <div>
        <Ticket className="w-10 h-10 text-violet-300 mx-auto mb-4" />
        <h1 className="font-display font-bold text-5xl text-ink">404</h1>
        <p className="text-ink-soft mt-2">This ticket doesn't exist. Let's get you back on track.</p>
        <Link to="/"><Button className="mt-6">Back home</Button></Link>
      </div>
    </div>
  );
}
