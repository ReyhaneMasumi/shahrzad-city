import Link from 'next/link';
import Icon from '../Icon/Icon';
import type { TileProps } from './Tile.types';

/**
 * Icon tile: 64px muted circle plus a 12px label. Renders a link when `href`
 * is given (external links keep a native anchor and open in a new tab),
 * otherwise a button.
 */
export default function Tile({
  title,
  icon,
  href,
  onClick,
  external,
  badge,
  className,
}: TileProps) {
  const classes = ['tile-root', className].filter(Boolean).join(' ');

  const content = (
    <>
      <span className="tile-icon-wrap">
        <Icon icon={icon} />
      </span>
      <span className="text-caption">{title}</span>
      {badge === undefined ? null : <span className="tile-badge">{badge}</span>}
    </>
  );

  if (href !== undefined) {
    if (external === true) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
