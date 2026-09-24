export function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-semibold text-ink mb-1.5">{label}</span>}
      <input
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-ink placeholder:text-ink-faint transition-colors
          ${error ? 'border-red-400' : 'border-line focus:border-violet-400'}
          focus:outline-none focus:ring-4 focus:ring-violet-100 ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-semibold text-ink mb-1.5">{label}</span>}
      <textarea
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-ink placeholder:text-ink-faint transition-colors min-h-[100px] resize-y
          ${error ? 'border-red-400' : 'border-line focus:border-violet-400'}
          focus:outline-none focus:ring-4 focus:ring-violet-100 ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-semibold text-ink mb-1.5">{label}</span>}
      <select
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-ink transition-colors
          ${error ? 'border-red-400' : 'border-line focus:border-violet-400'}
          focus:outline-none focus:ring-4 focus:ring-violet-100 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
