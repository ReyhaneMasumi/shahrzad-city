import type { ContainerProps } from './Container.types';

/** Fluid horizontal padding with a max content width. */
export default function Container({ as: Component = 'div', className, children }: ContainerProps) {
  return (
    <Component className={['container-fluid', className].filter(Boolean).join(' ')}>
      {children}
    </Component>
  );
}
