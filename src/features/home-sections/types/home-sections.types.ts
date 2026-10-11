import type { ApiError } from '@/shared/api';

/** Tile kinds present in the served main-page payload (docs/API.md). */
export type TileType = 'pwa' | 'shahrzad_pwa' | 'parent_tile' | 'wallet';

/** NavBar entry kinds. */
export type NavItemType = 'wallet' | 'services';

/** Wire shape of a tile from `GET /main-page/apps-nested?platform=pwa` (docs/API.md). */
export interface TileDto {
  id: number;
  categoryId: number | null;
  tag: string | null;
  order: number;
  title: string;
  type: TileType;
  url: string;
  icon: string;
  storeType: string | null;
  hasHeader: boolean;
  hasNotification: boolean;
  authMethod: string;
  words: string[];
  cacheStrategy: string;
  walletType: string[];
  child?: TileDto[];
}

/** Wire shape of a navBar entry (the tile fields the nav consumes). */
export interface NavItemDto {
  id: number;
  order: number;
  title: string;
  type: NavItemType;
  url: string;
  icon: string;
  authMethod: string;
}

/** Unwrapped payload of the main-page endpoint. */
export interface HomeSectionsDto {
  navBar: NavItemDto[];
  services: { title: string; tiles: TileDto[] }[];
  main: TileDto[];
  wallet: TileDto[];
}

/** Domain tile — the wire metadata the homepage renders, children mapped recursively. */
export interface HomeTile {
  id: number;
  title: string;
  type: TileType;
  url: string;
  icon: string;
  order: number;
  authMethod: string;
  children: HomeTile[];
}

/** Domain navBar entry. */
export interface HomeNavItem {
  id: number;
  title: string;
  type: NavItemType;
  url: string;
  icon: string;
  order: number;
}

/** Domain services group. */
export interface HomeSection {
  title: string;
  tiles: HomeTile[];
}

/** Domain view of the whole main-page payload. */
export interface HomeData {
  navBar: HomeNavItem[];
  services: HomeSection[];
  main: HomeTile[];
  wallet: HomeTile[];
}

/** View-model handed to the home sections UI. SWR stays behind this contract. */
export interface HomeSectionsViewModel {
  status: 'loading' | 'error' | 'empty' | 'success';
  data: HomeData | null;
  error: ApiError | null;
  isRefreshing: boolean;
  retry: () => void;
}
