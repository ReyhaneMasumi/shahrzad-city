import type { PropsWithChildren } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { SWRConfig } from 'swr';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { ApiError } from '@/shared/api';
import { useHeroBanners } from './useHeroBanners';

// Isolated SWR cache per test: no dedupe or state leakage between cases.
function SwrTestWrapper({ children }: PropsWithChildren) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}

const banner = {
  id: 49,
  name: 'daily traffic plan',
  order: 3,
  image: 'https://static.example.test/banner/traffic.jpg',
  url: 'https://example.test/app/vehicle/traffic-plan',
  bannerType: 'main_page',
  pageChoice: 'shahrzad_pwa',
  position: 'top',
  target: 'pwa',
  linkedTile: null,
  authMethod: 'refresh',
};

function serveBanners(data: (typeof banner)[]) {
  server.use(
    http.get('*/banners', () => HttpResponse.json({ statusCode: 200, message: 'OK', data }))
  );
}

function failBanners() {
  server.use(
    http.get('*/banners', () =>
      HttpResponse.json({ statusCode: 500, message: 'boom', data: null }, { status: 500 })
    )
  );
}

describe('useHeroBanners', () => {
  it('resolves to success with the single served banner', async () => {
    serveBanners([banner]);
    const { result } = renderHook(() => useHeroBanners(), { wrapper: SwrTestWrapper });
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0]?.id).toBe(49);
    expect(result.current.error).toBeNull();
    expect(result.current.isRefreshing).toBe(false);
  });

  it('reports empty when the API returns no banners', async () => {
    serveBanners([]);
    const { result } = renderHook(() => useHeroBanners(), { wrapper: SwrTestWrapper });
    await waitFor(() => expect(result.current.status).toBe('empty'));
    expect(result.current.data).toEqual([]);
  });

  it('reports an ApiError when the API fails', async () => {
    failBanners();
    const { result } = renderHook(() => useHeroBanners(), { wrapper: SwrTestWrapper });
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.data).toEqual([]);
  });

  it('recovers to success through retry after a failure', async () => {
    failBanners();
    const { result } = renderHook(() => useHeroBanners(), { wrapper: SwrTestWrapper });
    await waitFor(() => expect(result.current.status).toBe('error'));
    serveBanners([banner]);
    result.current.retry();
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data[0]?.id).toBe(49);
    expect(result.current.error).toBeNull();
  });
});
