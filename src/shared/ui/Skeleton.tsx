import type { CSSProperties } from 'react';
import { useReducedMotion } from '@/shared/hooks';
import type { SkeletonProps } from './Skeleton.types';

/**
 * Final-dimension loading placeholder. Size it with `width`/`height` so the
 * placeholder matches the loaded content and never causes layout shift.
 */
export default function Skeleton({ width, height, rounded = false, className }: SkeletonProps) {
  const reducedMotion = useReducedMotion();
  const style: CSSProperties = { width, height };
  const classes = [
    'bg-surface-muted',
    rounded ? 'rounded-12' : '',
    reducedMotion ? '' : 'animate-pulse',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div aria-hidden data-state="loading" className={classes} style={style} />;
}
