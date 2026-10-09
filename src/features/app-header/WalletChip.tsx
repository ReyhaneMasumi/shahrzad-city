import { ArrowLeft } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon';

/** Desktop wallet shortcut placed at the end of the header row. */
export default function WalletChip() {
  return (
    <a
      href={fa.header.wallet.href}
      className="flex items-center gap-2xs text-body-md text-content-inverse"
    >
      <span>{fa.header.wallet.title}</span>
      <span className="flex items-center gap-2xs text-body-sm">
        {fa.header.wallet.view}
        <Icon icon={ArrowLeft} size={20} />
      </span>
    </a>
  );
}
