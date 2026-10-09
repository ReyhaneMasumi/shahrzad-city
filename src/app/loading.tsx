import { Spin } from 'antd';
import { fa } from '@/shared/i18n/fa';

export default function Loading() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <Spin size="large" aria-label={fa.loading} />
    </main>
  );
}
