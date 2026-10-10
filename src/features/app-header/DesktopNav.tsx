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
      <ul className="nav-desktop">
        {LINKS.map((link) => (
          <li key={link.key}>
            <Link href={link.href} className="nav-desktop-link">
              {link.label}
              {link.chevron ? <Icon icon={ArrowDown2} size={16} /> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
