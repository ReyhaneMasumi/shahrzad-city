'use client';

import { App as AntdApp, ConfigProvider } from 'antd';
import faIR from 'antd/locale/fa_IR';
import type { PropsWithChildren } from 'react';
import { palette } from '@/shared/design/palette';

export default function AntdProvider({ children }: PropsWithChildren) {
  return (
    <ConfigProvider
      direction="rtl"
      locale={faIR}
      theme={{
        cssVar: { key: 'app' },
        token: {
          colorPrimary: palette.brand,
          colorInfo: palette.brand,
          colorLink: palette.brandHover,
          colorLinkHover: palette.brandActive,
          colorText: palette.text,
          colorTextSecondary: palette.textSecondary,
          fontFamily: 'var(--font-sans)',
          borderRadius: palette.radius,
          controlHeight: palette.controlHeight,
          controlHeightSM: palette.controlHeightSm,
          controlHeightLG: palette.controlHeightLg,
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
