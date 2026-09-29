'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  Store,
  ShoppingCart,
  Receipt,
  BookOpen,
  LayoutDashboard,
  Package,
  FileSpreadsheet,
  Sparkles,
  Building2,
  Bell,
  Lamp,
  LampDesk,
  AlertTriangle,
  ArrowRight,
  Globe,
  ChevronDown,
  Lock,
  Unlock,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Bike,
  LogIn,
  LogOut,
  User,
  UserPlus
} from 'lucide-react';
import AuthModal from './AuthModal';

export default function Navbar({ onOpenCart }: { onOpenCart: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    role,
    setRole,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    t,
    isDealerUnlocked,
    lockDealer,
    currentCustomer,
    setCurrentCustomer,
    customers,
    cartItemCount,
    dealerProfile,
    lowStockProducts,
    currentUser,
    isAuthenticated,
    logout,
    openAuthModal
  } = useApp();

  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isDealer = pathname.startsWith('/dealer') || role === 'DEALER';

  const handleDealerClick = () => {
    if (!isDealerUnlocked) {
      openAuthModal('LOGIN'); // dealer access requires a real dealer login
    } else {
      setRole('DEALER');
      router.push('/dealer');
    }
  };

  const handleRetailerClick = () => {
    setRole('RETAILER');
    router.push('/');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsBellOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
      {/* Top Banner / Merchant & Role Switcher */}
      <div className="bg-slate-950 text-slate-200 text-xs py-2 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-white tracking-tight">{dealerProfile.businessName}</span>
            <span className="text-slate-400 hidden md:inline text-[11px]">• Direct FMCG Wholesale Network</span>
          </div>

          {/* Active Retailer Switcher for Buyer View */}
          {!isDealer && (
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-700/80">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-400 hidden sm:inline">Store:</span>
              <select
                value={currentCustomer.id}
                onChange={(e) => {
                  const found = customers.find((c) => c.id === e.target.value);
                  if (found) setCurrentCustomer(found);
                }}
                className="bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-[11px] py-1 px-2.5 rounded-lg border border-slate-700 outline-none cursor-pointer transition-colors shadow-xs"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} ({c.city})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Fancy Segmented Mode Switcher */}
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400 text-[11px] hidden sm:inline font-medium">Mode:</span>
          <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 shadow-inner">
            <button
              onClick={handleRetailerClick}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                !isDealer && !pathname.startsWith('/sales')
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t('retailerPortal')}</span>
            </button>
            <button
              onClick={() => {
                setRole('SALES_REP');
                router.push('/sales');
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                pathname.startsWith('/sales') || role === 'SALES_REP'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Salesman Mode</span>
            </button>
            <button
              onClick={handleDealerClick}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                isDealer
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {!isDealerUnlocked ? (
                <Lock className="w-3 h-3 text-amber-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              )}
              <span>{t('dealerCenter')}</span>
            </button>
          </div>

          {/* Quick Lock Button for Dealer */}
          {isDealer && isDealerUnlocked && (
            <button
              onClick={() => {
                lockDealer();
                router.push('/');
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-all flex items-center gap-1 shadow-xs"
              title="Log out of Dealer Center"
            >
              <Lock className="w-3 h-3 text-rose-400" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Brand Logo */}
          <Link href={isDealer ? "/dealer" : "/"} className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight leading-tight">
                  Vyapar<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Hub</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 tracking-wider">
                  B2B
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase block">
                {isDealer ? 'Wholesale Dealer Suite' : 'Direct Wholesale Store'}
              </span>
            </div>
          </Link>

          {/* Navigation Links according to active role */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold">
            {isDealer ? (
              <>
                <Link
                  href="/dealer"
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    pathname === '/dealer'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t('dealerOverview')}
                </Link>
                <Link
                  href="/dealer/products"
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    pathname === '/dealer/products'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  {t('stockPricing')}
                </Link>
                <Link
                  href="/dealer/orders"
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    pathname === '/dealer/orders'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {t('orders')}
                </Link>
                <Link
                  href="/dealer/ledger"
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    pathname === '/dealer/ledger'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  {t('debtLedgerKhata')}
                </Link>
                <Link
                  href="/dealer/ai-insights"
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    pathname === '/dealer/ai-insights'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  {t('aiMonthlyRegional')}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    pathname === '/'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {t('wholesaleCatalog')}
                </Link>
                <Link
                  href="/orders"
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    pathname === '/orders'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  {t('myOrdersBills')}
                </Link>
                <Link
                  href="/my-debt"
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    pathname === '/my-debt'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  {t('myDebtBalance')}
                </Link>
              </>
            )}
          </nav>

          {/* Right Controls: Lamp, Bell, Language, Cart */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
              title="Toggle English / Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Glowing Lamp Night Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300 shadow-xs"
              title="Toggle Night / Day Mode"
            >
              {theme === 'light' ? (
                <LampDesk className="w-4 h-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              ) : (
                <Lamp className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Low-Stock Alert Bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setIsBellOpen(!isBellOpen)}
                className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 shadow-xs"
                title="Low Stock Alert"
              >
                <Bell className="w-4 h-4" />
                {lowStockProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow">
                    {lowStockProducts.length}
                  </span>
                )}
              </button>

              {/* Low Stock Dropdown */}
              {isBellOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {t('lowStockAlert')}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-full">
                      {lowStockProducts.length} items
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                    {lowStockProducts.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">All products sufficiently stocked.</p>
                    ) : (
                      lowStockProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.sku}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                              {p.stockQty} left
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href="/dealer/products"
                      onClick={() => setIsBellOpen(false)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                    >
                      <span>{t('restockInventory')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Auth Section: Sign In / Register vs Profile Dropdown */}
            {!currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openAuthModal('LOGIN')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuthModal('REGISTER')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Register</span>
                </button>
              </div>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all text-left cursor-pointer shadow-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-[100px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 capitalize">
                      {currentUser.role.toLowerCase().replace('_', ' ')}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in duration-150">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">{currentUser.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {currentUser.role}
                      </span>
                    </div>

                    {currentUser.role === 'RETAILER' && currentCustomer && (
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl my-2 text-xs space-y-1">
                        <div className="text-slate-500 text-[10px] uppercase font-bold">Store Account:</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{currentCustomer.businessName}</div>
                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-slate-500">Khata Debt:</span>
                          <span className="font-bold text-amber-600 font-mono">₹{currentCustomer.outstandingDebt.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Credit Limit:</span>
                          <span className="font-bold text-emerald-600 font-mono">₹{currentCustomer.creditLimit.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 pt-1">
                      {currentUser.role === 'RETAILER' && (
                        <>
                          <Link
                            href="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5 text-blue-500" />
                            <span>My Wholesale Orders</span>
                          </Link>
                          <Link
                            href="/my-debt"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                            <span>My Khata Ledger & Dues</span>
                          </Link>
                        </>
                      )}

                      {currentUser.role === 'DEALER' && (
                        <Link
                          href="/dealer"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Dealer Dashboard</span>
                        </Link>
                      )}

                      {currentUser.role === 'SALES_REP' && (
                        <Link
                          href="/sales"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Bike className="w-3.5 h-3.5 text-amber-500" />
                          <span>Sales Booking Portal</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Trigger Button for Retailer */}
            {(!pathname.startsWith('/dealer') || cartItemCount > 0) && (
              <button
                onClick={onOpenCart}
                className="relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition-all active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">{t('wholesaleCart')}</span>
                {cartItemCount > 0 && (
                  <span className="inline-flex items-center justify-center bg-amber-400 text-slate-950 font-black text-xs w-5 h-5 rounded-full shadow animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Dealer Badge when in Dealer View */}
            {isDealer && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{t('dealerModeActive')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        {isDealer ? (
          <>
            <Link href="/dealer" className="flex flex-col items-center gap-1 p-1">
              <LayoutDashboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('dealerOverview')}</span>
            </Link>
            <Link href="/dealer/products" className="flex flex-col items-center gap-1 p-1">
              <Package className="w-4 h-4" />
              <span>{t('stockPricing')}</span>
            </Link>
            <Link href="/dealer/orders" className="flex flex-col items-center gap-1 p-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t('orders')}</span>
            </Link>
            <Link href="/dealer/ledger" className="flex flex-col items-center gap-1 p-1">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('debtLedgerKhata')}</span>
            </Link>
            <Link href="/dealer/ai-insights" className="flex flex-col items-center gap-1 p-1">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('aiMonthlyRegional')}</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/" className="flex flex-col items-center gap-1 p-1">
              <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t('wholesaleCatalog')}</span>
            </Link>
            <Link href="/orders" className="flex flex-col items-center gap-1 p-1">
              <Receipt className="w-4 h-4" />
              <span>{t('myOrdersBills')}</span>
            </Link>
            <Link href="/my-debt" className="flex flex-col items-center gap-1 p-1">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('myDebtBalance')}</span>
            </Link>
          </>
        )}
      </div>


      {/* Global Auth Modal */}
      <AuthModal />
    </header>
  );
}
