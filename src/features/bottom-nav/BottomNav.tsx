import Link from 'next/link';
import { Wallet, Category, Scan } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon/Icon';
import type { BottomNavProps } from './BottomNav.types';

export default function BottomNav(_props: BottomNavProps) {
  return (
    <nav
      aria-label={fa.bottomNav.navLabel}
      className="lg:hidden fixed inset-x-0 bottom-0 z-[var(--z-index-bottom-nav)] h-[92px] bg-white pb-[env(safe-area-inset-bottom)]"
      role="navigation"
    >
      <div className="relative mx-auto flex h-[48px] max-w-[360px] items-center justify-between rounded-full bg-white px-md shadow-bottom-sheet">
        <Link
          href="/wallet"
          className="flex h-full items-center gap-2xs text-content-primary"
          aria-label={fa.bottomNav.wallet}
        >
          <Icon icon={Wallet} size={24} />
          <span className="text-body-sm font-medium">{fa.bottomNav.wallet}</span>
        </Link>

        <Link
          href="/qr-payment"
          aria-label={fa.bottomNav.qr}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex size-[52px] items-center justify-center rounded-[var(--radius-12)] bg-[var(--color-primary-10)]"
        >
          <Icon icon={Scan} size={32} className="text-primary-brand" />
        </Link>

        <Link
          href="/shahrzad-services"
          className="flex h-full items-center gap-2xs text-content-primary"
          aria-label={fa.bottomNav.services}
        >
          <Icon icon={Category} size={24} />
          <span className="text-body-sm font-medium">{fa.bottomNav.services}</span>
        </Link>
      </div>
    </nav>
  );
}
