import Link from 'next/link';
import { fa } from '@/shared/i18n/fa';
import Button from '../Button/Button';
import type { SectionHeadProps } from './SectionHead.types';

/**
 * Section heading with a divider and a trailing "see all" control.
 * The action is a `next/link` when `href` is given, a `<button>` when only
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
    <div className="section-head-wrap">
      <div className="section-head-row">
        <Heading className="text-heading-sm text-content-primary shrink-0">{title}</Heading>
        <span aria-hidden="true" className="section-head-divider" />
        {href !== undefined ? (
          <Link href={href} className="section-head-action">
            {actionLabel}
          </Link>
        ) : onAction !== undefined ? (
          <Button variant="text" size="small" onClick={onAction} className="section-head-action">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
