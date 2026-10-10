'use client';

import { fa } from '@/shared/i18n/fa';
import { ErrorState } from '@/shared/ui';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <title>{fa.error.title}</title>
      </head>
      <body>
        <ErrorState message={fa.error.message} onRetry={reset} />
      </body>
    </html>
  );
}
