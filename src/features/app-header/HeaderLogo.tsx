import Link from 'next/link';
import { fa } from '@/shared/i18n/fa';
import Image from '@/shared/ui/Image';

/** Brand logo linking back to the home route. */
export default function HeaderLogo() {
  return (
    <Link href="/home" aria-label={fa.app.name} className="inline-flex">
      <Image
        src="/brand/logo.svg"
        alt={fa.header.logoAlt}
        width={96}
        height={32}
        unoptimized
        priority
      />
    </Link>
  );
}
