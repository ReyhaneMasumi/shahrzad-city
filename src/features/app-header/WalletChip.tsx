import Link from 'next/link';
import { ArrowLeft } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon/Icon';

/** Desktop wallet shortcut placed at the end of the header row. */
export default function WalletChip() {
  return (
    <Link href={fa.header.wallet.href} className="wallet-chip">
      <span>{fa.header.wallet.title}</span>
      <span className="flex items-center gap-2xs">
        {fa.header.wallet.view}
        <Icon icon={ArrowLeft} size={16} />
      </span>
    </Link>
  );
}
