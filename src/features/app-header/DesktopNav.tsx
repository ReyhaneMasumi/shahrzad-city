import Link from 'next/link';
import { ArrowDown2 } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon/Icon';

const LINKS = [
  { key: 'services', ...fa.header.services, chevron: true },
  { key: 'faq', ...fa.header.faq, chevron: false },
  { key: 'about', ...fa.header.about, chevron: false },
] as const;

/** Primary desktop navigation. */
export default function DesktopNav() {
  return (
    <nav aria-label={fa.header.navLabel}>
      <ul className="flex items-center gap-xl text-body-md font-medium text-white">
        {LINKS.map((link) => (
          <li key={link.key}>
            <Link
              href={link.href}
              className="inline-flex items-center gap-2xs motion-safe:transition-opacity motion-safe:hover:opacity-80"
            >
              {link.label}
              {link.chevron ? <Icon icon={ArrowDown2} size={16} /> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
