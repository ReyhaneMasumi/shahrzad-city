import { ArrowRight2 } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Button from '../Button';
import Icon from '../Icon';
import type { SectionHeadProps } from './SectionHead.types';

/**
 * Section heading with a divider and a trailing "see all" control.
 * The action is an `<a>` when `href` is given, a `<button>` when only
 * `onAction` is given, and absent otherwise.
 */
export default function SectionHead({
  title,
  href,
  onAction,
  actionLabel = fa.common.seeAll,
  headingLevel = 2,
}: SectionHeadProps) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center justify-between gap-sm">
        <Heading className="text-heading-md text-content-primary">{title}</Heading>
        {href !== undefined ? (
          <a
            href={href}
            className="inline-flex min-h-11 items-center gap-2xs text-body-sm font-medium text-primary-brand-hover"
          >
            {actionLabel}
            <Icon icon={ArrowRight2} size={16} className="rtl:-scale-x-100" />
          </a>
        ) : onAction !== undefined ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="text-body-sm font-medium text-primary-brand-hover"
          >
            {actionLabel}
            <Icon icon={ArrowRight2} size={16} className="rtl:-scale-x-100" />
          </Button>
        ) : null}
      </div>
      <span aria-hidden="true" className="h-px w-full bg-stroke-neutral" />
    </div>
  );
}
