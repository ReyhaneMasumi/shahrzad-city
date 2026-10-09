import type { Banner, BannerDto } from '../types/hero-banner.types';

/** Picks the domain fields the hero area renders; the rest of the wire shape is dropped. */
export function toBanner(dto: BannerDto): Banner {
  return {
    id: dto.id,
    name: dto.name,
    image: dto.image,
    url: dto.url,
    order: dto.order,
  };
}
