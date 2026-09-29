'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { generateInvoicePdf, generateDeliveryChallanPdf } from '@/lib/pdf-generator';
import { exportOrdersToExcel, exportOrdersToPdf } from '@/lib/export-utils';
import { OrderStatus, PaymentStatus, Order } from '@/lib/types';
import FulfillOrderModal from '@/components/FulfillOrderModal';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import ShippingLabelModal from '@/components/ShippingLabelModal';
import EwayBillModal from '@/components/EwayBillModal';
import {
  FileSpreadsheet,
  Search,
  Download,
  Calendar,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Filter,
  ChevronDown,
  Clock,
  ShieldCheck,
  ShieldAlert,
  PackageCheck,
  Barcode,
  Printer
} from 'lucide-react';

export default function DealerOrdersPage() {
  const {
    orders,
    updateOrderStatus,
    updatePaymentStatus,
    verifyPayment,
    fulfillOrderPartially,
    dealerProfile,
    customers,
    t
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedOrderForFulfill, setSelectedOrderForFulfill] = useState<Order | null>(null);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);

  // Barcode Scanner & Shipping Label States
  const [selectedOrderForScanner, setSelectedOrderForScanner] = useState<Order | null>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedOrderForEwb, setSelectedOrderForEwb] = useState<Order | null>(null);
  const [isEwbModalOpen, setIsEwbModalOpen] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.businessName.toLowerCase().includes(search.toLowerCase()) ||
      order.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadInvoice = (order: Order) => {
    const cust = customers.find((c) => c.id === order.customerId);
    generateInvoicePdf(order, dealerProfile, cust);
  };

  const handleDownloadChallan = (order: Order) => {
    const cust = customers.find((c) => c.id === order.customerId);
    generateDeliveryChallanPdf(order, dealerProfile, cust);
  };

  const handleOpenFulfill = (order: Order) => {
    setSelectedOrderForFulfill(order);
    setIsFulfillModalOpen(true);
  };

  const handleOpenScanner = (order: Order) => {
    setSelectedOrderForScanner(order);
    setIsScannerModalOpen(true);
  };

  const handleOpenLabel = (order: Order) => {
    setSelectedOrderForLabel(order);
    setIsLabelModalOpen(true);
  };

  const handleOpenEwb = (order: Order) => {
    setSelectedOrderForEwb(order);
    setIsEwbModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Wholesale Orders & Dispatch Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track retailer order fulfillments, verify incoming UPI payments, manage partial backorders, and generate delivery challans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('exportData')}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in">
                <button
                  onClick={() => {
                    void exportOrdersToExcel(filteredOrders, 'Dealer_Wholesale_Orders.xlsx');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('exportExcel')}</span>
                </button>
                <button
                  onClick={() => {
                    exportOrdersToPdf(filteredOrders, dealerProfile);
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

          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 px-3.5 rounded-xl">
            Active Orders: <b className="text-slate-900 dark:text-white">{orders.length}</b>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by order ID, retailer name, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'CONFIRMED', 'PARTIALLY_DISPATCHED', 'DISPATCHED', 'DELIVERED', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const isDebt = order.paymentMode === 'CREDIT_DEBT';
          const isUpi = order.paymentMode === 'UPI_QR';
          const isVerificationPending = order.paymentStatus === 'VERIFICATION_PENDING';
          const isRejected = order.paymentStatus === 'REJECTED';

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all"
            >
              {/* Problem 2: Verification Action Banner if Pending */}
              {isVerificationPending && (
                <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-300 dark:border-amber-800 p-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <span className="font-bold">⚠️ UPI Payment Verification Needed:</span> Retailer submitted UTR:{' '}
                      <b className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                        {order.upiReference}
                      </b>
                      {order.upiProofNote && (
                        <span className="ml-1 text-slate-600 dark:text-slate-400">
                          ({order.upiProofNote})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => verifyPayment(order.id, true)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approve & Mark Paid</span>
                    </button>
                    <button
                      onClick={() => {
                        const note = window.prompt('Reason for payment rejection:', 'Amount not credited');
                        if (note) verifyPayment(order.id, false, note);
                      }}
                      className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-800 dark:text-rose-300 rounded-lg text-xs font-bold border border-rose-300 dark:border-rose-800 transition-all"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Top Banner */}
              <div className="p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Order ID</div>
                    <div className="text-sm font-extrabold text-blue-700 dark:text-blue-400 font-mono">
                      {order.orderNumber}
                    </div>
                  </div>

                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                  <div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Retailer</div>
                    <div className="font-bold text-slate-900 dark:text-white">{order.businessName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {order.customerName} ({order.city}, {order.state})
                    </div>
                  </div>

                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                  <div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Date Placed</div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                  <div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Payment</div>
                    <div>
                      {isDebt ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 font-bold text-[11px]">
                          <CreditCard className="w-3 h-3" /> Added to Khata (Debt)
                        </span>
                      ) : isUpi ? (
                        isVerificationPending ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 font-bold text-[11px]">
                            <Clock className="w-3 h-3" /> Verification Pending
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 font-bold text-[11px]">
                            <ShieldAlert className="w-3 h-3" /> Payment Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-bold text-[11px]">
                            <QrCode className="w-3 h-3" /> Paid via UPI (Verified)
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium text-[11px]">
                          <Truck className="w-3 h-3" /> COD / Bank
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions & Status Dropdown */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Barcode & QR Warehouse Scanner Trigger */}
                  {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                    <button
                      onClick={() => handleOpenScanner(order)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                      title="Scan Cartons with Barcode / QR Scanner"
                    >
                      <Barcode className="w-3.5 h-3.5" />
                      <span>Scan & Verify</span>
                    </button>
                  )}

                  {/* Shipping Label / Carton Slip */}
                  <button
                    onClick={() => handleOpenLabel(order)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95"
                    title="Print B2B Shipping Label & QR Code"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Label</span>
                  </button>

                  {/* Government E-Way Bill Button (> ₹50,000 consignment) */}
                  {(order.totalAmount > 50000 || order.ewayBillNumber) && (
                    <button
                      onClick={() => handleOpenEwb(order)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-300 dark:border-emerald-800 transition-all active:scale-95 shadow-2xs"
                      title="View Government E-Way Bill Slip (> ₹50,000)"
                    >
                      <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>E-Way Bill</span>
                    </button>
                  )}

                  {/* Manual Fulfill / Dispatch Trigger */}
                  {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                    <button
                      onClick={() => handleOpenFulfill(order)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>{order.orderStatus === 'PARTIALLY_DISPATCHED' ? 'Continue Dispatch' : 'Fulfill'}</span>
                    </button>
                  )}

                  <select
                    value={order.orderStatus}
                    onChange={(e) =>
                      updateOrderStatus(order.id, e.target.value as OrderStatus)
                    }
                    className={`text-xs font-bold py-1.5 px-3 rounded-xl border outline-none cursor-pointer uppercase ${
                      order.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : order.orderStatus === 'DISPATCHED'
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                        : order.orderStatus === 'PARTIALLY_DISPATCHED'
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PARTIALLY_DISPATCHED">PARTIALLY DISPATCHED</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <button
                    onClick={() => handleDownloadInvoice(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                    title="Download Tax Invoice"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Invoice</span>
                  </button>

                  {(order.orderStatus === 'DISPATCHED' || order.orderStatus === 'PARTIALLY_DISPATCHED') && (
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

              {/* Items Detail */}
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
                      Order Line Items ({order.items.length} products)
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{item.productName}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              {item.packSize} • Qty: {item.quantity}
                              {item.dispatchedQuantity !== undefined && item.dispatchedQuantity !== item.quantity && (
                                <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-bold">
                                  ({item.dispatchedQuantity} disp / {item.backorderedQuantity} backorder)
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white font-mono">
                            ₹{item.totalPrice.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Contact & Billing Summary */}
                  <div className="flex flex-col justify-between bg-slate-50/60 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
                        Delivery & Contact Details
                      </div>
                      <div className="space-y-1 text-slate-700 dark:text-slate-300">
                        <div>
                          <b>Phone:</b> {order.customerPhone}
                        </div>
                        <div>
                          <b>Destination:</b> {order.city}, {order.state}
                        </div>
                        {order.deliveryChallanNumber && (
                          <div className="text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded-lg border border-indigo-200 dark:border-indigo-800 mt-2 font-mono">
                            <b>Challan #:</b> {order.deliveryChallanNumber}
                          </div>
                        )}
                        {order.notes && (
                          <div className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-2 rounded-lg border border-amber-200 dark:border-amber-800 mt-2">
                            <b>Note:</b> {order.notes}
                          </div>
                        )}
                        {order.rejectionReason && (
                          <div className="text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 p-2 rounded-lg border border-rose-200 dark:border-rose-800 mt-2">
                            <b>Rejection Reason:</b> {order.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-baseline justify-between font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Order Total (incl. GST):</span>
                      <span className="text-lg text-blue-700 dark:text-blue-400 font-extrabold font-mono">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fulfill Order Modal */}
      <FulfillOrderModal
        isOpen={isFulfillModalOpen}
        onClose={() => setIsFulfillModalOpen(false)}
        order={selectedOrderForFulfill}
      />

      {/* Warehouse Barcode & QR Code Scanner Modal */}
      {selectedOrderForScanner && (
        <BarcodeScannerModal
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
          order={selectedOrderForScanner}
          onCompleteDispatch={(orderId, fulfillmentMap, notes) => {
            fulfillOrderPartially(orderId, fulfillmentMap, notes);
          }}
        />
      )}

      {/* B2B Shipping Label & Carton Manifest Modal */}
      {selectedOrderForLabel && (
        <ShippingLabelModal
          isOpen={isLabelModalOpen}
          onClose={() => setIsLabelModalOpen(false)}
          order={selectedOrderForLabel}
          dealer={dealerProfile}
          customer={customers.find((c) => c.id === selectedOrderForLabel.customerId)}
        />
      )}

      {/* Statutory Government E-Way Bill Modal */}
      {selectedOrderForEwb && (
        <EwayBillModal
          isOpen={isEwbModalOpen}
          onClose={() => setIsEwbModalOpen(false)}
          order={selectedOrderForEwb}
          dealer={dealerProfile}
        />
      )}
    </div>
  );
}
