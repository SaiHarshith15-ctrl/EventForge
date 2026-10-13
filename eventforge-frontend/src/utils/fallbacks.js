const make = (label, c1, c2) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/><text x="400" y="240" font-family="Arial,sans-serif" font-size="44" font-weight="700" fill="rgba(255,255,255,0.92)" text-anchor="middle">${label}</text></svg>`
  )}`;

export const FALLBACKS = {
  event: make('EventForge', '#6d4aff', '#fb923c'),
  venue: make('Venue', '#14b8a6', '#6d4aff'),
  avatar: make('Speaker', '#8b5cf6', '#ec4899'),
  logo: make('Sponsor', '#f59e0b', '#6d4aff'),
};