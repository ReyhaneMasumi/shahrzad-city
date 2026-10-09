import type { ElementType, ReactNode } from 'react';

export interface ContainerProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}
