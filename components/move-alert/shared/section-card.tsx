import { PropsWithChildren } from 'react';

import { Box } from '@/components/ui/box';

type SectionCardProps = PropsWithChildren<{
  className?: string;
}>;

export function SectionCard({ children, className }: SectionCardProps) {
  return <Box className={`rounded-3xl bg-background-0 p-5 shadow-soft-1 ${className ?? ''}`}>{children}</Box>;
}
