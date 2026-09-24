import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0, className = '' }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`h-1.5 rounded-full bg-violet-50 overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-400"
      />
    </div>
  );
}
