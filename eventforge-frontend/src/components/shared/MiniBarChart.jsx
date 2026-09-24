import { motion } from 'framer-motion';

export default function MiniBarChart({ data, labelKey = 'label', valueKey = 'value', formatValue = (v) => v }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-2 h-40 pt-6">
      {data.map((d, i) => (
        <div key={d[labelKey] + i} className="flex-1 flex flex-col items-center gap-1.5 relative h-full justify-end">
          <span className="text-[10px] font-bold text-ink-soft absolute -top-0">{formatValue(d[valueKey])}</span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d[valueKey] / max) * 100}%` }}
            transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
            className="w-full rounded-t-lg bg-gradient-to-t from-violet-500 to-amber-400 min-h-[4px]"
          />
          <span className="text-[10px] text-ink-faint">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}
