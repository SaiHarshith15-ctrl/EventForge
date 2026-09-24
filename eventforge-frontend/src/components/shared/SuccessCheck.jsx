import { motion } from 'framer-motion';

export default function SuccessCheck({ size = 72 }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 14, stiffness: 200 }}
      className="mx-auto grid place-items-center rounded-full bg-mint-50"
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg width={size} height={size} viewBox="0 0 52 52">
        <motion.circle
          cx="26" cy="26" r="24" fill="none" stroke="#17C3A2" strokeWidth="3"
          strokeDasharray="151"
          initial={{ strokeDashoffset: 151 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <motion.path
          fill="none" stroke="#17C3A2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          d="M14 27l7 7 17-17"
          strokeDasharray="40"
          initial={{ strokeDashoffset: 40 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  );
}
