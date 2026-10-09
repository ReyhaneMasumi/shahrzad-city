import type {
  HomeData,
  HomeNavItem,
  HomeTile,
  HomeSectionsDto,
  NavItemDto,
  TileDto,
} from '../types/home-sections.types';

/** Maps a tile and its nested children recursively; `children` defaults to `[]`. */
export function toHomeTile(dto: TileDto): HomeTile {
  return {
    id: dto.id,
    title: dto.title,
    type: dto.type,
    url: dto.url,
    icon: dto.icon,
    order: dto.order,
    authMethod: dto.authMethod,
    children: (dto.child ?? []).map(toHomeTile),
  };
}

/** Maps a navBar entry to the domain nav item. */
export function toHomeNavItem(dto: NavItemDto): HomeNavItem {
  return {
    id: dto.id,
    title: dto.title,
    type: dto.type,
    url: dto.url,
    icon: dto.icon,
    order: dto.order,
  };
}

/** Maps the whole main-page payload to the domain view. */
export function toHomeData(dto: HomeSectionsDto): HomeData {
  return {
    navBar: dto.navBar.map(toHomeNavItem),
    services: dto.services.map((section) => ({
      title: section.title,
      tiles: section.tiles.map(toHomeTile),
    })),
    main: dto.main.map(toHomeTile),
    wallet: dto.wallet.map(toHomeTile),
  };
}
