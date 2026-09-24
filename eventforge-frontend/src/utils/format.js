export const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const fmtDateShort = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export const fmtTime = (t) => t || '';

export const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
