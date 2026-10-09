import type { ComponentType } from 'react';
import type { IconsaxIconProps } from '../Icon/Icon.types';

export interface TileProps {
  title: string;
  icon: ComponentType<IconsaxIconProps>;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  badge?: string;
  className?: string;
}
