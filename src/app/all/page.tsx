'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AllPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">
      Redirecting to Wholesale Catalog...
    </div>
  );
}

