'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import RevenueComparisonChart from '@/components/RevenueComparisonChart';
import RegionalAdviceCard from '@/components/RegionalAdviceCard';
import RecordPaymentModal from '@/components/RecordPaymentModal';
import { generateInvoicePdf } from '@/lib/pdf-generator';
import {
  TrendingUp,
  DollarSign,
  BookOpen,
  Package,
  FileSpreadsheet,
  Sparkles,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  Users
} from 'lucide-react';

export default function DealerDashboard() {
  const {
    monthlyStats,
    regionalData,
    orders,
    customers,
    products,
    dealerProfile,
    aiAnalysisText,
    isGeneratingAi,
    generateAiInsights,
    t
  } = useApp();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const currentMonthData = monthlyStats[monthlyStats.length - 1];
  const totalMarketDebt = customers.reduce((sum, c) => sum + c.outstandingDebt, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PENDING');
  const lowStockProducts = products.filter((p) => p.stockQty < 150);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Wholesale Master Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {dealerProfile.businessName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Welcome back, {dealerProfile.name}. Here is your live business snapshot, credit ledger status, and AI sales insights.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/25 transition-all active:scale-95"
          >
            <DollarSign className="w-4 h-4" />
            {t('recordPayment')}
          </button>
          <Link
            href="/dealer/products"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            <Package className="w-4 h-4 text-blue-400" />
            Manage Stock ({products.length})
          </Link>
          <Link
            href="/dealer/ai-insights"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            AI Insights
          </Link>
        </div>
      </div>

      {/* 4 Core KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Sales Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">
              August Sales Revenue
            </span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
            ₹{currentMonthData.salesRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+16.4% vs July (₹5.40L)</span>
          </div>
        </div>

        {/* Metric 2: Total Outstanding Debt */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">
              Market Debt (Khata Balance)
            </span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-2 font-mono">
            ₹{totalMarketDebt.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Across {customers.length} retail accounts
          </div>
        </div>

        {/* Metric 3: Debt Recovered This Month */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">
              August Debt Recovered
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2 font-mono">
            ₹{currentMonthData.debtRecovered.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            92.6% collection efficiency
          </div>
        </div>

        {/* Metric 4: Active Orders */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">
              Orders for Dispatch
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {pendingOrders.length} Orders
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
            {lowStockProducts.length} low stock alerts
          </div>
        </div>
      </div>

      {/* 3-Month Comparison Chart */}
      <RevenueComparisonChart data={monthlyStats} />

      {/* AI Snapshot Callout */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-indigo-800/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Business Summary & Health Report
              </h3>
              <p className="text-xs text-blue-200">
                Computed from your real order history, regional sales, and debt recovery — refreshed on demand.
              </p>
            </div>
          </div>

          <button
            onClick={generateAiInsights}
            disabled={isGeneratingAi}
            className="px-4 py-2 bg-white text-indigo-950 font-bold text-xs rounded-xl hover:bg-blue-50 transition-all shadow-md active:scale-95 shrink-0"
          >
            {isGeneratingAi ? 'Analyzing...' : 'Refresh Report'}
          </button>
        </div>

        {aiAnalysisText ? (
          <div className="bg-black/25 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-xs leading-relaxed space-y-2 text-slate-200 font-normal">
            <div className="whitespace-pre-line">{aiAnalysisText}</div>
          </div>
        ) : (
          <div className="bg-black/20 border border-white/10 rounded-2xl p-4 text-xs text-blue-200 flex items-center justify-between">
            <span>
              💡 Tap <b>&quot;Refresh Report&quot;</b> to run deep reasoning over state-wise sales performance and get stock restock alerts.
            </span>
          </div>
        )}
      </div>

      {/* Regional Advice Breakdown */}
      <RegionalAdviceCard regions={regionalData} />

      {/* Recent Orders Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/60">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Recent Wholesale Orders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest incoming retailer orders across states.
            </p>
          </div>
          <Link
            href="/dealer/orders"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All ({orders.length}) →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {orders.slice(0, 4).map((order) => (
            <div
              key={order.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{order.businessName}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    ({order.city}, {order.state})
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Order #{order.orderNumber} • {order.items.length} items •{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {order.paymentMode === 'CREDIT_DEBT'
                      ? 'Bought on Credit'
                      : order.paymentMode === 'UPI_QR'
                      ? 'Paid via UPI'
                      : 'COD / Bank'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-sm font-extrabold text-blue-700 dark:text-blue-400 font-mono">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      order.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : order.orderStatus === 'DISPATCHED'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <button
                  onClick={() => generateInvoicePdf(order, dealerProfile)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  title="Download Invoice PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
      />
    </div>
  );
}
