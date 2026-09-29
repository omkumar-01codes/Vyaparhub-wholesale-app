'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { generateInvoicePdf, generateDeliveryChallanPdf } from '@/lib/pdf-generator';
import { exportOrdersToExcel, exportOrdersToPdf } from '@/lib/export-utils';
import { Order } from '@/lib/types';
import {
  Receipt,
  Download,
  Calendar,
  CreditCard,
  QrCode,
  Truck,
  ArrowRight,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  ChevronDown,
  MessageCircle,
  Clock,
  ShieldAlert,
  PackageCheck
} from 'lucide-react';

export default function RetailerOrdersPage() {
  const { orders, currentCustomer, dealerProfile, t } = useApp();
  const [search, setSearch] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filter orders for the active logged-in customer
  const customerOrders = orders.filter(
    (o) =>
      o.customerId === currentCustomer.id &&
      (o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase())))
  );

  const handleDownloadPdf = (order: Order) => {
    generateInvoicePdf(order, dealerProfile, currentCustomer);
  };

  const handleDownloadChallan = (order: Order) => {
    generateDeliveryChallanPdf(order, dealerProfile, currentCustomer);
  };

  const handleSendWhatsApp = (order: Order) => {
    const itemsList = order.items
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.productName}* (${item.packSize})\n   Qty: ${item.quantity} | Total: ₹${item.totalPrice.toLocaleString('en-IN')}`
      )
      .join('\n');

    const paymentLabel =
      order.paymentMode === 'CREDIT_DEBT'
        ? 'Bought on Credit (Khata)'
        : order.paymentMode === 'UPI_QR'
        ? `Paid via UPI (Ref: ${order.upiReference})`
        : 'Cash / Bank Transfer';

    const message = `*📦 WHOLESALE PURCHASE ORDER RECEIPT*\n-----------------------------------------\n*Order ID:* ${order.orderNumber}\n*Date:* ${new Date(order.createdAt).toLocaleDateString('en-IN')}\n*Wholesaler:* ${dealerProfile.businessName}\n*Buyer:* ${order.businessName}\n\n*ITEMS:*\n${itemsList}\n\n*Grand Total:* *₹${order.totalAmount.toLocaleString('en-IN')}*\n*Payment:* ${paymentLabel}\n*Fulfillment Status:* ${order.orderStatus}\n-----------------------------------------\nOfficial bill generated on VyaparHub.`;

    const cleanPhone = dealerProfile.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('myOrdersBills')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Viewing wholesale order history and printable GST bills for <b>{currentCustomer.businessName}</b> ({currentCustomer.city}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('exportData')}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in">
                <button
                  onClick={() => {
                    void exportOrdersToExcel(customerOrders, `${currentCustomer.businessName}_Orders.xlsx`);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('exportExcel')}</span>
                </button>
                <button
                  onClick={() => {
                    exportOrdersToPdf(customerOrders, dealerProfile);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('exportPdf')}</span>
                </button>
              </div>
            )}
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <span>+ Place New Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-colors">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by order ID or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {customerOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center transition-colors">
            <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Orders Found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              You haven&apos;t placed any wholesale orders matching this filter yet.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
            >
              Browse Wholesale Catalog
            </Link>
          </div>
        ) : (
          customerOrders.map((order) => {
            const isDebt = order.paymentMode === 'CREDIT_DEBT';
            const isUpi = order.paymentMode === 'UPI_QR';
            const isVerificationPending = order.paymentStatus === 'VERIFICATION_PENDING';
            const isPartiallyDispatched = order.orderStatus === 'PARTIALLY_DISPATCHED';

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Order ID</div>
                      <div className="text-sm font-extrabold text-blue-700 dark:text-blue-400 font-mono">
                        {order.orderNumber}
                      </div>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Placed On</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Payment Status</div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        {isDebt ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 font-bold text-[11px]">
                            <CreditCard className="w-3 h-3" /> Added to Khata (Debt)
                          </span>
                        ) : isUpi ? (
                          isVerificationPending ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 font-bold text-[11px]">
                              <Clock className="w-3 h-3" /> Verification Pending (Ref: {order.upiReference})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-bold text-[11px]">
                              <QrCode className="w-3 h-3" /> Paid via UPI (Verified)
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium text-[11px]">
                            <Truck className="w-3 h-3" /> Cash / Bank Transfer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Status & Actions */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : order.orderStatus === 'DISPATCHED'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : order.orderStatus === 'PARTIALLY_DISPATCHED'
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {order.orderStatus.replace('_', ' ')}
                    </span>

                    {/* WhatsApp share */}
                    <button
                      onClick={() => handleSendWhatsApp(order)}
                      className="p-2 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors"
                      title="Share Order via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    {/* PDF Download */}
                    <button
                      onClick={() => handleDownloadPdf(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                      title="Download GST Invoice"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>

                    {/* Delivery Challan for Partial/Full Dispatches */}
                    {(order.orderStatus === 'PARTIALLY_DISPATCHED' || order.orderStatus === 'DISPATCHED') && (
                      <button
                        onClick={() => handleDownloadChallan(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                        title="Download Delivery Challan"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Challan</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="p-4 sm:p-5">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700"
                      >
                        <div className="flex-1">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{item.productName}</span>
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] ml-2">
                            ({item.packSize})
                          </span>
                          {item.dispatchedQuantity !== undefined && item.dispatchedQuantity !== item.quantity && (
                            <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-bold">
                              • Dispatched: {item.dispatchedQuantity} | Backordered: {item.backorderedQuantity}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 dark:text-slate-400 text-[11px] mr-3">
                            Qty: <b className="text-slate-800 dark:text-slate-200">{item.quantity}</b> × ₹{item.wholesalePrice}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            ₹{item.totalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 dark:text-slate-400">
                      Destination: <b className="text-slate-700 dark:text-slate-200">{order.city}, {order.state}</b>
                      {order.deliveryChallanNumber && (
                        <span className="ml-3 font-mono text-indigo-600 dark:text-indigo-400">
                          Challan: {order.deliveryChallanNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-500 dark:text-slate-400">Grand Total (incl. GST):</span>
                      <span className="text-base font-extrabold text-blue-700 dark:text-blue-400 font-mono">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
