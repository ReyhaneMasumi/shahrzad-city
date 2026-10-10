import useSWR from 'swr';
import { ApiError, fetcher } from '@/shared/api';
import { homeKeys } from '../api/home-sections.keys';
import { toHomeData } from '../lib/home-sections.mapper';
import type { HomeSectionsDto, HomeSectionsViewModel } from '../types/home-sections.types';

/** Main-page sections as a view-model: status, mapped data, refresh flag and retry. */
export function useHomeSections(): HomeSectionsViewModel {
  const { data, error, isLoading, isValidating, mutate } = useSWR<HomeSectionsDto>(
    homeKeys.sections(),
    fetcher
  );

  const hasTiles = data?.services.some((s) => s.tiles.length > 0) ?? false;
  const hasMain = (data?.main.length ?? 0) > 0;
  const hasWallet = (data?.wallet.length ?? 0) > 0;
  const isEmpty = !hasTiles && !hasMain && !hasWallet;

  const status = error ? 'error' : isLoading ? 'loading' : isEmpty ? 'empty' : 'success';

  return {
    status,
    data: status === 'success' && data ? toHomeData(data) : null,
    error: error instanceof ApiError ? error : null,
    isRefreshing: isValidating,
    retry: () => {
      void mutate();
    },
  };
}
