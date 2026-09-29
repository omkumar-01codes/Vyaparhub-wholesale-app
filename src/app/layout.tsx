'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import './globals.css';
import { AppProvider, useApp } from '@/lib/store';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';

function FloatingCartButton() {
  const { cartItemCount, cartTotal, openCart, t } = useApp();
  const pathname = usePathname();

  if (pathname.startsWith('/dealer') || cartItemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-6 duration-300">
      <button
        onClick={openCart}
        className="group relative flex items-center gap-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white pl-4 pr-5 py-3 rounded-full shadow-2xl shadow-indigo-500/40 border border-white/20 transition-all hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
            {cartItemCount}
          </span>
        </div>

        <div className="text-left">
          <div className="text-[10px] uppercase font-extrabold text-blue-200 tracking-wider">
            Running Cart ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
          </div>
          <div className="text-sm font-black text-white font-mono">
            ₹{cartTotal.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-1 transition-transform ml-1">
          <ArrowRight className="w-4 h-4 text-white" />
        </div>
      </button>
    </div>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const { isCartOpen, closeCart, openCart } = useApp();

  return (
    <>
      <Navbar onOpenCart={openCart} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <FloatingCartButton />
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <Footer />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>VyaparHub — Next-Gen B2B Wholesale Commerce</title>
        <meta
          name="description"
          content="Modern wholesale commerce platform with MOQ pricing, Khata credit ledger, direct UPI QR payments, and AI business intelligence."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
        <AppProvider>
          <MainLayout>{children}</MainLayout>
        </AppProvider>
      </body>
    </html>
  );
}
