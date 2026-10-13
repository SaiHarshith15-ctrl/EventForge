import { useEffect, useState } from 'react';
import { FALLBACKS } from '../../utils/fallbacks';

export default function SafeImage({ src, kind = 'event', alt = '', className = '', ...rest }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  return (
    <img
      src={!src || failed ? FALLBACKS[kind] : src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}