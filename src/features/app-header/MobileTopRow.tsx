import Link from 'next/link';
import { Notification, Scan, User } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon/Icon';
import HeaderLogo from './HeaderLogo';
import type { MobileTopRowProps } from './MobileTopRow.types';

export default function MobileTopRow({ scrolled }: MobileTopRowProps) {
  return (
    <div className={`app-header-mobile-row ${scrolled ? 'h-[64px] pb-0' : ''}`}>
      <div className={`app-header-mobile-logo-wrapper ${scrolled ? 'h-0 opacity-0' : ''}`}>
        <span className="pointer-events-auto">
          <HeaderLogo />
        </span>
      </div>
      <button
        type="button"
        aria-label={fa.header.profile.label}
        className="app-header-mobile-icon-button"
      >
        <Icon icon={User} size={24} />
      </button>
      <div className={`app-header-mobile-actions ${scrolled ? '-translate-x-5' : ''}`}>
        <button
          type="button"
          aria-label={fa.header.notifications.label}
          className={`app-header-mobile-icon-button ${scrolled ? '-translate-x-5' : ''}`}
        >
          <Icon icon={Notification} size={24} />
        </button>
        <Link
          href={fa.header.qr.href}
          aria-label={fa.header.qr.label}
          className={`app-header-mobile-icon-button ${scrolled ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <Icon icon={Scan} size={24} />
        </Link>
      </div>
    </div>
  );
}
