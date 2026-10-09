/** jsdom has no matchMedia; this factory builds a MediaQueryList that always answers `matches`. */
export function createMatchMedia(matches: boolean): typeof window.matchMedia {
  return (query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
