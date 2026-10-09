import type { IconProps } from './Icon.types';

/**
 * Iconsax wrapper: decorative by default, labelled when `label` is provided.
 * Defaults are passed explicitly because React 19 no longer applies the
 * icon package's `defaultProps`.
 */
export default function Icon({
  icon: IconComponent,
  size = 24,
  variant = 'Linear',
  color = 'currentColor',
  label,
  className,
}: IconProps) {
  const decorative = label === undefined;
  return (
    <IconComponent
      size={size}
      variant={variant}
      color={color}
      className={className}
      focusable={false}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={label}
    />
  );
}
