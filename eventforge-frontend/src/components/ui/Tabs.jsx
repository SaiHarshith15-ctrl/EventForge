import { motion } from 'framer-motion';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-line overflow-x-auto scrollbar-thin">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`relative px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
            active === t.value ? 'text-violet-600' : 'text-ink-soft hover:text-ink'
          }`}
        >
          {t.label}
          {active === t.value && (
            <motion.div layoutId="tab-underline" className="absolute left-0 right-0 -bottom-px h-0.5 bg-violet-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
