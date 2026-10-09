'use client';

import { Button, Result } from 'antd';
import { fa } from '@/shared/i18n/fa';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Result
        status="error"
        title={fa.error.title}
        subTitle={fa.error.message}
        extra={
          <Button type="primary" onClick={reset}>
            {fa.error.retry}
          </Button>
        }
      />
    </div>
  );
}
