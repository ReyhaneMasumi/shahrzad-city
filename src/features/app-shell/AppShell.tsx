'use client';

import { useRef } from 'react';
import { AppHeader } from '@/features/app-header';
import { AppFooter } from '@/features/app-footer';
import { BottomNav } from '@/features/bottom-nav';
import { BackToTop } from '@/features/back-to-top';
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
  const { scrolled, nearBottom, scrollToTop } = useShellScroll(scrollRef);

  return (
    <div className="shell-root">
      <AppHeader scrolled={scrolled} />

      <div className="shell-viewport">
        <main
          ref={scrollRef}
          data-testid="shell-scroll"
          data-scrolled={scrolled ? 'true' : undefined}
          className="shell-main"
        >
          <div aria-hidden data-sentinel="top" className="shell-main-top-sentinel" />
          {children}
          <BackToTop onClick={scrollToTop} />
          <div aria-hidden data-sentinel="bottom" className="shell-main-top-sentinel" />
        </main>
      </div>

      <AppFooter revealed={nearBottom} />
      <BottomNav />
    </div>
  );
}
