import Link from 'next/link';
import { ArrowLeft } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon/Icon';
import type { MobileTopRowProps } from './MobileTopRow.types';

/** Wallet row shown under the mobile logo. */
export default function MobileWallet({ scrolled }: MobileTopRowProps) {
  return (
    <div className={`px-sm transition-all duration-300 ${scrolled ? 'translate-y-[-70px] ' : ''}`}>
      <Link
        href={fa.header.wallet.href}
        className={`mx-auto flex h-12  transition-all duration-300 ${scrolled ? 'w-[240px] md:w-[360px]' : 'w-[360]'} items-center justify-between rounded-[var(--radius-12)] bg-white/20 px-sm text-content-inverse backdrop-blur-sm`}
      >
        <span className="text-body-md font-medium">{fa.header.wallet.title}</span>
        <span className="flex items-center gap-2xs text-body-sm">
          {fa.header.wallet.viewBalance}
          <Icon icon={ArrowLeft} size={20} />
        </span>
      </Link>
    </div>
  );
}
