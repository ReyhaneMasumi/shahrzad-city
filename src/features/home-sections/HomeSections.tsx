'use client';

import { fa } from '@/shared/i18n/fa';
import { useHomeSections } from './hooks/useHomeSections';
import { Empty, SectionHead, SectionStates, Skeleton } from '@/shared/ui';
import HomeTile from './HomeTile';
import type { HomeSectionsProps } from './HomeSections.types';

const SKELETON_COUNT = 8;

export default function HomeSections(_props: HomeSectionsProps) {
  const { status, data, retry } = useHomeSections();

  const skeletonGrid = Array.from({ length: SKELETON_COUNT }, (_, i) => (
    <Skeleton
      key={i}
      className="flex flex-col items-center gap-2xs"
      rounded
      width="76px"
      height="86px"
    />
  ));

  if (status === 'loading') {
    return (
      <SectionStates status="loading">
        <SectionHead
          title={fa.header.services.label}
          href={fa.header.services.href}
          actionLabel={fa.common.seeAll}
        />
        <div
          className="grid grid-cols-4 gap-y-10"
          role="list"
          aria-label={fa.header.services.label}
        >
          {skeletonGrid}
        </div>
      </SectionStates>
    );
  }

  if (status === 'error') {
    return (
      <SectionStates status="error" onRetry={retry}>
        <SectionHead
          title={fa.header.services.label}
          href={fa.header.services.href}
          actionLabel={fa.common.seeAll}
        />
      </SectionStates>
    );
  }

  if (status === 'empty' || !data || data.services.length === 0) {
    return (
      <SectionStates status="empty">
        <SectionHead
          title={fa.header.services.label}
          href={fa.header.services.href}
          actionLabel={fa.common.seeAll}
        />
        <Empty message={fa.homeSections.empty} />
      </SectionStates>
    );
  }

  return (
    <SectionStates status="success">
      <SectionHead
        title={fa.header.services.label}
        href={fa.header.services.href}
        actionLabel={fa.common.seeAll}
      />
      <div
        className="grid grid-cols-4 gap-y-10 lg:pb-[360px]"
        role="list"
        aria-label={fa.header.services.label}
      >
        {data.services.flatMap((section) =>
          section.tiles.map((tile) => (
            <HomeTile
              key={tile.id}
              title={tile.title}
              imageUrl={tile.icon}
              href={tile.url}
              external={tile.url.startsWith('http')}
            />
          ))
        )}
      </div>
    </SectionStates>
  );
}
