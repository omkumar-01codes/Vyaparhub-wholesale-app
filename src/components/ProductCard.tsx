'use client';

import React, { useState } from 'react';
import { Product, calculateItemPrice } from '@/lib/types';
import { useApp } from '@/lib/store';
import { ShoppingCart, Check, AlertCircle, Package, Plus, Minus, Sparkles, TrendingUp, Layers } from 'lucide-react';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, openCart, t } = useApp();
  const [quantity, setQuantity] = useState(product.moq || 1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [quickAdded, setQuickAdded] = useState(false);

  // Dynamic Tier Calculation
  const {
    unitPrice,
    activeTier,
    nextTier,
    unitsNeededForNextTier,
    savingsVsBase
  } = calculateItemPrice(product, quantity);

  const discountPercent = Math.round(
    ((product.mrp - unitPrice) / product.mrp) * 100
  );

  const retailerMargin = product.mrp - unitPrice;

  const handleAdd = () => {
    if (!product.inStock || product.stockQty <= 0) return;
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock || product.stockQty <= 0) return;
    addToCart(product, product.moq || 1);
    setQuickAdded(true);
    setTimeout(() => setQuickAdded(false), 1000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Product Image Header with Badges */}
      <div className="relative h-52 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {discountPercent > 0 && (
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-md">
              {discountPercent}% Wholesale Margin
            </span>
          )}
          <span className="bg-slate-950/80 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md">
            {product.category}
          </span>
        </div>

        {/* In-Stock or Low Stock status badge */}
        <div className="absolute top-3 right-3">
          {product.inStock && product.stockQty > 0 ? (
            <span className={`inline-flex items-center gap-1.5 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-md ${
              product.stockQty < 150 ? 'bg-amber-600/90' : 'bg-emerald-600/90'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {product.stockQty < 150 ? `Low Stock (${product.stockQty})` : `In Stock (${product.stockQty})`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
              <AlertCircle className="w-3 h-3" />
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Add (+) Button Over Image */}
        {product.inStock && product.stockQty > 0 && (
          <button
            onClick={handleQuickAdd}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl transition-all active:scale-90 ${
              quickAdded
                ? 'bg-emerald-600 shadow-emerald-500/50 scale-110'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-indigo-500/40 hover:scale-105'
            }`}
            title="Quick Add MOQ to Cart"
          >
            {quickAdded ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
          </button>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* SKU Code */}
          <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1 font-medium">
            <Package className="w-3 h-3 text-indigo-500" />
            SKU: {product.sku}
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {product.name}
          </h3>

          {/* Packaging & MOQ Tag */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              📦 {product.packSize}
            </span>
            <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-extrabold bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
              MOQ: {product.moq} units
            </span>
          </div>

          {/* Price Comparison Block */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Wholesale Rate</span>
                {savingsVsBase > 0 && (
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
                    -₹{savingsVsBase}/u Slab
                  </span>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                ₹{unitPrice.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-400 font-sans ml-1">/ unit</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Retail MRP</span>
              <div className="text-sm font-semibold text-slate-400 line-through font-mono">
                ₹{product.mrp.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                Profit: +₹{retailerMargin}/unit
              </div>
            </div>
          </div>

          {/* Interactive Tiered Pricing Slabs */}
          {product.tiers && product.tiers.length > 1 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-indigo-500" />
                  Wholesale Volume Slabs
                </span>
                {activeTier && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold capitalize">
                    {activeTier.label || `${activeTier.minQty}+ units`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {product.tiers.map((tier, idx) => {
                  const isSelected = activeTier?.minQty === tier.minQty;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuantity(tier.minQty)}
                      className={`p-1.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 dark:border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {tier.minQty}+ units
                      </div>
                      <div className="text-xs font-black font-mono text-indigo-700 dark:text-indigo-300">
                        ₹{tier.pricePerUnit}
                      </div>
                    </button>
                  );
                })}
              </div>

              {nextTier && unitsNeededForNextTier > 0 && (
                <div className="text-[10px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-1.5 px-2 font-medium flex items-center justify-between">
                  <span>Add <b>{unitsNeededForNextTier} more</b> for slab:</span>
                  <b className="font-mono text-amber-900 dark:text-amber-100">₹{nextTier.pricePerUnit}/u</b>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quantity Controls & Add to Cart Action */}
        <div className="pt-2 space-y-2.5">
          {product.inStock && product.stockQty > 0 ? (
            <div className="flex items-center gap-2">
              {/* Stepper */}
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/80 shadow-xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(product.moq || 1, q - 1))}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
                  title="Decrease Quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-black text-slate-900 dark:text-white font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQty, q + 1))}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
                  title="Increase Quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAdd}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-500/25'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-white animate-bounce" />
                    <span>Added to Order!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-white" />
                    <span>Add to Order</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed border border-slate-200 dark:border-slate-700"
            >
              Currently Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
