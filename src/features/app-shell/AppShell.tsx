'use client';

import { useRef } from 'react';
import { AppHeader } from '@/features/app-header';
import type { AppShellProps } from './AppShell.types';
import { useShellScroll } from './hooks/useShellScroll';

/**
 * Responsive app frame. The document never scrolls; the shell owns a single
 * inner scroll container per breakpoint (mobile: rounded card overlapping the
 * header; desktop: centered 900px column). Header motion is driven by
 * `useShellScroll` sentinels.
 */
export default function AppShell({ children }: AppShellProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const { scrolled } = useShellScroll(scrollRef);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-surface">
      <AppHeader scrolled={scrolled} />

      <div className="relative min-h-0 flex-1 lg:-mt-12">
        <main
          ref={scrollRef}
          data-testid="shell-scroll"
          className="absolute inset-x-4 top-[152px] bottom-0 overflow-y-auto overscroll-contain rounded-[var(--radius-40)] bg-surface p-3 pb-[92px] lg:static lg:mx-auto lg:h-full lg:w-full lg:max-w-[900px] lg:rounded-none lg:pb-0"
        >
          <div aria-hidden data-sentinel="top" className="block h-px w-full" />
          {children}
          <div aria-hidden data-sentinel="bottom" className="block h-px w-full" />
        </main>
      </div>

      {/*
        Task 7 slots (P6b): the desktop AppFooter (fixed, revealed on `atBottom`)
        and the mobile-only BottomNav + BackToTop render at this root level.
        The mobile bottom-nav height is reserved by `pb-[92px]` on the scroll container.
      */}
    </div>
  );
}
