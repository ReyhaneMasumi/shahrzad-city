import { useMediaQuery } from './useMediaQuery';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Returns `true` when the user asks for reduced motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
