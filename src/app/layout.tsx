import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import AntdRegistry from '@/providers/antd-registry';
import Providers from '@/providers';
import { AppShell } from '@/features/app-shell';
import { fa } from '@/shared/i18n/fa';
import { iransans } from './fonts';
import '@/styles/index.css';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://web.shahrzadcity.ir';

export const metadata: Metadata = {
  title: {
    default: fa.app.title,
    template: fa.app.titleTemplate,
  },
  description: fa.app.description,
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/home',
    languages: {
      fa: '/home',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: `${baseUrl}/home`,
    siteName: fa.app.name,
    title: fa.app.title,
    description: fa.app.description,
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: fa.app.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: fa.app.title,
    description: fa.app.description,
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: `${baseUrl}/manifest.json`,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#307FE2',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: fa.app.name,
    url: baseUrl,
    description: fa.app.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="fa" dir="rtl" className={iransans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
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
