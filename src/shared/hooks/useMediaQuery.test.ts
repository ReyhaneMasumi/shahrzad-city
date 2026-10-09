import { act, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMediaQuery } from './useMediaQuery';

type ChangeListener = (event: MediaQueryListEvent) => void;

const originalMatchMedia = window.matchMedia;

function stubMatchMedia(initial: boolean) {
  const listeners = new Set<ChangeListener>();
  const mediaQueryList = {
    matches: initial,
    media: '',
    onchange: null,
    addEventListener: (_type: string, listener: ChangeListener) => listeners.add(listener),
    removeEventListener: (_type: string, listener: ChangeListener) => listeners.delete(listener),
    addListener: (listener: ChangeListener) => listeners.add(listener),
    removeListener: (listener: ChangeListener) => listeners.delete(listener),
    dispatchEvent: () => true,
  };
  window.matchMedia = vi.fn(() => mediaQueryList) as unknown as typeof window.matchMedia;
  return (next: boolean) => {
    mediaQueryList.matches = next;
    listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
  };
}

function Probe() {
  const matches = useMediaQuery('(min-width: 48rem)');
  return createElement('span', null, matches ? 'match' : 'no-match');
}

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('useMediaQuery', () => {
  it('returns the current matchMedia result', () => {
    stubMatchMedia(true);
    render(createElement(Probe));
    expect(screen.getByText('match')).toBeInTheDocument();
  });

  it('updates when the media query changes', () => {
    const emitChange = stubMatchMedia(false);
    render(createElement(Probe));
    expect(screen.getByText('no-match')).toBeInTheDocument();

    act(() => emitChange(true));
    expect(screen.getByText('match')).toBeInTheDocument();
  });

  it('returns the server snapshot (false) during server rendering', () => {
    expect(renderToString(createElement(Probe))).toContain('no-match');
  });
});
