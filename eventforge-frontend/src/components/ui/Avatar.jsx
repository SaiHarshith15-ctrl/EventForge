import { initials } from '../../utils/format';

const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl', xl: 'w-20 h-20 text-2xl' };

export default function Avatar({ src, name, size = 'md', className = '' }) {
  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ${className}`} />;
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-violet-400 to-violet-600 text-white flex items-center justify-center font-bold shrink-0 ${className}`}>
      {initials(name || '?')}
    </div>
  );
}
