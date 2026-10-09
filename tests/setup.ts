import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { createMatchMedia } from './mocks/match-media';
import { MockIntersectionObserver } from './mocks/intersection-observer';

// jsdom ships without these browser APIs; the carousel relies on all three.
Element.prototype.scrollIntoView = vi.fn();
globalThis.IntersectionObserver = MockIntersectionObserver;
window.matchMedia = createMatchMedia(false);

afterEach(cleanup);
