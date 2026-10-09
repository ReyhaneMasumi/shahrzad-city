import { useCallback, useSyncExternalStore } from 'react';

function subscribe(query: string, onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener('change', onChange);
  return () => mediaQueryList.removeEventListener('change', onChange);
}

function getServerSnapshot(): boolean {
  return false;
}

/** SSR-safe media query hook; the server snapshot is always `false`. */
export function useMediaQuery(query: string): boolean {
  const subscribeToQuery = useCallback(
    (onChange: () => void) => subscribe(query, onChange),
    [query]
  );
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  }, [query]);
  return useSyncExternalStore(subscribeToQuery, getSnapshot, getServerSnapshot);
}
