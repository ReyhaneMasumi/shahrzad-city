import { User } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '@/shared/ui/Icon/Icon';
import { useMediaQuery } from '@/shared/hooks';
import type { AppHeaderProps } from './AppHeader.types';
import DesktopNav from './DesktopNav';
import HeaderLogo from './HeaderLogo';
import MobileTopRow from './MobileTopRow';
import MobileWallet from './MobileWallet';
import WalletChip from './WalletChip';

const DESKTOP_QUERY = '(min-width: 64rem)';

/**
 * Site header. Mobile (< lg): a 240px brand layer that shrinks to 150px on scroll.
 * Desktop (>= lg): a static 136px bar. The breakpoint split is JS-driven
 * (`useMediaQuery`), which is hydration-safe because the server snapshot is false.
 */
export default function AppHeader({ scrolled }: AppHeaderProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <header data-scrolled={scrolled ? 'true' : undefined} className="app-header">
      {isDesktop ? (
        <div className="mt-4 h-[74px] px-md">
          <div className="app-header-inner-desktop">
            <div className="app-header-row">
              <HeaderLogo />
              <DesktopNav />
            </div>

            <div className="app-header-row">
              <WalletChip />
              <button
                type="button"
                aria-label={fa.header.profile.label}
                className="app-header-profile-button"
              >
                <Icon icon={User} size={24} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <MobileTopRow scrolled={scrolled} />
          <MobileWallet scrolled={scrolled} />
        </div>
      )}
    </header>
  );
}
