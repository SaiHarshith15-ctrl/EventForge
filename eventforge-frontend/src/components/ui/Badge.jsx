const styles = {
  neutral: 'bg-violet-50 text-ink-soft',
  violet: 'bg-violet-100 text-violet-700',
  amber: 'bg-amber-100 text-amber-700',
  mint: 'bg-mint-100 text-mint-600',
  red: 'bg-red-50 text-red-600',
  ink: 'bg-ink text-white',
};

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${styles[tone]} ${className}`}>
      {children}
    </span>
  );
}
