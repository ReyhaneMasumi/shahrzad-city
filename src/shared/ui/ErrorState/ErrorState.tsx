import { Result } from 'antd';
import { fa } from '@/shared/i18n/fa';
import Button from '../Button/Button';
import type { ErrorStateProps } from './ErrorState.types';

/** Error state built on Ant Design `Result`: message plus an optional retry action. */
export default function ErrorState({ onRetry, message }: ErrorStateProps) {
  return (
    <div role="alert">
      <Result
        status="error"
        title={fa.error.title}
        subTitle={message ?? fa.error.message}
        extra={
          onRetry === undefined ? null : (
            <Button color="primary" variant="outlined" size="small" onClick={onRetry}>
              {fa.error.retry}
            </Button>
          )
        }
      />
    </div>
  );
}
