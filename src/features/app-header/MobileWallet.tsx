import Link from 'next/link';
import { ArrowLeft } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon/Icon';
import type { MobileTopRowProps } from './MobileTopRow.types';

/** Wallet row shown under the mobile logo. */
export default function MobileWallet({ scrolled }: MobileTopRowProps) {
  return (
    <div className={`app-header-mobile-wallet-row ${scrolled ? 'translate-y-[-70px]' : ''}`}>
      <Link
        href={fa.header.wallet.href}
        className={`app-header-mobile-wallet-link ${scrolled ? 'w-[240px] md:w-[360px]' : ''}`}
      >
        <span className="text-body-md font-medium">{fa.header.wallet.title}</span>
        <span className="app-header-mobile-wallet-balance">
          {fa.header.wallet.viewBalance}
          <Icon icon={ArrowLeft} size={20} />
        </span>
      </Link>
    </div>
  );
}
