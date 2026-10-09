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
      className="hidden lg:block fixed inset-x-0 bottom-0 z-[var(--z-index-footer)] h-[278px] translate-y-[300px] opacity-0 transition-[transform,opacity] duration-[200ms,100ms] data-[revealed]:translate-y-0 data-[revealed]:opacity-100"
      style={{
        transitionDuration: reducedMotion ? '0ms' : '200ms, 100ms',
      }}
    >
      <div className="relative h-[165px] w-full">
        <Image
          src="/brand/footer-picture.svg"
          alt={fa.footer.brandAlt}
          width={609}
          height={165}
          className="mx-auto h-full w-auto"
          unoptimized
        />
      </div>
      <nav
        className="h-[113px] bg-primary-brand flex items-center justify-center gap-xl text-content-inverse"
        role="navigation"
        aria-label={fa.footer.links[0].label}
      >
        {fa.footer.links.map((link, index) => (
          <span key={link.href} className="text-body-xs font-medium">
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="hover:underline">
                {link.label}
              </Link>
            )}
            {index < fa.footer.links.length - 1 && <span className="mx-sm">|</span>}
          </span>
        ))}
      </nav>
    </footer>
  );
}
