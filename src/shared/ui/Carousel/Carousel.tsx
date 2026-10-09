import { ArrowLeft2, ArrowRight2 } from 'iconsax-react';
import type { KeyboardEvent } from 'react';
import { fa } from '@/shared/i18n/fa';
import Button from '../Button';
import Icon from '../Icon';
import type { CarouselProps } from './Carousel.types';
import { useCarousel } from './useCarousel';

/**
 * RTL-first scroll-snap carousel: labelled region, per-slide labels,
 * prev/next arrows disabled at the ends, and bullet navigation.
 */
export default function Carousel({ items, ariaLabel, className, initialIndex = 0 }: CarouselProps) {
  const { activeIndex, goTo, next, prev, isAtStart, isAtEnd, trackRef, slideRefs } = useCarousel({
    count: items.length,
    initialIndex,
  });

  const arrowClasses = 'absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface';

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft' && !isAtEnd) {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowRight' && !isAtStart) {
      event.preventDefault();
      prev();
    }
  };

  return (
    <section
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={['relative flex flex-col gap-sm', className].filter(Boolean).join(' ')}
    >
      <div className="relative">
        <ul ref={trackRef} className="flex snap-x snap-mandatory overflow-x-auto">
          {items.map((item, index) => (
            <li
              key={index}
              ref={(element) => {
                slideRefs.current[index] = element;
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={fa.carousel.slideLabel(index + 1, items.length)}
              className="w-full shrink-0 snap-start"
            >
              {item}
            </li>
          ))}
        </ul>
        <Button
          variant="secondary"
          size="sm"
          aria-label={fa.carousel.previousSlide}
          disabled={isAtStart}
          onClick={prev}
          className={`start-0 ${arrowClasses}`}
        >
          <Icon icon={ArrowLeft2} size={20} className="rtl:-scale-x-100" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          aria-label={fa.carousel.nextSlide}
          disabled={isAtEnd}
          onClick={next}
          className={`end-0 ${arrowClasses}`}
        >
          <Icon icon={ArrowRight2} size={20} className="rtl:-scale-x-100" />
        </Button>
      </div>
      <ul className="flex items-center justify-center">
        {items.map((_, index) => (
          <li key={index}>
            <button
              type="button"
              aria-label={fa.carousel.goToSlide(index + 1)}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => goTo(index)}
              className="flex min-h-11 min-w-11 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={[
                  'block h-2.5 rounded-full',
                  index === activeIndex ? 'w-5 bg-primary-brand' : 'w-2.5 bg-content-tertiary',
                ].join(' ')}
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
