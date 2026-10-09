import { Skeleton as AntdSkeleton } from 'antd';
import type { SkeletonProps } from './Skeleton.types';

/**
 * Loading placeholder built on Ant Design `Skeleton.Node`. Size it with
 * `width`/`height` so the placeholder matches the loaded content and never
 * causes layout shift.
 */
export default function Skeleton({
  width = '100%',
  height = 16,
  rounded = false,
  className,
}: SkeletonProps) {
  return (
    <AntdSkeleton.Node
      active
      className={className}
      style={{ width, height, borderRadius: rounded ? 12 : 4 }}
    />
  );
}
