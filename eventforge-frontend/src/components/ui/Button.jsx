import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-ink text-white hover:bg-violet-700 shadow-soft',
  accent: 'bg-amber-500 text-white hover:bg-amber-600 shadow-soft',
  outline: 'bg-transparent border border-line text-ink hover:border-violet-400 hover:text-violet-600',
  ghost: 'bg-transparent text-ink-soft hover:bg-violet-50 hover:text-ink',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  success: 'bg-mint-500 text-white hover:bg-mint-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-xl gap-2',
};

export default function Button({
  children, variant = 'primary', size = 'md', className = '', icon: Icon,
  loading = false, disabled = false, type = 'button', ...props
}) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: disabled || loading ? 0 : -1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </motion.button>
  );
}
