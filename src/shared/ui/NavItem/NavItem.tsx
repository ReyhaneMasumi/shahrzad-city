import Link from 'next/link';
import Icon from '../Icon';
import type { NavItemProps } from './NavItem.types';

/** Stacked icon + label navigation item; link when `href` is given, otherwise a button. */
export default function NavItem({
  label,
  icon,
  href,
  active = false,
  onClick,
  className,
}: NavItemProps) {
  const classes = [
    'flex min-h-11 min-w-11 flex-col items-center justify-center gap-2xs text-caption',
    active ? 'font-medium text-primary-brand-hover' : 'text-content-secondary',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <Icon icon={icon} size={24} />
      <span>{label}</span>
    </>
  );

  const state = active ? 'active' : 'idle';

  if (href !== undefined) {
    return (
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        data-state={state}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      data-state={state}
      className={classes}
    >
      {content}
    </button>
  );
}
