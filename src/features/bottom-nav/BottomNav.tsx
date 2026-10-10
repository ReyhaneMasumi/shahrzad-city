import Link from 'next/link';
import { Wallet, Category, Scan } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon/Icon';
import type { BottomNavProps } from './BottomNav.types';

export default function BottomNav(_props: BottomNavProps) {
  return (
    <nav aria-label={fa.bottomNav.navLabel} className="bottom-nav" role="navigation">
      <div className="bottom-nav-inner">
        <Link href="/wallet" className="bottom-nav-item" aria-label={fa.bottomNav.wallet}>
          <Icon icon={Wallet} size={24} />
          <span className="bottom-nav-item-text">{fa.bottomNav.wallet}</span>
        </Link>

        <Link href="/qr-payment" aria-label={fa.bottomNav.qr} className="bottom-nav-qr">
          <Icon icon={Scan} size={32} className="text-primary-brand" />
        </Link>

        <Link
          href="/shahrzad-services"
          className="bottom-nav-item"
          aria-label={fa.bottomNav.services}
        >
          <Icon icon={Category} size={24} />
          <span className="bottom-nav-item-text">{fa.bottomNav.services}</span>
        </Link>
      </div>
    </nav>
  );
}
