import { StretchItem } from '@/components/move-alert/move-alert-data';

export const toneClass: Record<StretchItem['tone'], string> = {
  error: 'bg-error-50',
  info: 'bg-info-50',
  success: 'bg-success-50',
  warning: 'bg-warning-50',
};

export const toneTextClass: Record<StretchItem['tone'], string> = {
  error: 'text-error-700',
  info: 'text-info-700',
  success: 'text-success-700',
  warning: 'text-warning-700',
};

export const toneButtonClass: Record<StretchItem['tone'], string> = {
  error: 'bg-error-600',
  info: 'bg-info-600',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
};
