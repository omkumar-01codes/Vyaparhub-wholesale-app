'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { PaymentMode, Order, calculateItemPrice } from '@/lib/types';
import { computeOrderTotals } from '@/lib/gst';
import UpiQrModal from './UpiQrModal';
import {
  X,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  MessageCircle,
  Clock,
  ShieldAlert,
  Layers
} from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    cart,
    cartTotal,
    removeFromCart,
    updateCartQuantity,
    placeOrder,
    currentCustomer,
    dealerProfile,
    t
  } = useApp();

  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CREDIT_DEBT');
  const [orderNotes, setOrderNotes] = useState('');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedOrderSuccess, setPlacedOrderSuccess] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cartTotal;
  // Preview only - identical rules to the server (discount spread proportionally, then each
  // line taxed at its own product's GST rate). The server's figures are what actually get charged.
  const preview = computeOrderTotals(
    cart.map((item) => ({
      subtotal: calculateItemPrice(item.product, item.quantity).unitPrice * item.quantity,
      gstRate: item.product.gstRate
    })),
    true
  );
  const taxAmount = preview.taxAmount;
  const discountAmount = preview.discountAmount;
  const finalTotal = preview.totalAmount;

  const totalTierSavings = cart.reduce((sum, item) => {
    const { totalSavingsVsBase } = calculateItemPrice(item.product, item.quantity);
    return sum + totalSavingsVsBase;
  }, 0);

  // Problem 3: Hard Credit Limit Check
  const availableCredit = Math.max(0, currentCustomer.creditLimit - currentCustomer.outstandingDebt);
  const isCreditExceeded =
    paymentMode === 'CREDIT_DEBT' &&
    currentCustomer.outstandingDebt + finalTotal > currentCustomer.creditLimit;
  const creditShortfall =
    currentCustomer.outstandingDebt + finalTotal - currentCustomer.creditLimit;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (paymentMode === 'UPI_QR') {
      setShowUpiModal(true);
      return;
    }

    if (isCreditExceeded) {
      return; // Hard Block
    }

    setIsPlacing(true);
    try {
      const order = await placeOrder({
        paymentMode,
        notes: orderNotes
      });
      setPlacedOrderSuccess(order);
    } catch (err) {
      alert((err as Error).message || 'Could not place the order.');
    } finally {
      setIsPlacing(false);
    }
  };

  const handleUpiComplete = async (utr: string, proofNote?: string) => {
    setIsPlacing(true);
    try {
      const order = await placeOrder({
        paymentMode: 'UPI_QR',
        notes: orderNotes,
        upiReference: utr,
        upiProofNote: proofNote
      });
      setPlacedOrderSuccess(order);
    } catch (err) {
      alert((err as Error).message || 'Could not place the order.');
    } finally {
      setIsPlacing(false);
    }
  };

  const handleSendWhatsAppOrder = (order: Order) => {
    const itemsList = order.items
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.productName}* (${item.packSize})\n   Qty: ${item.quantity} | Rate: ₹${item.wholesalePrice} | Subtotal: ₹${item.totalPrice.toLocaleString('en-IN')}`
      )
      .join('\n');

    const paymentLabel =
      order.paymentMode === 'CREDIT_DEBT'
        ? 'Buy on Credit (Added to Khata)'
        : order.paymentMode === 'UPI_QR'
        ? `Paid via UPI (Ref: ${order.upiReference}) - Verification Pending`
        : 'Cash / Bank Transfer';

    const message = `*📦 WHOLESALE PURCHASE ORDER SUMMARY*\n-----------------------------------------\n*Order ID:* ${order.orderNumber}\n*Date:* ${new Date(order.createdAt).toLocaleDateString('en-IN')}\n*Wholesaler:* ${dealerProfile.businessName}\n*Buyer / Retailer:* ${order.businessName} (${order.customerName})\n*Destination:* ${order.city}, ${order.state}\n\n*ITEMS ORDERED:*\n${itemsList}\n\n*Subtotal:* ₹${order.subtotal.toLocaleString('en-IN')}\n*GST:* +₹${order.taxAmount.toLocaleString('en-IN')}\n*Grand Total:* *₹${order.totalAmount.toLocaleString('en-IN')}*\n*Payment Status:* ${paymentLabel}\n-----------------------------------------\nThank you for doing business with ${dealerProfile.businessName}!`;

    const cleanPhone = dealerProfile.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Wholesale Purchase Cart</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Ordering for: <b>{currentCustomer.businessName}</b></span>
              </div>
            </div>
            <button
              onClick={() => {
                setPlacedOrderSuccess(null);
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {placedOrderSuccess ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center overflow-y-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Order Placed Successfully!</h3>
              <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">
                Order ID: <b className="text-blue-600 dark:text-blue-400">{placedOrderSuccess.orderNumber}</b>
              </p>

              <div className="mt-6 w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Amount:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    ₹{placedOrderSuccess.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Payment Status:</span>
                  {placedOrderSuccess.paymentStatus === 'ADDED_TO_DEBT' ? (
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      Added to Debt Ledger (Khata)
                    </span>
                  ) : placedOrderSuccess.paymentStatus === 'VERIFICATION_PENDING' ? (
                    <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Verification Pending
                    </span>
                  ) : (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Paid (Verified)
                    </span>
                  )}
                </div>

                {placedOrderSuccess.paymentMode === 'UPI_QR' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                    ℹ️ <b>Ref #{placedOrderSuccess.upiReference}:</b> Your payment submission will be verified by {dealerProfile.businessName} before goods dispatch.
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Fulfillment Queue:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    Preparing for Dispatch
                  </span>
                </div>
              </div>

              {/* WhatsApp Share Button */}
              <div className="mt-5 w-full space-y-2">
                <button
                  onClick={() => handleSendWhatsAppOrder(placedOrderSuccess)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Order Summary via WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    setPlacedOrderSuccess(null);
                    onClose();
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Back to Storefront
                </button>
              </div>
            </div>
          ) : (
            /* Items List & Checkout Form */
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                  Your wholesale cart is empty. Add carton packs from the catalog.
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const {
                      unitPrice,
                      activeTier,
                      nextTier,
                      unitsNeededForNextTier,
                      savingsVsBase,
                      totalSavingsVsBase
                    } = calculateItemPrice(item.product, item.quantity);
                    const itemTotal = unitPrice * item.quantity;

                    return (
                      <div
                        key={item.product.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                              {item.product.name}
                            </h4>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>{item.product.packSize}</span>
                              <span>•</span>
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                ₹{unitPrice}/unit
                              </span>
                              {savingsVsBase > 0 && (
                                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
                                  Saved ₹{totalSavingsVsBase}
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono mt-1">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                            <button
                              onClick={() =>
                                updateCartQuantity(item.product.id, item.quantity - 1)
                              }
                              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartQuantity(item.product.id, item.quantity + 1)
                              }
                              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Delete item */}
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* 1-Click Volume Slab Upsell Helper */}
                        {nextTier && unitsNeededForNextTier > 0 && (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 text-[11px] text-indigo-950 dark:text-indigo-200">
                            <div>
                              <span>Add <b>{unitsNeededForNextTier} more</b> for slab: </span>
                              <b className="font-mono text-indigo-700 dark:text-indigo-300">₹{nextTier.pricePerUnit}/u</b>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(
                                  item.product.id,
                                  item.quantity + unitsNeededForNextTier
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition-all shadow-xs active:scale-95"
                            >
                              + Add {unitsNeededForNextTier}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Payment Mode Selection */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-2">
                  Select Payment Method:
                </label>
                <div className="space-y-2">
                  {/* Option 1: Credit / Debt with Enforcement */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMode === 'CREDIT_DEBT'
                        ? isCreditExceeded
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 ring-1 ring-rose-400'
                          : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 ring-1 ring-amber-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_mode"
                      value="CREDIT_DEBT"
                      checked={paymentMode === 'CREDIT_DEBT'}
                      onChange={() => setPaymentMode('CREDIT_DEBT')}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                        <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                        Buy on Credit (Debt / Udhaar)
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Amount added to your digital Khata ledger with {dealerProfile.businessName}.
                      </p>
                      
                      {/* Credit Meter Info */}
                      <div className="mt-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                          Limit: ₹{currentCustomer.creditLimit.toLocaleString('en-IN')}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Available: ₹{availableCredit.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Hard Enforcement Alert Box */}
                      {isCreditExceeded && (
                        <div className="mt-2 p-2.5 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 rounded-xl text-[11px] text-rose-800 dark:text-rose-200 space-y-1.5 animate-in fade-in">
                          <div className="font-bold flex items-center gap-1 text-rose-900 dark:text-rose-200">
                            <ShieldAlert className="w-4 h-4 text-rose-600" />
                            Credit Limit Exceeded by ₹{creditShortfall.toLocaleString('en-IN')}!
                          </div>
                          <p className="leading-tight text-rose-700 dark:text-rose-300">
                            Order of ₹{finalTotal.toLocaleString('en-IN')} exceeds your available credit of ₹{availableCredit.toLocaleString('en-IN')}. Please settle past debt or pay via direct UPI QR.
                          </p>
                          <button
                            type="button"
                            onClick={() => setPaymentMode('UPI_QR')}
                            className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                          >
                            <QrCode className="w-3.5 h-3.5" /> Switch to Direct UPI QR
                          </button>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Option 2: Direct UPI QR */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMode === 'UPI_QR'
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_mode"
                      value="UPI_QR"
                      checked={paymentMode === 'UPI_QR'}
                      onChange={() => setPaymentMode('UPI_QR')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                        <QrCode className="w-3.5 h-3.5 text-blue-600" />
                        Instant UPI QR Code (0% Extra Fees)
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Scan dynamic QR via GPay / PhonePe / Paytm. Direct bank credit with UTR receipt.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: COD / Bank Transfer */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMode === 'COD_BANK'
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_mode"
                      value="COD_BANK"
                      checked={paymentMode === 'COD_BANK'}
                      onChange={() => setPaymentMode('COD_BANK')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        Cash on Delivery / NEFT Bank Transfer
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Pay cash to driver upon delivery or transfer directly via NEFT/RTGS.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Delivery Notes / Dispatch Instructions:
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g., Deliver before 4 PM, pack in heavy corrugated boxes..."
                  className="w-full text-xs p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Bill Breakdown */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>GST:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    + ₹{taxAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                {totalTierSavings > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Volume Slab Savings:</span>
                    <span>- ₹{totalTierSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Cart Bulk Discount (3%):</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-baseline font-bold text-slate-900 dark:text-white">
                  <span className="text-sm">Total Payable:</span>
                  <span className="text-lg text-blue-700 dark:text-blue-400">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Checkout Button */}
          {!placedOrderSuccess && cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                onClick={handleCheckout}
                disabled={isPlacing || isCreditExceeded}
                className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] ${
                  isCreditExceeded
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-400/30'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                {isPlacing
                  ? 'Processing Order...'
                  : isCreditExceeded
                  ? 'Credit Limit Exceeded (Choose UPI)'
                  : paymentMode === 'UPI_QR'
                  ? 'Proceed to Scan UPI QR'
                  : paymentMode === 'CREDIT_DEBT'
                  ? 'Place Order on Credit (Debt)'
                  : 'Confirm Wholesale Order'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic UPI Modal with Verification Data */}
      <UpiQrModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        amount={finalTotal}
        onPaymentComplete={handleUpiComplete}
        title="Complete Order Payment"
      />
    </>
  );
}
