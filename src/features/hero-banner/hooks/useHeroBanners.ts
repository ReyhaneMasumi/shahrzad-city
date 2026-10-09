import useSWR from 'swr';
import { ApiError, fetcher } from '@/shared/api';
import { bannerKeys } from '../api/hero-banner.keys';
import { toBanner } from '../lib/hero-banner.mapper';
import type { BannerDto, BannersViewModel } from '../types/hero-banner.types';

/** Main-page banners as a view-model: status, mapped data, refresh flag and retry. */
export function useHeroBanners(): BannersViewModel {
  const { data, error, isLoading, isValidating, mutate } = useSWR<BannerDto[]>(
    bannerKeys.mainPage(),
    fetcher
  );

  const status = error
    ? 'error'
    : isLoading
      ? 'loading'
      : !data || data.length === 0
        ? 'empty'
        : 'success';

  return {
    status,
    data: status === 'success' && data ? data.map(toBanner) : [],
    error: error instanceof ApiError ? error : null,
    isRefreshing: isValidating,
    retry: () => {
      void mutate();
    },
  };
}
