import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { createMatchMedia } from './mocks/match-media';
import { MockIntersectionObserver } from './mocks/intersection-observer';
import { server } from '@/mocks/server';

// jsdom ships without these browser APIs; the carousel relies on all three.
Element.prototype.scrollIntoView = vi.fn();
globalThis.IntersectionObserver = MockIntersectionObserver;
window.matchMedia = createMatchMedia(false);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
afterEach(cleanup);
