import localFont from 'next/font/local';

export const iransans = localFont({
  src: [
    { path: './fonts/iransans-400.ttf', weight: '400', style: 'normal' },
    { path: './fonts/iransans-500.ttf', weight: '500', style: 'normal' },
    { path: './fonts/iransans-700.ttf', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-iransans',
});
