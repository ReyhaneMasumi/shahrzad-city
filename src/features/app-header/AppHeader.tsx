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
 * Site header. Mobile (< lg): a 200px brand layer that shrinks 80px on scroll.
 * Desktop (>= lg): a static 136px bar. The breakpoint split is JS-driven
 * (`useMediaQuery`), which is hydration-safe because the server snapshot is false.
 */
export default function AppHeader({ scrolled }: AppHeaderProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <header
      data-scrolled={scrolled ? 'true' : undefined}
      className={`app-header absolute inset-x-0 top-0 rounded-b-2xl bg-primary-brand lg:static lg:h-[136px] lg:rounded-b-none transition-all duration-300 ${scrolled ? 'h-37.5' : 'h-60'}`}
    >
      {isDesktop ? (
        <div className="h-[74px] px-md mt-4">
          <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between">
            <div className="flex items-center gap-xl">
              <HeaderLogo />
              <DesktopNav />
            </div>

            <div className="flex items-center gap-xl">
              <WalletChip />
              <button
                type="button"
                aria-label={fa.header.profile.label}
                className="grid size-11 place-items-center rounded-[var(--radius-12)] border border-white/20 bg-white/10 text-white"
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
