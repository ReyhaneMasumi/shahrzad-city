import type { ContainerProps } from './Container.types';

/** Fluid horizontal padding with a max content width. */
export default function Container({ as: Component = 'div', className, children }: ContainerProps) {
  return (
    <Component
      className={['mx-auto w-full max-w-7xl ps-sm pe-sm md:ps-md md:pe-md', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Component>
  );
}
