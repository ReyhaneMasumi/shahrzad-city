import type { ComponentType } from 'react';
import type { IconProps as IconsaxIconProps } from 'iconsax-react';

export type { IconsaxIconProps };

export interface IconProps {
  icon: ComponentType<IconsaxIconProps>;
  size?: number;
  variant?: IconsaxIconProps['variant'];
  color?: string;
  label?: string;
  className?: string;
}
