import { Empty as AntdEmpty } from 'antd';
import { FolderOpen } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from '../Icon/Icon';
import type { EmptyProps } from './Empty.types';

/** Neutral empty state built on Ant Design `Empty`: icon, title, message, action. */
export default function Empty({ message, action }: EmptyProps) {
  return (
    <div role="status" className="p-xl">
      <AntdEmpty
        image={<Icon icon={FolderOpen} size={48} className="text-content-tertiary" />}
        description={
          <>
            <span className="block text-heading-sm text-content-primary">{fa.empty.title}</span>
            <span className="block text-body-sm text-content-tertiary">
              {message ?? fa.empty.message}
            </span>
          </>
        }
      >
        {action}
      </AntdEmpty>
    </div>
  );
}
