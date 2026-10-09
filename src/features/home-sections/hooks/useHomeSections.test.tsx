import type { PropsWithChildren } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { SWRConfig } from 'swr';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { ApiError } from '@/shared/api';
import { useHomeSections } from './useHomeSections';

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

describe('useHomeSections', () => {
  it('maps the served payload to the domain view', async () => {
    const { result } = renderHook(() => useHomeSections(), { wrapper: SwrTestWrapper });
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('success'));
    const data = result.current.data;
    expect(data).not.toBeNull();
    expect(data?.navBar).toHaveLength(2);
    expect(data?.services).toHaveLength(10);
    expect(data?.main).toHaveLength(22);
    expect(data?.wallet).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('reports an ApiError when the API fails', async () => {
    server.use(
      http.get('*/main-page/apps-nested', () =>
        HttpResponse.json({ statusCode: 500, message: 'boom', data: null }, { status: 500 })
      )
    );
    const { result } = renderHook(() => useHomeSections(), { wrapper: SwrTestWrapper });
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.data).toBeNull();
  });
});
