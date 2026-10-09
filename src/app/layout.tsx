import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import AntdRegistry from '@/providers/antd-registry';
import Providers from '@/providers';
import { AppShell } from '@/features/app-shell';
import { fa } from '@/shared/i18n/fa';
import { iransans } from './fonts';
import '@/styles/index.css';

export const metadata: Metadata = {
  title: {
    default: fa.app.title,
    template: fa.app.titleTemplate,
  },
  description: fa.app.description,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#307FE2',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={iransans.variable}>
      <body>
        <AntdRegistry>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
