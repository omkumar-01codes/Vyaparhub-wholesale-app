'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import UpiQrModal from '@/components/UpiQrModal';
import {
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Tag,
  Building2,
  PhoneCall,
  MapPin,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  History,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  X,
  TrendingUp,
  Percent,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function CatalogPage() {
  const {
    products,
    currentCustomer,
    dealerProfile,
    role,
    setRole,
    getCustomerLedger,
    recordPayment,
    t
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC' | 'MARGIN'>('POPULAR');
  const [showRecentHistory, setShowRecentHistory] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  const categories = [
    'ALL',
    ...Array.from(new Set(products.map((p) => p.category)))
  ];

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return a.wholesalePrice - b.wholesalePrice;
      if (sortBy === 'PRICE_DESC') return b.wholesalePrice - a.wholesalePrice;
      if (sortBy === 'MARGIN') {
        const marginA = (a.mrp - a.wholesalePrice) / a.mrp;
        const marginB = (b.mrp - b.wholesalePrice) / b.mrp;
        return marginB - marginA;
      }
      return 0; // POPULAR / default
    });

  // Credit calculation (Feature 4)
  const creditUsagePercent = Math.min(
    100,
    Math.round((currentCustomer.outstandingDebt / currentCustomer.creditLimit) * 100)
  );

  const getCreditBarColor = (pct: number) => {
    if (pct > 80) return 'bg-rose-500';
    if (pct > 50) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  // Recent 5 Transactions (Feature 5)
  const customerLedger = getCustomerLedger(currentCustomer.id);
  const recentTransactions = customerLedger.slice(0, 5);

  const handlePaymentCompleted = (utr: string) => {
    recordPayment({
      customerId: currentCustomer.id,
      amount: currentCustomer.outstandingDebt,
      paymentMode: 'UPI',
      referenceNumber: utr,
      notes: 'Quick Direct UPI QR Settlement from Storefront'
    });
    setShowUpiModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome / Dealer Trust Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-white p-6 sm:p-8 shadow-2xl border border-blue-800/80 dark:border-slate-800">
        <div className="relative z-10 max-w-2xl lg:max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/25 dark:bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-200 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {t('verifiedCatalog')}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-blue-100/90 dark:text-slate-300 leading-relaxed max-w-xl">
            {t('heroDesc')} <span className="font-bold text-white underline decoration-blue-400">{dealerProfile.businessName}</span>. Factory bulk rates with instant billing and flexible Khata settlement.
          </p>

          {/* Quick Wholesale Benefits Pills */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2.5 bg-white/10 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl p-3 border border-white/10 dark:border-slate-700/60 shadow-xs">
              <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('digitalKhataSupport')}</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/10 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl p-3 border border-white/10 dark:border-slate-700/60 shadow-xs">
              <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('instantUpiDirect')}</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/10 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl p-3 border border-white/10 dark:border-slate-700/60 shadow-xs">
              <Truck className="w-4 h-4 text-blue-300 shrink-0" />
              <span>{t('sameDayDispatch')}</span>
            </div>
          </div>
        </div>

        {/* Floating Retailer Account Balance Card (Features 4 & 5) */}
        <div className="mt-6 lg:mt-0 lg:absolute lg:top-8 lg:right-8 bg-white/15 dark:bg-slate-900/90 backdrop-blur-xl border border-white/25 dark:border-slate-700 rounded-3xl p-5 text-left lg:max-w-sm w-full shadow-2xl">
          <div className="text-[11px] uppercase font-extrabold text-blue-200 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              {currentCustomer.businessName}
            </span>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              {currentCustomer.city}
            </span>
          </div>

          <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            ₹{currentCustomer.outstandingDebt.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-blue-200/80 dark:text-slate-400 uppercase font-bold tracking-wider">
            Current Outstanding Balance
          </div>

          {/* Feature 4: Credit Limit Indicator */}
          <div className="mt-3 pt-3 border-t border-white/15 dark:border-slate-700/80">
            <div className="flex justify-between text-[11px] text-blue-100 dark:text-slate-300 font-semibold mb-1">
              <span>
                ₹{currentCustomer.outstandingDebt.toLocaleString('en-IN')} {t('usedOf')} ₹{currentCustomer.creditLimit.toLocaleString('en-IN')} {t('limit')}
              </span>
              <span className="font-mono font-bold">{creditUsagePercent}%</span>
            </div>
            <div className="w-full h-2 bg-white/20 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${getCreditBarColor(creditUsagePercent)}`}
                style={{ width: `${creditUsagePercent}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {currentCustomer.outstandingDebt > 0 ? (
              <button
                onClick={() => setShowUpiModal(true)}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Pay via UPI</span>
              </button>
            ) : (
              <div className="inline-flex items-center justify-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-2 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Debt</span>
              </div>
            )}

            <Link
              href="/my-debt"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl transition-all border border-white/20"
            >
              <span>Full Khata</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 5: Recent Transactions Collapsible Mini-Table */}
          <div className="mt-3 pt-2 border-t border-white/15 dark:border-slate-700/80">
            <button
              onClick={() => setShowRecentHistory(!showRecentHistory)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-blue-200 dark:text-slate-300 hover:text-white transition-colors py-1"
            >
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                {t('recentTransactions')}
              </span>
              {showRecentHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showRecentHistory && (
              <div className="mt-2 bg-black/30 dark:bg-slate-950/80 rounded-2xl p-2.5 space-y-1.5 text-[11px] animate-in fade-in max-h-48 overflow-y-auto border border-white/10 dark:border-slate-800">
                {recentTransactions.length === 0 ? (
                  <p className="text-slate-400 text-center py-1 text-[10px]">No recent transactions</p>
                ) : (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-1 border-b border-white/10 last:border-0">
                      <div>
                        <span className="font-semibold text-slate-200">
                          {tx.type === 'DEBIT_ORDER' ? '🛒 Order' : '💳 Paid (' + tx.paymentMode + ')'}
                        </span>
                        <div className="text-[9px] text-slate-400 font-mono">
                          {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className={`font-bold ${tx.type === 'DEBIT_ORDER' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {tx.type === 'DEBIT_ORDER' ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`}
                        </span>
                        <div className="text-[9px] text-slate-300">Bal: ₹{tx.runningBalance.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 w-full sm:w-auto">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="hidden md:inline text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-900 dark:text-white outline-none cursor-pointer text-xs"
              >
                <option value="POPULAR" className="dark:bg-slate-900">Featured / Popular</option>
                <option value="PRICE_ASC" className="dark:bg-slate-900">Rate: Low to High</option>
                <option value="PRICE_DESC" className="dark:bg-slate-900">Rate: High to Low</option>
                <option value="MARGIN" className="dark:bg-slate-900">Highest Profit Margin</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold shrink-0 hidden sm:block">
              {t('showingItems')}: <b className="text-slate-900 dark:text-white font-mono">{filteredProducts.length}</b>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mr-1 flex items-center gap-1 shrink-0">
            <Tag className="w-3 h-3" /> {t('category')}
          </span>
          {categories.map((cat) => {
            const count = cat === 'ALL'
              ? products.length
              : products.filter((p) => p.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat === 'ALL' ? t('allCategories') : cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === cat
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No matching products found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or switch category filter to view other wholesale stock.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/25"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Storefront Quick UPI QR Modal */}
      <UpiQrModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        amount={currentCustomer.outstandingDebt}
        onPaymentComplete={handlePaymentCompleted}
        title="Pay Outstanding Debt Balance"
      />
    </div>
  );
}
