import Link from 'next/link';
import Image from '@/shared/ui/Image/Image';
import type { HomeTileProps } from './HomeTile.types';

/**
 * Home service tile: 64px circle with external image + label underneath.
 * Renders a link when `href` is given, otherwise a button.
 * External links open in a new tab.
 */
export default function HomeTile({ title, imageUrl, href, external }: HomeTileProps) {
  const content = (
    <div className="w-full flex flex-row justify-start items-center gap-2xs text-center">
      <div className="relative flex size-16 shrink-0 items-center justify-center rounded-12 bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          width={40}
          height={40}
          className="object-cover transition-[opacity,filter] duration-200 hover:opacity-70"
          unoptimized
        />
      </div>
      <span className="text-body-xs font-medium text-content-primary line-clamp-1">{title}</span>
    </div>
  );

  if (href !== undefined) {
    if (external === true) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col justify-start items-center gap-2xs"
          aria-label={title}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className="flex flex-col justify-start items-center gap-2xs"
        aria-label={title}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="flex flex-col justify-start items-center gap-2xs"
      aria-label={title}
    >
      {content}
    </button>
  );
}
