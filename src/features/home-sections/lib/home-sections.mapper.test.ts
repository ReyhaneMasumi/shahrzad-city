import { describe, expect, it } from 'vitest';
import { toHomeData, toHomeTile } from './home-sections.mapper';
import type { HomeSectionsDto, NavItemDto, TileDto } from '../types/home-sections.types';

function tile(overrides: Partial<TileDto>): TileDto {
  return {
    id: 1,
    categoryId: 1,
    tag: null,
    order: 110,
    title: 'leaf tile',
    type: 'shahrzad_pwa',
    url: 'https://example.test/app/leaf',
    icon: 'https://example.test/app_icon/leaf.png',
    storeType: null,
    hasHeader: false,
    hasNotification: false,
    authMethod: 'none',
    words: [],
    cacheStrategy: 'navigate',
    walletType: [],
    ...overrides,
  };
}

const navItem: NavItemDto = {
  id: 197,
  order: 3010,
  title: 'wallet',
  type: 'wallet',
  url: 'https://example.test/wallet',
  icon: 'https://example.test/app_icon/wallet.png',
  authMethod: 'none',
};

describe('toHomeTile', () => {
  it('maps a parent_tile including its nested child recursively', () => {
    const parent = tile({
      id: 108,
      type: 'parent_tile',
      title: 'parent',
      child: [tile({ id: 3 })],
    });
    expect(toHomeTile(parent)).toEqual({
      id: 108,
      title: 'parent',
      type: 'parent_tile',
      url: 'https://example.test/app/leaf',
      icon: 'https://example.test/app_icon/leaf.png',
      order: 110,
      authMethod: 'none',
      children: [
        {
          id: 3,
          title: 'leaf tile',
          type: 'shahrzad_pwa',
          url: 'https://example.test/app/leaf',
          icon: 'https://example.test/app_icon/leaf.png',
          order: 110,
          authMethod: 'none',
          children: [],
        },
      ],
    });
  });

  it('defaults children to an empty array when child is absent', () => {
    expect(toHomeTile(tile({})).children).toEqual([]);
  });
});

describe('toHomeData', () => {
  it('maps navBar, services, main and wallet', () => {
    const dto: HomeSectionsDto = {
      navBar: [navItem],
      services: [{ title: 'shopping', tiles: [tile({ id: 20 })] }],
      main: [tile({ id: 108, type: 'parent_tile', child: [tile({ id: 3 })] })],
      wallet: [tile({ id: 1, type: 'wallet', categoryId: null })],
    };

    const data = toHomeData(dto);

    expect(data.navBar).toEqual([
      {
        id: 197,
        title: 'wallet',
        type: 'wallet',
        url: 'https://example.test/wallet',
        icon: 'https://example.test/app_icon/wallet.png',
        order: 3010,
      },
    ]);
    expect(data.services).toHaveLength(1);
    expect(data.services[0]?.title).toBe('shopping');
    expect(data.services[0]?.tiles[0]?.id).toBe(20);
    expect(data.main[0]?.children[0]?.id).toBe(3);
    expect(data.wallet[0]?.type).toBe('wallet');
  });
});
