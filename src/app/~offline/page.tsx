import type { Metadata } from 'next';
import { fa } from '@/shared/i18n/fa';

export const metadata: Metadata = {
  title: 'Offline - Shahrzad',
  description: 'You are currently offline',
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
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
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {fa.offline.retry}
      </button>
    </div>
  );
}
