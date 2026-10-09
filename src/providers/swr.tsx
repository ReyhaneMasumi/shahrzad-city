'use client';

import { SWRConfig } from 'swr';
import type { PropsWithChildren } from 'react';

export default function SwrProvider({ children }: PropsWithChildren) {
  return (
    <SWRConfig value={{ revalidateOnFocus: false, keepPreviousData: true }}>{children}</SWRConfig>
  );
}
