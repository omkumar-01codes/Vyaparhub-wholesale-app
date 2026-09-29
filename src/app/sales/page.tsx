'use client';

import { computeOrderTotals } from '@/lib/gst';
import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Customer, Product, PaymentMode, SettlementMode, calculateItemPrice } from '@/lib/types';
import {
  Bike,
  Store,
  Search,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  IndianRupee,
  Receipt,
  UserCheck,
  TrendingUp,
  Percent,
  Plus,
  Minus,
  Sparkles,
  Phone,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function SalesmanPortalPage() {
  const {
    customers,
    products,
    placeOrder,
    recordPayment,
    dealerProfile,
    t
  } = useApp();

  // Selected Retailer on Beat
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [salesmanName, setSalesmanName] = useState<string>('Ramesh Kumar');

  // Search & Filtering for Products
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Local Salesman Order Pad (Cart for the active visit)
  const [orderPad, setOrderPad] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CREDIT_DEBT');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  // On-the-spot Payment Collection Drawer/State
  const [isCollectingPayment, setIsCollectingPayment] = useState<boolean>(false);
  const [collectionAmount, setCollectionAmount] = useState<string>('');
  const [collectionMode, setCollectionMode] = useState<SettlementMode>('CASH');
  const [collectionNotes, setCollectionNotes] = useState<string>('');
  const [collectionSuccess, setCollectionSuccess] = useState<string | null>(null);

  // Daily Summary Counters
  const [dailyStats, setDailyStats] = useState<{
    ordersCount: number;
    bookingValue: number;
    cashCollected: number;
  }>({
    ordersCount: 3,
    bookingValue: 92400,
    cashCollected: 15000
  });

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const availableCredit = activeCustomer
    ? Math.max(0, activeCustomer.creditLimit - activeCustomer.outstandingDebt)
    : 0;

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Order Pad Management
  const getItemQuantity = (productId: string) => {
    return orderPad.find((item) => item.product.id === productId)?.quantity || 0;
  };

  const updateQuantity = (product: Product, quantity: number) => {
    if (quantity <= 0) {
      setOrderPad((prev) => prev.filter((item) => item.product.id !== product.id));
    } else {
      setOrderPad((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id ? { ...item, quantity } : item
          );
        }
        return [...prev, { product, quantity }];
      });
    }
    setOrderSuccessMessage(null);
  };

  // Order Calculations
  const padSubtotal = orderPad.reduce((sum, item) => {
    const { unitPrice } = calculateItemPrice(item.product, item.quantity);
    return sum + unitPrice * item.quantity;
  }, 0);

  // Preview only - identical rules to the server (discount spread proportionally, then each
  // line taxed at its own product's GST rate). The server's figures are what actually get charged.
  const padPreview = computeOrderTotals(
    orderPad.map((item) => ({
      subtotal: calculateItemPrice(item.product, item.quantity).unitPrice * item.quantity,
      gstRate: item.product.gstRate
    })),
    true
  );
  const padTax = padPreview.taxAmount;
  const padDiscount = padPreview.discountAmount;
  const padTotal = padPreview.totalAmount;

  const isCreditExceeded =
    paymentMode === 'CREDIT_DEBT' && padTotal > availableCredit;

  // Handle Order Booking
  const handleBookOrder = async () => {
    if (orderPad.length === 0 || !activeCustomer) return;
    if (isCreditExceeded) {
      alert(
        `Order exceeds available credit limit of ₹${availableCredit.toLocaleString('en-IN')}. Please collect cash or reduce order volume.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const placed = await placeOrder({
        paymentMode,
        notes: `Field Booking by ${salesmanName}. ${orderNotes}`.trim(),
        bookedBy: `${salesmanName} (Sales Rep)`,
        targetCustomer: activeCustomer
      });

      setDailyStats((prev) => ({
        ordersCount: prev.ordersCount + 1,
        bookingValue: prev.bookingValue + placed.totalAmount,
        cashCollected: prev.cashCollected
      }));

      setOrderSuccessMessage(
        `Order #${placed.orderNumber} successfully booked for ${activeCustomer.businessName} (₹${placed.totalAmount.toLocaleString('en-IN')})!`
      );
      setOrderPad([]);
      setOrderNotes('');
    } catch (err: any) {
      alert(`Failed to book order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle On-the-spot Payment Collection
  const handleCollectPayment = () => {
    const amt = Number(collectionAmount);
    if (!amt || amt <= 0 || !activeCustomer) return;

    recordPayment({
      customerId: activeCustomer.id,
      amount: amt,
      paymentMode: collectionMode,
      notes: `Collected in person by ${salesmanName}. ${collectionNotes}`.trim()
    });

    setDailyStats((prev) => ({
      ...prev,
      cashCollected: prev.cashCollected + amt
    }));

    setCollectionSuccess(
      `₹${amt.toLocaleString('en-IN')} collected and logged to Khata ledger for ${activeCustomer.businessName}!`
    );
    setCollectionAmount('');
    setCollectionNotes('');
    setIsCollectingPayment(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Sales Rep Identity & Beat Selector */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Bike className="w-5 h-5 text-amber-300" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-blue-200">
              Field Agent Beat Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1">
            Storefront Order Booking Pad
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Book rapid wholesale orders on-the-spot during Kirana store visits, pitch margin savings, and collect payments.
          </p>
        </div>

        {/* Daily Stats KPI Cards */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
          <div className="text-center px-3 border-r border-white/20">
            <span className="text-[10px] uppercase font-bold text-blue-200 block">Orders Booked</span>
            <span className="text-base font-extrabold">{dailyStats.ordersCount}</span>
          </div>
          <div className="text-center px-3 border-r border-white/20">
            <span className="text-[10px] uppercase font-bold text-blue-200 block">Today's Volume</span>
            <span className="text-base font-extrabold">₹{dailyStats.bookingValue.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-center px-3">
            <span className="text-[10px] uppercase font-bold text-amber-300 block">Cash Collected</span>
            <span className="text-base font-extrabold text-amber-300">₹{dailyStats.cashCollected.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Catalog / Right Customer & Order Pad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Product Catalog & Quick Carton Selectors */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Category Filter Pills */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search FMCG catalog by name, brand, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Products' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((prod) => {
              const currentQty = getItemQuantity(prod.id);
              const { unitPrice, activeTier, nextTier, unitsNeededForNextTier } =
                calculateItemPrice(prod, currentQty || prod.moq);
              const retailerProfitPerUnit = prod.mrp - unitPrice;

              return (
                <div
                  key={prod.id}
                  className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                    currentQty > 0
                      ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-sm ring-1 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 block">
                          {prod.sku}
                        </span>
                        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug mt-0.5">
                          {prod.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {prod.packSize}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        +₹{retailerProfitPerUnit}/u Margin
                      </span>
                    </div>

                    {/* Pricing Badges */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                        ₹{unitPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        MRP ₹{prod.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                        MOQ: {prod.moq}
                      </span>
                    </div>

                    {/* Volume Slabs Shortcut Buttons */}
                    {prod.tiers && prod.tiers.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2.5">
                        {prod.tiers.map((tier) => (
                          <button
                            key={tier.minQty}
                            type="button"
                            onClick={() => updateQuantity(prod, tier.minQty)}
                            className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold text-center border transition-all ${
                              currentQty >= tier.minQty
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                            }`}
                          >
                            <div>{tier.minQty}+ pcs</div>
                            <div className="text-[9px] opacity-80">₹{tier.pricePerUnit}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stepper / Add to Pad */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      In Stock: <b>{prod.stockQty}</b>
                    </span>

                    {currentQty === 0 ? (
                      <button
                        onClick={() => updateQuantity(prod, prod.moq)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                      >
                        + Add Carton ({prod.moq})
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(prod, currentQty - 1)}
                          className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-white flex items-center justify-center font-bold text-xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white w-6 text-center font-mono">
                          {currentQty}
                        </span>
                        <button
                          onClick={() => updateQuantity(prod, currentQty + 1)}
                          className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Active Retailer Card & Order Pad Checkout */}
        <div className="space-y-4">
          {/* Active Retailer Profile on Beat */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
                  Store on Beat
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                Active Visit
              </span>
            </div>

            {/* Retailer Select Dropdown */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 mb-1 block">Select Kirana Store:</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Store Credit & Outstanding Details */}
            {activeCustomer && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Owner Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activeCustomer.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{activeCustomer.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Outstanding Debt:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                    ₹{activeCustomer.outstandingDebt.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Available Credit:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{availableCredit.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Instant On-the-spot Payment Collection Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCollectingPayment(!isCollectingPayment)}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-amber-400 bg-amber-50/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-all"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Collect Payment on Spot</span>
                  </button>
                </div>

                {/* Inline Payment Collection Drawer */}
                {isCollectingPayment && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Log Cash / Cheque</span>
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      value={collectionAmount}
                      onChange={(e) => setCollectionAmount(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={collectionMode}
                        onChange={(e) => setCollectionMode(e.target.value as SettlementMode)}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      >
                        <option value="CASH">CASH</option>
                        <option value="UPI">UPI</option>
                        <option value="CHEQUE">CHEQUE</option>
                      </select>
                      <button
                        onClick={handleCollectPayment}
                        className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                      >
                        Confirm Receipt
                      </button>
                    </div>
                  </div>
                )}

                {collectionSuccess && (
                  <p className="text-[11px] text-emerald-600 font-semibold">{collectionSuccess}</p>
                )}
              </div>
            )}
          </div>

          {/* Current Order Pad (Cart) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Kirana Order Pad
                </h3>
              </div>
              <span className="text-xs font-bold text-blue-600">
                {orderPad.reduce((s, i) => s + i.quantity, 0)} Cartons
              </span>
            </div>

            {/* Success Message Banner */}
            {orderSuccessMessage && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{orderSuccessMessage}</span>
              </div>
            )}

            {orderPad.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tap items on the left to add cartons to this retailer's order.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto pr-1">
                  {orderPad.map((item) => {
                    const { unitPrice } = calculateItemPrice(item.product, item.quantity);
                    const lineTotal = unitPrice * item.quantity;

                    return (
                      <div key={item.product.id} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex-1 pr-2">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {item.product.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.quantity} × ₹{unitPrice}
                          </div>
                        </div>
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Summary */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>₹{padSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST:</span>
                    <span>+₹{padTax.toLocaleString('en-IN')}</span>
                  </div>
                  {padDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Volume Bulk Discount:</span>
                      <span>-₹{padDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>Grand Total:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono">
                      ₹{padTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Payment Mode Selector */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-500 mb-1 block">Billing Terms:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('CREDIT_DEBT')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                        paymentMode === 'CREDIT_DEBT'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Credit (Khata)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('COD_BANK')}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                        paymentMode === 'COD_BANK'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Cash on Delivery
                    </button>
                  </div>
                </div>

                {/* Credit Limit Exceeded Warning */}
                {isCreditExceeded && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Credit Limit Exceeded</span>
                    </div>
                    <p className="text-[11px]">
                      Required: ₹{padTotal.toLocaleString('en-IN')} | Available: ₹{availableCredit.toLocaleString('en-IN')}. Collect cash or switch to Cash on Delivery.
                    </p>
                  </div>
                )}

                {/* Notes Input */}
                <input
                  type="text"
                  placeholder="Order instructions / packing notes (optional)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />

                {/* Book Order Button */}
                <button
                  type="button"
                  onClick={handleBookOrder}
                  disabled={isSubmitting || isCreditExceeded}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{isSubmitting ? 'Booking Order...' : `Confirm & Book Order (₹${padTotal.toLocaleString('en-IN')})`}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
