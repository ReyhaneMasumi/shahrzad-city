import Link from 'next/link';
import { Button } from 'antd';
import { fa } from '@/shared/i18n/fa';

export default function NotFound() {
  return (
    <div className="page-center">
      <h1 className="text-2xl font-bold">{fa.notFound.title}</h1>
      <p className="text-base">{fa.notFound.message}</p>
      <Link href="/">
        <Button type="primary">{fa.notFound.backHome}</Button>
      </Link>
    </div>
  );
}
