import AntdProvider from '@/providers/antd';
import SwrProvider from '@/providers/swr';
import type { PropsWithChildren } from 'react';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <AntdProvider>
      <SwrProvider>{children}</SwrProvider>
    </AntdProvider>
  );
}
