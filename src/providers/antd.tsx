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
          colorPrimary: '#307FE2',
          colorInfo: '#307FE2',
          colorLink: '#1C66C1',
          colorLinkHover: '#154C91',
          colorText: '#1C1C1C',
          colorTextSecondary: '#4B4B4B',
          fontFamily: 'var(--font-sans)',
          borderRadius: 12,
          controlHeight: 40,
          controlHeightSM: 32,
          controlHeightLG: 48,
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
