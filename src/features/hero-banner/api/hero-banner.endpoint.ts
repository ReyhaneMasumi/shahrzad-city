import { getJson } from '@/shared/api';
import type { BannerDto } from '../types/hero-banner.types';
import { bannerKeys } from './hero-banner.keys';

/** Fetches main-page banners, unwrapped from the API envelope. */
export function getBanners(options?: { signal?: AbortSignal }): Promise<BannerDto[]> {
  return getJson<BannerDto[]>(bannerKeys.mainPage(), options);
}
