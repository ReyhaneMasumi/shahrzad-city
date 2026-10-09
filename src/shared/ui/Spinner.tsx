import { useReducedMotion } from '@/shared/hooks';
import { fa } from '@/shared/i18n/fa';
import type { SpinnerProps } from './Spinner.types';

/** Accessible spinner; rotation stops under `prefers-reduced-motion`. */
export default function Spinner({ className }: SpinnerProps) {
  const reducedMotion = useReducedMotion();
  const ringClasses = [
    'size-5 rounded-full border-2 border-current border-e-transparent',
    reducedMotion ? '' : 'animate-spin',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      role="status"
      className={['inline-flex items-center justify-center text-primary-brand', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden className={ringClasses} />
      <span className="sr-only">{fa.loading}</span>
    </span>
  );
}
