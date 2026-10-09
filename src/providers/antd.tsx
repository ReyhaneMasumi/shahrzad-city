'use client';

import { App as AntdApp, ConfigProvider } from 'antd';
import faIR from 'antd/locale/fa_IR';
import type { PropsWithChildren } from 'react';

export default function AntdProvider({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      direction="rtl"
      locale={faIR}
      theme={{
        cssVar: { key: 'app' },
        token: {
          fontFamily: 'var(--font-iransans)',
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
