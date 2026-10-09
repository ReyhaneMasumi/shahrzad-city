import Icon from '../Icon';
import type { TileProps } from './Tile.types';

/**
 * Icon tile: 64px muted circle plus a 12px label. Renders a link when `href`
 * is given, otherwise a button; `external` links open in a new tab.
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
  const classes = [
    'flex min-h-11 min-w-11 flex-col items-center gap-xs text-center text-content-primary',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="flex size-16 items-center justify-center rounded-full bg-surface-muted">
        <Icon icon={icon} />
      </span>
      <span className="text-caption">{title}</span>
      {badge === undefined ? null : (
        <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-caption text-content-secondary">
          {badge}
        </span>
      )}
    </>
  );

  if (href !== undefined) {
    return (
      <a
        href={href}
        target={external === true ? '_blank' : undefined}
        rel={external === true ? 'noopener noreferrer' : undefined}
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
