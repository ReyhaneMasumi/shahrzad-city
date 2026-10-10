'use client';

import { fa } from '@/shared/i18n/fa';

export default function OfflinePage() {
  return (
    <div className="page-center-lg">
      <svg
        className="h-16 w-16 text-neutral-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <h1 className="text-xl font-semibold text-neutral-900">{fa.offline.title}</h1>
      <p className="text-neutral-600 max-w-md">{fa.offline.message}</p>
      <button onClick={() => window.location.reload()} className="btn-primary-action">
        {fa.offline.retry}
      </button>
    </div>
  );
}
