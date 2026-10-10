'use client';

import Link from 'next/link';
import { fa } from '@/shared/i18n/fa';
import { useHeroBanners } from './hooks/useHeroBanners';
import { Carousel, Empty, ErrorState, Image, Skeleton } from '@/shared/ui';
import type { HeroBannerProps } from './HeroBanner.types';

const MOBILE_ASPECT = 302 / 122;

export default function HeroBanner(_props: HeroBannerProps) {
  const { status, data, error, retry } = useHeroBanners();

  if (status === 'loading') {
    return (
      <div className="relative w-full" style={{ aspectRatio: MOBILE_ASPECT }}>
        <Skeleton className="hero-banner-skeleton" />
      </div>
    );
  }

  if (status === 'error') {
    return <ErrorState onRetry={retry} message={error?.message} />;
  }

  if (status === 'empty' || data.length === 0) {
    return <Empty message={fa.empty.heroBanner} />;
  }

  if (data.length === 1) {
    const banner = data[0];
    if (!banner) return <Empty message={fa.empty.heroBanner} />;
    return (
      <Link href={banner.url} className="hero-banner-link" style={{ aspectRatio: MOBILE_ASPECT }}>
        <Image
          src={banner.image}
          alt={banner.name}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 900px"
          className="hero-banner-image"
        />
      </Link>
    );
  }

  return (
    <Carousel
      ariaLabel={fa.heroBanner.ariaLabel}
      items={data.map((banner) => (
        <Link
          key={banner.id}
          href={banner.url}
          className="hero-banner-link"
          style={{ aspectRatio: MOBILE_ASPECT }}
        >
          <Image
            src={banner.image}
            alt={banner.name}
            fill
            sizes="(max-width: 1023px) 100vw, 900px"
            className="hero-banner-image"
          />
        </Link>
      ))}
    />
  );
}
