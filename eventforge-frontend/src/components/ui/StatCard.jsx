import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

export default function StatCard({ icon: Icon, label, value, prefix = '', trend, tone = 'violet' }) {
  const isNumeric = typeof value === 'number';
  const count = useCountUp(isNumeric ? value : 0);
  const tones = {
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    mint: 'bg-mint-50 text-mint-600',
    ink: 'bg-ink/5 text-ink',
  };
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-surface border border-line rounded-2xl p-5 shadow-soft"
    >
      <div className={`w-10 h-10 rounded-xl grid place-items-center ${tones[tone]}`}>
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <div className="font-display font-bold text-2xl text-ink mt-3 tabular-nums">
        {prefix}{isNumeric ? count.toLocaleString('en-IN') : value}
      </div>
      <div className="text-xs text-ink-soft mt-0.5">{label}</div>
      {trend && <div className="text-xs font-semibold text-mint-600 mt-2">{trend}</div>}
    </motion.div>
  );
}
