import type { ButtonProps } from './Button.types';

type ButtonState = 'idle' | 'loading' | 'disabled';

function getButtonState(loading: boolean, isDisabled: boolean): ButtonState {
  if (loading) return 'loading';
  if (isDisabled) return 'disabled';
  return 'idle';
}

/** Filled/outline/ghost button primitive with a 44px minimum touch target. */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled === true || loading;

  return (
    <button
      {...rest}
      type={type}
      data-variant={variant}
      data-size={size}
      data-block={block ? true : undefined}
      data-state={getButtonState(loading, isDisabled)}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      className={['btn', className].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  );
}
