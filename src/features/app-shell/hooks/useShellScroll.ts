import { useCallback, useEffect, useState, type RefObject } from 'react';
import { useReducedMotion } from '@/shared/hooks';

/**
 * Near the top, the root margin keeps the top sentinel "visible" for the first
 * 120px so the header only shrinks after a deliberate scroll.
 */
const TOP_ROOT_MARGIN = '120px 0px 0px 0px';

export interface ShellScrollState {
  atTop: boolean;
  scrolled: boolean;
  atBottom: boolean;
  scrollToTop: () => void;
}

/**
 * Derives scroll position from two `data-sentinel` markers inside the scroll
 * container `ref`: a top marker (drives `scrolled`/`atTop`) and a bottom marker
 * (drives `atBottom`). Observers are torn down on unmount.
 */
export function useShellScroll(ref: RefObject<HTMLElement | null>): ShellScrollState {
  const reducedMotion = useReducedMotion();
  const [atTop, setAtTop] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (root === null) return;
    const topSentinel = root.querySelector<HTMLElement>('[data-sentinel="top"]');
    const bottomSentinel = root.querySelector<HTMLElement>('[data-sentinel="bottom"]');
    if (topSentinel === null || bottomSentinel === null) return;

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
    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, [ref]);

  const scrollToTop = useCallback(() => {
    ref.current?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [ref, reducedMotion]);

  return { atTop, scrolled, atBottom, scrollToTop };
}
