export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-surface border border-line rounded-2xl transition-all duration-200
        ${hover ? 'hover:shadow-lift hover:-translate-y-0.5' : 'shadow-soft'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
