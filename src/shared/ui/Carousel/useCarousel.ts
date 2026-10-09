import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks';
import type { UseCarouselParams, UseCarouselResult } from './Carousel.types';

function clamp(index: number, count: number): number {
  return Math.min(Math.max(index, 0), Math.max(count - 1, 0));
}

/**
 * Scroll-snap carousel state. The active slide is tracked with an
 * IntersectionObserver over the slides (never a scroll handler), and
 * navigation scrolls with `inline: 'start'` so RTL works natively.
 */
export function useCarousel({ count, initialIndex = 0 }: UseCarouselParams): UseCarouselResult {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const slideRefs = useRef<(HTMLLIElement | null)[]>([]);
  const initializedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(() => clamp(initialIndex, count));

  // Land on the initial slide once (also fixes the RTL start position).
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    slideRefs.current[clamp(initialIndex, count)]?.scrollIntoView({
      behavior: 'auto',
      inline: 'start',
    });
  }, [count, initialIndex]);

  useEffect(() => {
    const ratios = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => ratios.set(entry.target, entry.intersectionRatio));
        let bestIndex = -1;
        let bestRatio = 0;
        for (let index = 0; index < count; index += 1) {
          const slide = slideRefs.current[index];
          const ratio = slide ? (ratios.get(slide) ?? 0) : 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = index;
          }
        }
        if (bestIndex >= 0) setActiveIndex(bestIndex);
      },
      { root: trackRef.current, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    for (let index = 0; index < count; index += 1) {
      const slide = slideRefs.current[index];
      if (slide) observer.observe(slide);
    }
    return () => observer.disconnect();
  }, [count]);

  const goTo = useCallback(
    (index: number) => {
      const target = clamp(index, count);
      if (target === activeIndex) return;
      setActiveIndex(target);
      slideRefs.current[target]?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        inline: 'start',
      });
    },
    [activeIndex, count, reducedMotion]
  );

  const next = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
  const prev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

  return {
    activeIndex,
    goTo,
    next,
    prev,
    isAtStart: activeIndex === 0,
    isAtEnd: activeIndex >= count - 1,
    trackRef,
    slideRefs,
  };
}
