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
    <div className="home-tile-row">
      <div className="home-tile-icon-wrap">
        <Image
          src={imageUrl}
          alt={title}
          width={40}
          height={40}
          className="home-tile-image"
          unoptimized
        />
      </div>
      <span className="home-tile-title">{title}</span>
    </div>
  );

  if (href !== undefined) {
    if (external === true) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="home-tile-link"
          aria-label={title}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className="home-tile-link" aria-label={title}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className="home-tile-link" aria-label={title}>
      {content}
    </button>
  );
}
