import Link from 'next/link';
import { ArrowLeft } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon';

/** Wallet row shown under the mobile logo. */
export default function MobileWallet() {
  return (
    <Link
      href={fa.header.wallet.href}
      className="flex h-12 items-center justify-between px-sm text-content-inverse"
    >
      <span className="text-body-md font-medium">{fa.header.wallet.title}</span>
      <span className="flex items-center gap-2xs text-body-sm">
        {fa.header.wallet.viewBalance}
        <Icon icon={ArrowLeft} size={20} />
      </span>
    </Link>
  );
}
