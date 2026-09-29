'use client';

import React from 'react';
import DealerGuard from '@/components/DealerGuard';

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  return <DealerGuard>{children}</DealerGuard>;
}
