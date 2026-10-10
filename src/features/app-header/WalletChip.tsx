import Link from 'next/link';
import { ArrowLeft } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon/Icon';

/** Desktop wallet shortcut placed at the end of the header row. */
export default function WalletChip() {
  return (
    <Link
      href={fa.header.wallet.href}
      className="flex items-center gap-2xs px-sm py-2xs rounded-[var(--radius-12)] bg-white/20 text-white font-medium text-body-sm backdrop-blur-sm motion-safe:transition-all motion-safe:hover:bg-white/30"
    >
      <span>{fa.header.wallet.title}</span>
      <span className="flex items-center gap-2xs">
        {fa.header.wallet.view}
        <Icon icon={ArrowLeft} size={16} />
      </span>
    </Link>
  );
}
