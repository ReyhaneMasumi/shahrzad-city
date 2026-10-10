import { ArrowUp2 } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import { Button, Icon } from '@/shared/ui';
import type { BackToTopProps } from './BackToTop.types';

export default function BackToTop({ onClick }: BackToTopProps) {
  return (
    <div className="lg:hidden mt-lg">
      <Button
        type="default"
        size="small"
        onClick={onClick}
        className="w-full h-11 rounded-[var(--radius-12)] font-medium border border-stroke-neutral bg-white"
        aria-label={fa.backToTop}
      >
        <Icon icon={ArrowUp2} size={20} className="ms-2 rtl:-scale-x-100" />
        {fa.backToTop}
      </Button>
    </div>
  );
}
