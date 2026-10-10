import { useCallback, useEffect, useState, type RefObject } from 'react';
import { useReducedMotion } from '@/shared/hooks';

/**
 * Near the top, the root margin keeps the top sentinel "visible" for the first
 * 120px so the header only shrinks after a deliberate scroll.
 */
const TOP_ROOT_MARGIN = '120px 0px 0px 0px';
const FOOTER_HEIGHT = 278; // px - footer height for reveal trigger

export interface ShellScrollState {
  atTop: boolean;
  scrolled: boolean;
  atBottom: boolean;
  nearBottom: boolean; // when remaining scroll <= footer height
  scrollToTop: () => void;
}

/**
 * Derives scroll position from two `data-sentinel` markers inside the scroll
 * container `ref`: a top marker (drives `scrolled`/`atTop`) and a bottom marker
 * (drives `atBottom`). Also detects `nearBottom` when remaining scroll <= footer height.
 * Observers are torn down on unmount.
 */
export function useShellScroll(ref: RefObject<HTMLElement | null>): ShellScrollState {
  const reducedMotion = useReducedMotion();
  const [atTop, setAtTop] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [nearBottom, setNearBottom] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (root === null) return;
    const topSentinel = root.querySelector<HTMLElement>('[data-sentinel="top"]');
    const bottomSentinel = root.querySelector<HTMLElement>('[data-sentinel="bottom"]');
    if (topSentinel === null || bottomSentinel === null) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('useShellScroll: scroll sentinels not found inside the scroll container');
      }
      return;
    }

    const topObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry === undefined) return;
        setScrolled(!entry.isIntersecting);
        setAtTop(entry.isIntersecting && root.scrollTop <= 1);
      },
      { root, rootMargin: TOP_ROOT_MARGIN }
    );
    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry !== undefined) setAtBottom(entry.isIntersecting);
      },
      { root }
    );

    topObserver.observe(topSentinel);
    bottomObserver.observe(bottomSentinel);

    // Check nearBottom on scroll
    const handleScroll = () => {
      const root = ref.current;
      if (!root) return;
      const { scrollTop, scrollHeight, clientHeight } = root;
      const remaining = scrollHeight - scrollTop - clientHeight;
      setNearBottom(remaining <= FOOTER_HEIGHT);
    };
    root.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
      root.removeEventListener('scroll', handleScroll);
    };
  }, [ref]);

  const scrollToTop = useCallback(() => {
    ref.current?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [ref, reducedMotion]);

  return { atTop, scrolled, atBottom, nearBottom, scrollToTop };
}
