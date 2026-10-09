import type { ComponentType } from 'react';
import type { IconsaxIconProps } from '../Icon.types';

export interface NavItemProps {
  label: string;
  icon: ComponentType<IconsaxIconProps>;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}
