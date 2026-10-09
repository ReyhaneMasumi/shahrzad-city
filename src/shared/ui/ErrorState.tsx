import { Warning2 } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Button from './Button';
import Icon from './Icon';
import type { ErrorStateProps } from './ErrorState.types';

/** Error state with a message and a retry action. */
export default function ErrorState({ onRetry, message }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-sm p-xl text-center">
      <Icon icon={Warning2} size={48} className="text-critical" />
      <p className="text-heading-sm text-content-primary">{fa.error.title}</p>
      <p className="text-body-sm text-content-secondary">{message ?? fa.error.message}</p>
      {onRetry === undefined ? null : (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {fa.error.retry}
        </Button>
      )}
    </div>
  );
}
