import Link from 'next/link';
import { Notification, Scan, User } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon/Icon';
import HeaderLogo from './HeaderLogo';
import type { MobileTopRowProps } from './MobileTopRow.types';

export default function MobileTopRow({ scrolled }: MobileTopRowProps) {
  return (
    <div
      className={`relative flex h-[84px] items-center justify-between px-sm transition-all duration-300 ${
        scrolled ? 'h-[64px] pb-0' : 'pb-5'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center transition-all duration-300 ${
          scrolled ? 'h-0 opacity-0' : 'h-[84px] opacity-100'
        }`}
      >
        <span className="pointer-events-auto">
          <HeaderLogo />
        </span>
      </div>
      <button
        type="button"
        aria-label={fa.header.profile.label}
        className="grid size-11 place-items-center text-content-inverse"
      >
        <Icon icon={User} size={24} />
      </button>
      <div
        className={`flex items-center gap-2xs transition-all duration-300 ${
          scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          type="button"
          aria-label={fa.header.notifications.label}
          className="grid size-11 place-items-center text-content-inverse"
        >
          <Icon icon={Notification} size={24} />
        </button>
        <Link
          href={fa.header.qr.href}
          aria-label={fa.header.qr.label}
          className="grid size-11 place-items-center text-content-inverse"
        >
          <Icon icon={Scan} size={24} />
        </Link>
      </div>
    </div>
  );
}
