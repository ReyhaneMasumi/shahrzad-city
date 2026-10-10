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
    heroBanner: 'بنری برای نمایش وجود ندارد',
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
    logoAlt: 'Shahrzad',
    navLabel: 'main navigation',
    services: { label: 'Services', href: '/shahrzad-services' },
    faq: { label: 'FAQ', href: '/faq' },
    about: { label: 'About', href: '/about-shahrzad' },
    wallet: {
      title: 'Wallet',
      view: 'View',
      viewBalance: 'View Balance',
      href: '/wallet',
    },
    qr: { label: 'QR Payment', href: '/qr-payment' },
    profile: { label: 'User Account' },
    notifications: { label: 'Notifications' },
  },
  carousel: {
    previousSlide: 'اسلاید قبلی',
    nextSlide: 'اسلاید بعدی',
    goToSlide: (index: number) => `رفتن به اسلاید ${index}`,
    slideLabel: (index: number, total: number) => `اسلاید ${index} از ${total}`,
  },
  footer: {
    brandAlt: 'Shahrzad',
    links: [
      { label: 'About Shahrzad', href: '/about-shahrzad', external: false },
      { label: 'Privacy Policy', href: '/privacy', external: false },
      { label: 'Contact Us', href: 'https://shahrzadcity.ir/contact', external: true },
      { label: 'FAQ', href: '/faq', external: false },
      { label: 'Mobile App', href: 'https://shahrzadcity.ir/download-app', external: true },
    ] as const,
  },
  bottomNav: {
    navLabel: 'bottom navigation',
    wallet: 'Wallet',
    services: 'Services',
    qr: 'QR Pay',
  },
  backToTop: 'Back to Top',
  heroBanner: {
    ariaLabel: 'Main Banners',
  },
  homeSections: {
    loading: 'Loading services...',
    empty: 'No services to display',
  },
} as const;
