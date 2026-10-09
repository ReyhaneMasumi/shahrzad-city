'use client';

import { fa } from '@/shared/i18n/fa';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold">{fa.error.title}</h1>
        <p className="text-base">{fa.error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-neutral-900 px-4 py-2 text-white"
        >
          {fa.error.retry}
        </button>
      </body>
    </html>
  );
}
