'use client';

import { SWRConfig } from 'swr';
import type { PropsWithChildren } from 'react';

export default function SwrProvider({ children }: PropsWithChildren) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        keepPreviousData: true,
        dedupingInterval: 5000,
        shouldRetryOnError: true,
        errorRetryCount: 2,
        onError: (error) => {
          console.error(error);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
