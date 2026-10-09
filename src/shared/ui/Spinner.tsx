import { Spin } from 'antd';
import { fa } from '@/shared/i18n/fa';
import type { SpinnerProps } from './Spinner.types';

/** Accessible loading spinner built on Ant Design `Spin`. Rotation stops under `prefers-reduced-motion` (global rule in base.css). */
export default function Spinner({ className }: SpinnerProps) {
  return (
    <span
      role="status"
      className={['inline-flex items-center justify-center text-primary-brand', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Spin size="small" />
      <span className="sr-only">{fa.loading}</span>
    </span>
  );
}
