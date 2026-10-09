import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fa } from '@/shared/i18n/fa';
import { createMatchMedia } from '../../../../tests/mocks/match-media';
import { MockIntersectionObserver } from '../../../../tests/mocks/intersection-observer';
import Carousel from './Carousel';
import type { CarouselProps } from './Carousel.types';

const ITEMS: CarouselProps['items'] = [<div key="one">One</div>, <div key="two">Two</div>];

function renderCarousel(props: Partial<CarouselProps> = {}) {
  return render(<Carousel items={ITEMS} ariaLabel="Banners" {...props} />);
}

describe('Carousel', () => {
  const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView);

  beforeEach(() => {
    scrollIntoView.mockClear();
  });

  it('exposes a labelled carousel region', () => {
    renderCarousel();

    const region = screen.getByRole('group', { name: 'Banners' });
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('renders one labelled slide per item', () => {
    renderCarousel();

    expect(
      screen.getByRole('group', { name: fa.carousel.slideLabel(1, ITEMS.length) })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: fa.carousel.slideLabel(2, ITEMS.length) })
    ).toBeInTheDocument();
  });

  it('names the arrow buttons and disables them at the ends', () => {
    renderCarousel();

    const prev = screen.getByRole('button', { name: fa.carousel.previousSlide });
    const next = screen.getByRole('button', { name: fa.carousel.nextSlide });
    expect(prev).toBeDisabled();
    expect(next).toBeEnabled();

    fireEvent.click(next);

    expect(next).toBeDisabled();
    expect(prev).toBeEnabled();
  });

  it('scrolls the next slide into view and moves aria-current to its bullet', () => {
    renderCarousel();
    scrollIntoView.mockClear();

    const firstBullet = screen.getByRole('button', { name: fa.carousel.goToSlide(1) });
    const secondBullet = screen.getByRole('button', { name: fa.carousel.goToSlide(2) });
    expect(firstBullet).toHaveAttribute('aria-current', 'true');

    fireEvent.click(screen.getByRole('button', { name: fa.carousel.nextSlide }));

    const secondSlide = screen.getByRole('group', {
      name: fa.carousel.slideLabel(2, ITEMS.length),
    });
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', inline: 'start' });
    expect(scrollIntoView.mock.contexts[0]).toBe(secondSlide);
    expect(secondBullet).toHaveAttribute('aria-current', 'true');
    expect(firstBullet).not.toHaveAttribute('aria-current');
  });

  it('starts at the given initial index', () => {
    renderCarousel({ initialIndex: 1 });

    expect(screen.getByRole('button', { name: fa.carousel.goToSlide(2) })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', inline: 'start' });
    expect(scrollIntoView.mock.contexts[0]).toBe(
      screen.getByRole('group', { name: fa.carousel.slideLabel(2, ITEMS.length) })
    );
  });

  it('navigates with ArrowLeft and ArrowRight on the region', () => {
    renderCarousel();
    scrollIntoView.mockClear();

    const region = screen.getByRole('group', { name: 'Banners' });
    expect(region).toHaveAttribute('tabindex', '0');
    const firstBullet = screen.getByRole('button', { name: fa.carousel.goToSlide(1) });
    const secondBullet = screen.getByRole('button', { name: fa.carousel.goToSlide(2) });

    // RTL: ArrowLeft advances, and acting prevents the default.
    expect(fireEvent.keyDown(region, { key: 'ArrowLeft' })).toBe(false);
    expect(secondBullet).toHaveAttribute('aria-current', 'true');
    expect(firstBullet).not.toHaveAttribute('aria-current');
    expect(scrollIntoView).toHaveBeenCalledTimes(1);

    // ArrowRight recedes.
    expect(fireEvent.keyDown(region, { key: 'ArrowRight' })).toBe(false);
    expect(firstBullet).toHaveAttribute('aria-current', 'true');

    // No-op at the start: no scroll, no state change, default untouched.
    expect(fireEvent.keyDown(region, { key: 'ArrowRight' })).toBe(true);
    expect(firstBullet).toHaveAttribute('aria-current', 'true');
    expect(scrollIntoView).toHaveBeenCalledTimes(2);

    // Unhandled keys are never intercepted.
    expect(fireEvent.keyDown(region, { key: 'Enter' })).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it('is a no-op past the end for ArrowLeft and for the disabled next button', () => {
    renderCarousel({ initialIndex: 1 });
    scrollIntoView.mockClear();

    const region = screen.getByRole('group', { name: 'Banners' });
    expect(fireEvent.keyDown(region, { key: 'ArrowLeft' })).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: fa.carousel.nextSlide }));

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: fa.carousel.goToSlide(2) })).toHaveAttribute(
      'aria-current',
      'true'
    );
  });

  it('tracks the visible slide with an IntersectionObserver and disconnects on unmount', () => {
    const { unmount } = renderCarousel();
    const observer = MockIntersectionObserver.last();
    const firstSlide = screen.getByRole('group', { name: fa.carousel.slideLabel(1, ITEMS.length) });
    const secondSlide = screen.getByRole('group', {
      name: fa.carousel.slideLabel(2, ITEMS.length),
    });
    expect(observer.targets).toEqual(new Set([firstSlide, secondSlide]));

    act(() => {
      observer.trigger([
        { target: firstSlide, intersectionRatio: 0, isIntersecting: false },
        { target: secondSlide, intersectionRatio: 1, isIntersecting: true },
      ]);
    });

    expect(screen.getByRole('button', { name: fa.carousel.goToSlide(2) })).toHaveAttribute(
      'aria-current',
      'true'
    );

    unmount();
    expect(observer.targets.size).toBe(0);
  });

  it('scrolls without animation when reduced motion is requested', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = createMatchMedia(true);
    try {
      renderCarousel();
      scrollIntoView.mockClear();
      fireEvent.click(screen.getByRole('button', { name: fa.carousel.nextSlide }));
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', inline: 'start' });
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
