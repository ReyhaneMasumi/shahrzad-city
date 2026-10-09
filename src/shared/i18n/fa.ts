export const fa = {
  app: {
    name: 'شهرزاد',
    title: 'شهرزاد',
    titleTemplate: '%s | شهرزاد',
    description: 'خانه‌ی شهرزاد؛ دسترسی سریع به خدمات شهری',
  },
  loading: 'در حال بارگذاری',
  empty: {
    title: 'موردی برای نمایش نیست',
    message: 'هنوز اطلاعاتی در این بخش ثبت نشده است.',
  },
  error: {
    title: 'خطایی رخ داد',
    message: 'مشکلی پیش آمد؛ دوباره تلاش کنید.',
    retry: 'تلاش دوباره',
  },
  notFound: {
    title: 'صفحه پیدا نشد',
    message: 'صفحه‌ای که دنبال آن بودید وجود ندارد.',
    backHome: 'بازگشت به خانه',
  },
  common: {
    seeAll: 'مشاهده همه',
  },
  header: {
    logoAlt: 'شهرزاد',
    navLabel: 'ناوبری اصلی',
    services: { label: 'خدمات شهرزاد', href: '/shahrzad-services' },
    faq: { label: 'سوالات متداول', href: '/faq' },
    about: { label: 'درباره شهرزاد', href: '/about-shahrzad' },
    wallet: {
      title: 'کیف پول',
      view: 'مشاهده',
      viewBalance: 'مشاهده موجودی',
      href: '/wallet',
    },
    qr: { label: 'پرداخت با کد QR', href: '/qr-payment' },
    profile: { label: 'حساب کاربری' },
    notifications: { label: 'اعلان‌ها' },
  },
  carousel: {
    previousSlide: 'اسلاید قبلی',
    nextSlide: 'اسلاید بعدی',
    goToSlide: (index: number) => `رفتن به اسلاید ${index}`,
    slideLabel: (index: number, total: number) => `اسلاید ${index} از ${total}`,
  },
} as const;
