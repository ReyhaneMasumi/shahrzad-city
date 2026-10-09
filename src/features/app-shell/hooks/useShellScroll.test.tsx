import { useRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MockIntersectionObserver } from '../../../../tests/mocks/intersection-observer';
import { createMatchMedia } from '../../../../tests/mocks/match-media';
import { useShellScroll } from './useShellScroll';

const originalScrollTo = Element.prototype.scrollTo;

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const { atTop, scrolled, atBottom, scrollToTop } = useShellScroll(ref);
  return (
    <div ref={ref} data-testid="scroller">
      <div data-testid="top-sentinel" data-sentinel="top" className="h-px" />
      <span
        data-testid="state"
        data-at-top={String(atTop)}
        data-scrolled={String(scrolled)}
        data-at-bottom={String(atBottom)}
      />
      <button type="button" onClick={scrollToTop}>
        scroll to top
      </button>
      <div data-testid="bottom-sentinel" data-sentinel="bottom" className="h-px" />
    </div>
  );
}

function state(attribute: 'data-at-top' | 'data-scrolled' | 'data-at-bottom') {
  return screen.getByTestId('state').getAttribute(attribute);
}

function observers() {
  const [top, bottom] = MockIntersectionObserver.instances;
  if (top === undefined || bottom === undefined) {
    throw new Error('expected a top and a bottom IntersectionObserver');
  }
  return { top, bottom };
}

afterEach(() => {
  MockIntersectionObserver.reset();
  Element.prototype.scrollTo = originalScrollTo;
  window.matchMedia = createMatchMedia(false);
});

describe('useShellScroll', () => {
  it('tracks the top sentinel to derive scrolled and atTop', () => {
    render(<Probe />);
    const { top } = observers();
    const sentinel = screen.getByTestId('top-sentinel');

    expect(state('data-scrolled')).toBe('false');
    expect(state('data-at-top')).toBe('true');

    act(() => top.trigger([{ isIntersecting: false, target: sentinel }]));
    expect(state('data-scrolled')).toBe('true');
    expect(state('data-at-top')).toBe('false');

    act(() => top.trigger([{ isIntersecting: true, target: sentinel }]));
    expect(state('data-scrolled')).toBe('false');
    expect(state('data-at-top')).toBe('true');
  });

  it('tracks the bottom sentinel to derive atBottom', () => {
    render(<Probe />);
    const { bottom } = observers();
    const sentinel = screen.getByTestId('bottom-sentinel');

    expect(state('data-at-bottom')).toBe('false');

    act(() => bottom.trigger([{ isIntersecting: true, target: sentinel }]));
    expect(state('data-at-bottom')).toBe('true');

    act(() => bottom.trigger([{ isIntersecting: false, target: sentinel }]));
    expect(state('data-at-bottom')).toBe('false');
  });

  it('scrolls the container to the top smoothly by default', () => {
    const scrollTo = vi.fn();
    Element.prototype.scrollTo = scrollTo;

    render(<Probe />);
    fireEvent.click(screen.getByRole('button', { name: 'scroll to top' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('scrolls instantly when the user prefers reduced motion', () => {
    window.matchMedia = createMatchMedia(true);
    const scrollTo = vi.fn();
    Element.prototype.scrollTo = scrollTo;

    render(<Probe />);
    fireEvent.click(screen.getByRole('button', { name: 'scroll to top' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });
});
