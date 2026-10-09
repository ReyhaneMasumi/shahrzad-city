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
