import { ArrowLeft2, ArrowRight2 } from 'iconsax-react';
import type { KeyboardEvent } from 'react';
import { fa } from '@/shared/i18n/fa';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
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
      className={['carousel-root', className].filter(Boolean).join(' ')}
    >
      <div className="carousel-wrapper">
        <div className="carousel-inner">
          <ul ref={trackRef} className="carousel-track">
            {items.map((item, index) => (
              <li
                key={index}
                ref={(element) => {
                  slideRefs.current[index] = element;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={fa.carousel.slideLabel(index + 1, items.length)}
                className="carousel-slide"
              >
                {item}
              </li>
            ))}
          </ul>
          <Button
            color="primary"
            variant="outlined"
            size="small"
            aria-label={fa.carousel.previousSlide}
            disabled={isAtStart}
            onClick={prev}
            className="start-0 carousel-arrow"
          >
            <Icon icon={ArrowLeft2} size={20} className="rtl:-scale-x-100" />
          </Button>
          <Button
            color="primary"
            variant="outlined"
            size="small"
            aria-label={fa.carousel.nextSlide}
            disabled={isAtEnd}
            onClick={next}
            className="end-0 carousel-arrow"
          >
            <Icon icon={ArrowRight2} size={20} className="rtl:-scale-x-100" />
          </Button>
        </div>
      </div>

      <ul className="carousel-dots-wrap">
        {items.map((_, index) => (
          <li key={index}>
            <button
              type="button"
              aria-label={fa.carousel.goToSlide(index + 1)}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => goTo(index)}
              className="carousel-dot-btn"
            >
              <span
                aria-hidden="true"
                data-active={index === activeIndex ? 'true' : undefined}
                className="carousel-dot"
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
