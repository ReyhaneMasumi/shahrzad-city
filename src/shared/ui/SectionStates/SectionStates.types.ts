import type { ReactNode } from 'react';

export interface SectionStatesProps {
  status: 'loading' | 'error' | 'empty' | 'success';
  skeleton?: ReactNode;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  children?: ReactNode;
}
