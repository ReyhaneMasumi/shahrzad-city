import Empty from '../Empty';
import ErrorState from '../ErrorState';
import Skeleton from '../Skeleton';
import type { SectionStatesProps } from './SectionStates.types';

/** Single switch point for a section's loading / error / empty / success states. */
export default function SectionStates({
  status,
  skeleton,
  onRetry,
  emptyMessage,
  emptyAction,
  children,
}: SectionStatesProps) {
  return (
    <div data-state={status}>
      {status === 'loading' ? (skeleton ?? <Skeleton />) : null}
      {status === 'error' ? <ErrorState onRetry={onRetry} /> : null}
      {status === 'empty' ? <Empty message={emptyMessage} action={emptyAction} /> : null}
      {status === 'success' ? children : null}
    </div>
  );
}
