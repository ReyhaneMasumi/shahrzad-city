import Link from 'next/link';
import { fa } from '@/shared/i18n/fa';
import Image from '@/shared/ui/Image/Image';
import { useReducedMotion } from '@/shared/hooks';
import type { AppFooterProps } from './AppFooter.types';

export default function AppFooter({ revealed }: AppFooterProps) {
  const reducedMotion = useReducedMotion();

  return (
    <footer
      data-revealed={revealed ? 'true' : undefined}
      className="app-footer"
      style={{
        transitionDuration: reducedMotion ? '0ms' : '200ms, 100ms',
      }}
    >
      <div className="app-footer-image-wrap">
        <Image
          src="/brand/footer-picture.svg"
          alt={fa.footer.brandAlt}
          width={609}
          height={165}
          className="app-footer-image"
          unoptimized
        />
      </div>
      <nav className="app-footer-nav" role="navigation" aria-label="footer links">
        {fa.footer.links.map((link) => (
          <span key={link.href} className="app-footer-link">
            {link.external ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ) : (
              <Link href={link.href}>{link.label}</Link>
            )}
          </span>
        ))}
      </nav>
    </footer>
  );
}
