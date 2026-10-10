'use client';

import { fa } from '@/shared/i18n/fa';
import { ErrorState } from '@/shared/ui';

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState message={fa.error.message} onRetry={reset} />;
}
