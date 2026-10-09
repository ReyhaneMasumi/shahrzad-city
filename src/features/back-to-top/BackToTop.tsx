import { ArrowUp2 } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import { Button, Icon } from '@/shared/ui';
import type { BackToTopProps } from './BackToTop.types';

export default function BackToTop({ onClick }: BackToTopProps) {
  return (
    <Button
      type="text"
      size="small"
      onClick={onClick}
      className="lg:hidden w-full h-11 rounded-[var(--radius-12)] font-medium"
      aria-label={fa.backToTop}
    >
      <Icon icon={ArrowUp2} size={20} className="ms-2 rtl:-scale-x-100" />
      {fa.backToTop}
    </Button>
  );
}
