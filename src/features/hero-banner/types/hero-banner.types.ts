import type { ApiError } from '@/shared/api';

/** Wire shape of a banner from `GET /banners?type=mainPage&platform=pwa` (API.md). */
export interface BannerDto {
  id: number;
  name: string;
  order: number;
  image: string;
  url: string;
  bannerType: string;
  pageChoice: string;
  position: string;
  target: string;
  linkedTile: unknown;
  authMethod: string;
}

/** Domain banner — only the fields the hero area renders. */
export interface Banner {
  id: number;
  name: string;
  image: string;
  url: string;
  order: number;
}

/** View-model handed to the hero banner UI. SWR stays behind this contract. */
export interface BannersViewModel {
  status: 'loading' | 'error' | 'empty' | 'success';
  data: Banner[];
  error: ApiError | null;
  isRefreshing: boolean;
  retry: () => void;
}
