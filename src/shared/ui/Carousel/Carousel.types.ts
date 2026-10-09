import type { ReactNode, RefObject } from 'react';

export interface CarouselProps {
  items: ReactNode[];
  ariaLabel: string;
  className?: string;
  initialIndex?: number;
}

export interface UseCarouselParams {
  count: number;
  initialIndex?: number;
}

export interface UseCarouselResult {
  activeIndex: number;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  isAtStart: boolean;
  isAtEnd: boolean;
  trackRef: RefObject<HTMLUListElement | null>;
  slideRefs: RefObject<(HTMLLIElement | null)[]>;
}
