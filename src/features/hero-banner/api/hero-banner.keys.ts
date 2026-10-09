/** SWR key factory for the hero banner endpoint. Never inline this string elsewhere. */
export const bannerKeys = {
  mainPage: () => '/banners?type=mainPage&platform=pwa',
} as const;
