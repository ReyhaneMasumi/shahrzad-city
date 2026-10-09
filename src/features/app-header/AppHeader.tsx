import { Notification } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon';
import { useMediaQuery } from '@/shared/hooks';
import type { AppHeaderProps } from './AppHeader.types';
import DesktopNav from './DesktopNav';
import HeaderLogo from './HeaderLogo';
import MobileTopRow from './MobileTopRow';
import MobileWallet from './MobileWallet';
import WalletChip from './WalletChip';

const DESKTOP_QUERY = '(min-width: 64rem)';

/**
 * Site header. Mobile (< lg): a 200px brand layer that shrinks 80px on scroll.
 * Desktop (>= lg): a static 136px bar. The breakpoint split is JS-driven
 * (`useMediaQuery`), which is hydration-safe because the server snapshot is false.
 */
export default function AppHeader({ scrolled }: AppHeaderProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <header
      data-scrolled={scrolled ? 'true' : undefined}
      className="app-header absolute inset-x-0 top-0 h-[200px] rounded-b-2xl lg:static lg:h-[136px] lg:rounded-b-none"
    >
      {isDesktop ? (
        <div className="h-[74px] px-md">
          <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between">
            <HeaderLogo />
            <DesktopNav />
            <div className="flex items-center gap-xl">
              <WalletChip />
              <button
                type="button"
                aria-label={fa.header.notifications.label}
                className="grid size-11 place-items-center rounded-[var(--radius-12)] border border-content-inverse/20 bg-content-inverse/10 text-content-inverse"
              >
                <Icon icon={Notification} size={24} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <MobileTopRow />
          <MobileWallet />
        </div>
      )}
    </header>
  );
}
