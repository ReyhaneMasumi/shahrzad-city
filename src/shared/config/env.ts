export const env = (() => {
  const isServer = typeof window === 'undefined';
  const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

  let apiBaseUrl: string;
  if (isServer) {
    if (rawApiBaseUrl.startsWith('http')) {
      apiBaseUrl = rawApiBaseUrl;
    } else {
      const prefix = 'http://localhost:3000';
      apiBaseUrl = `${prefix}${rawApiBaseUrl}`;
    }
  } else {
    apiBaseUrl = rawApiBaseUrl;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    apiBaseUrl,
    siteUrl,
  } as const;
})();
