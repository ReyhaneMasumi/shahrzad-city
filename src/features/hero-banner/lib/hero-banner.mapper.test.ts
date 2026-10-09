import { describe, expect, it } from 'vitest';
import { toBanner } from './hero-banner.mapper';
import type { BannerDto } from '../types/hero-banner.types';

const dto: BannerDto = {
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

describe('toBanner', () => {
  it('maps a BannerDto to the exact domain shape', () => {
    expect(toBanner(dto)).toEqual({
      id: 49,
      name: 'daily traffic plan',
      image: 'https://static.example.test/banner/traffic.jpg',
      url: 'https://example.test/app/vehicle/traffic-plan',
      order: 3,
    });
  });
});
