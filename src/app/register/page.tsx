'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import AuthModal from '@/components/AuthModal';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, role, openAuthModal, isAuthModalOpen } = useApp();

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'DEALER') router.push('/dealer');
      else if (role === 'SALES_REP') router.push('/sales');
      else router.push('/');
    } else {
      openAuthModal('REGISTER');
    }
  }, [isAuthenticated, role, openAuthModal, router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Register Kirana Store</h1>
        <p className="text-sm text-slate-500">Join the direct FMCG wholesale network & activate your Kirana credit line.</p>
        {!isAuthModalOpen && (
          <button
            onClick={() => openAuthModal('REGISTER')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Open Store Registration
          </button>
        )}
      </div>
      <AuthModal />
    </div>
  );
}
