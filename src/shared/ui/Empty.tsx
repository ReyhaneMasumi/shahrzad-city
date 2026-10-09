import { FolderOpen } from 'iconsax-react';
import { fa } from '@/shared/i18n/fa';
import Icon from './Icon';
import type { EmptyProps } from './Empty.types';

/** Neutral empty state: icon, title, optional message and action. */
export default function Empty({ message, action }: EmptyProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-sm p-xl text-center"
    >
      <Icon icon={FolderOpen} size={48} className="text-content-tertiary" />
      <p className="text-heading-sm text-content-primary">{fa.empty.title}</p>
      <p className="text-body-sm text-content-tertiary">{message ?? fa.empty.message}</p>
      {action}
    </div>
  );
}
