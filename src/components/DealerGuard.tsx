'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Lock, LogIn } from 'lucide-react';

// UI convenience only. The real protection is server-side: middleware + per-route role checks.
export default function DealerGuard({ children }: { children: React.ReactNode }) {
  const { isDealerUnlocked, openAuthModal, dealerProfile } = useApp();

  if (isDealerUnlocked) return <>{children}</>;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-xl font-black">Dealer Center</h2>
          <p className="text-xs text-slate-400 mt-1">{dealerProfile.businessName}</p>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">Sign in with your dealer account to continue.</p>
          <button
            onClick={() => openAuthModal('LOGIN')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm"
          >
            <LogIn className="w-4 h-4" /> Dealer Login
          </button>
        </div>
      </div>
    </div>
  );
}
