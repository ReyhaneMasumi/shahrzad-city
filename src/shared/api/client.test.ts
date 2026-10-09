import { describe, expect, it } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import { server } from '@/mocks/server';
import { getJson, fetcher } from '@/shared/api';
import { ApiError } from '@/shared/api/ApiError';
import type mainPageData from '@/mocks/data/main-page.json';

describe('api client', () => {
  it('getJson unwraps the envelope for main-page', async () => {
    const data = await getJson<typeof mainPageData>('/main-page/apps-nested?platform=pwa');
    expect(data.navBar.length).toBe(2);
    expect(data.services.length).toBe(10);
    expect(data.main.length).toBe(22);
    expect(data.wallet.length).toBe(1);
  });

  it('fetcher returns the same unwrapped payload', async () => {
    const data = await fetcher<typeof mainPageData>('/main-page/apps-nested?platform=pwa');
    expect(data.navBar.length).toBe(2);
    expect(data.services.length).toBe(10);
    expect(data.main.length).toBe(22);
    expect(data.wallet.length).toBe(1);
  });

  it('normalizes 500 error to ApiError', async () => {
    server.use(
      http.get('*/test-error', async () => {
        await delay(10);
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      })
    );

    await expect(getJson('/test-error')).rejects.toBeInstanceOf(ApiError);
    await expect(getJson('/test-error')).rejects.toMatchObject({ status: 500 });
  });
});
