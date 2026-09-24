import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-6"
    >
      {Icon && (
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-50 grid place-items-center text-violet-400">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="font-display font-bold text-ink">{title}</h3>
      {subtitle && <p className="text-sm text-ink-soft mt-1 max-w-xs mx-auto">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
