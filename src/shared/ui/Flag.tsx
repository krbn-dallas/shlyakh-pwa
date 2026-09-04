/**
 * Real flag artwork from flagcdn (free, CORS-open, cached a month by the CDN
 * and by our service worker) instead of an emoji, which renders differently on
 * every platform and not at all on some.
 */
interface Props { code?: string; size?: number; title?: string }

export function Flag({ code, size = 18, title }: Props) {
  if (!code) return null;
  const cc = code.toLowerCase();
  const w = Math.round(size * 4 / 3);
  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      srcSet={`https://flagcdn.com/w40/${cc}.png 1x, https://flagcdn.com/w80/${cc}.png 2x`}
      width={w}
      height={size}
      alt={title ?? cc.toUpperCase()}
      title={title}
      loading="lazy"
      decoding="async"
      style={{
        width: w, height: size, objectFit: 'cover',
        borderRadius: 3, flex: `0 0 ${w}px`,
        boxShadow: '0 0 0 1px rgb(0 0 0/.12)',
      }}
    />
  );
}

/** country → ISO code used by the flag CDN. */
export const FLAG_OF: Record<string, string> = { ua: 'ua', md: 'md', ma: 'ma' };
