'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Product, PricingTier } from '@/lib/types';
import { hsnRateHint } from '@/lib/gst';
import {
  Package,
  Plus,
  Search,
  Check,
  X,
  AlertCircle,
  Trash2,
  Edit2,
  Tag,
  CheckCircle2,
  Layers
} from 'lucide-react';

export default function DealerProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductStock, t } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for new product
  const [formData, setFormData] = useState({
    name: '',
    category: 'Staples & Flour',
    sku: '',
    hsnCode: '2106',
    gstRate: '5',
    wholesalePrice: '',
    mrp: '',
    moq: '5',
    packSize: 'Carton of 12 packs',
    stockQty: '100',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    tier2Qty: '',
    tier2Price: '',
    tier3Qty: '',
    tier3Price: ''
  });

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.wholesalePrice) return;

    const baseWholesale = parseFloat(formData.wholesalePrice);
    const moqVal = parseInt(formData.moq) || 1;
    const tiers: PricingTier[] = [
      { minQty: moqVal, pricePerUnit: baseWholesale, label: 'MOQ Standard' }
    ];

    if (formData.tier2Qty && formData.tier2Price) {
      tiers.push({
        minQty: parseInt(formData.tier2Qty),
        pricePerUnit: parseFloat(formData.tier2Price),
        label: 'Bulk Slab'
      });
    }

    if (formData.tier3Qty && formData.tier3Price) {
      tiers.push({
        minQty: parseInt(formData.tier3Qty),
        pricePerUnit: parseFloat(formData.tier3Price),
        label: 'Super Bulk Slab'
      });
    }

    addProduct({
      name: formData.name,
      category: formData.category,
      sku: formData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      hsnCode: formData.hsnCode.trim() || '2106',
      gstRate: [0, 5, 12, 18, 28].includes(Number(formData.gstRate)) ? Number(formData.gstRate) : 5,
      wholesalePrice: baseWholesale,
      mrp: parseFloat(formData.mrp) || baseWholesale * 1.25,
      moq: moqVal,
      packSize: formData.packSize,
      stockQty: parseInt(formData.stockQty) || 50,
      inStock: (parseInt(formData.stockQty) || 50) > 0,
      description: formData.description || 'Premium wholesale batch stock.',
      imageUrl: formData.imageUrl,
      tiers
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      category: 'Staples & Flour',
      sku: '',
      hsnCode: '2106',
      gstRate: '5',
      wholesalePrice: '',
      mrp: '',
      moq: '5',
      packSize: 'Carton of 12 packs',
      stockQty: '100',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      tier2Qty: '',
      tier2Price: '',
      tier3Qty: '',
      tier3Price: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('stockPricing')} Manager
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage product catalogs, wholesale unit rates, minimum order quantities (MOQ), and live inventory levels.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0">
            Total items: <b className="text-slate-900 dark:text-white">{filtered.length}</b>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? t('allCategories') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Pack Size & MOQ</th>
                <th className="p-3.5 text-right">Wholesale Rate</th>
                <th className="p-3.5 text-right">Retail MRP</th>
                <th className="p-3.5 text-center">In-Stock Status</th>
                <th className="p-3.5 text-center">Stock Count</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                  {/* Product Info */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white max-w-xs">{product.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {product.category}
                    </span>
                  </td>

                  {/* Pack & MOQ */}
                  <td className="p-3.5">
                    <div className="text-slate-800 dark:text-slate-200 font-medium">{product.packSize}</div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                      MOQ: {product.moq} units
                    </div>
                  </td>

                  {/* Wholesale Rate */}
                  <td className="p-3.5 text-right font-mono">
                    <div className="font-extrabold text-blue-700 dark:text-blue-400 text-sm">
                      ₹{product.wholesalePrice.toLocaleString('en-IN')}
                    </div>
                    {product.tiers && product.tiers.length > 1 && (
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                        {product.tiers.length} Slabs
                      </span>
                    )}
                  </td>

                  {/* MRP */}
                  <td className="p-3.5 text-right text-slate-400 dark:text-slate-500 line-through font-mono">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </td>

                  {/* In-Stock Switch */}
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => toggleProductStock(product.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        product.inStock && product.stockQty > 0
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {product.inStock && product.stockQty > 0 ? (
                        <>
                          <Check className="w-3 h-3" /> Available
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" /> Out of Stock
                        </>
                      )}
                    </button>
                  </td>

                  {/* Stock Quantity Quick Adjust */}
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <div className="inline-flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                      <button
                        onClick={() =>
                          updateProduct(product.id, {
                            stockQty: Math.max(0, product.stockQty - 10),
                            inStock: Math.max(0, product.stockQty - 10) > 0
                          })
                        }
                        className="px-2 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold"
                        title="-10"
                      >
                        -10
                      </button>
                      <input
                        type="number"
                        value={product.stockQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          updateProduct(product.id, {
                            stockQty: val,
                            inStock: val > 0
                          });
                        }}
                        className="w-14 text-center text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-0.5 outline-none font-mono"
                      />
                      <button
                        onClick={() =>
                          updateProduct(product.id, {
                            stockQty: product.stockQty + 10,
                            inStock: true
                          })
                        }
                        className="px-2 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold"
                        title="+10"
                      >
                        +10
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base">Add New Wholesale SKU</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Product Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parle-G Glucose Biscuits (800g Master Carton)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Category:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    SKU Code:
                  </label>
                  <input
                    type="text"
                    placeholder="BIS-PARL-800G"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full text-xs font-mono p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  HSN Code:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1905 (biscuits), 2106 (food prep)"
                  value={formData.hsnCode}
                  onChange={(e) => {
                    const hsnCode = e.target.value;
                    const hint = hsnRateHint(hsnCode);
                    setFormData({ ...formData, hsnCode, ...(hint !== undefined ? { gstRate: String(hint) } : {}) });
                  }}
                  maxLength={8}
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Used on invoices and e-way bills. Look up the correct code for this product on the GST portal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  GST Rate:
                </label>
                <select
                  value={formData.gstRate}
                  onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                >
                  <option value="0">0% (exempt)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Auto-suggested from the HSN code above — confirm it matches this exact product before saving.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Wholesale Price (₹):
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="1800"
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-blue-700 dark:text-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Retail MRP (₹):
                  </label>
                  <input
                    type="number"
                    placeholder="2400"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Pack / Unit Size:
                  </label>
                  <input
                    type="text"
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    MOQ:
                  </label>
                  <input
                    type="number"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-center text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Optional Volume Slabs */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Wholesale Volume Slabs (Optional)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Set discounted rates for larger quantities to incentivize bigger retail orders.
                </p>

                {/* Tier 2 */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Tier 2 Min Qty:
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={formData.tier2Qty}
                      onChange={(e) => setFormData({ ...formData, tier2Qty: e.target.value })}
                      className="w-full text-xs font-semibold p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Tier 2 Rate (₹/unit):
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1720"
                      value={formData.tier2Price}
                      onChange={(e) => setFormData({ ...formData, tier2Price: e.target.value })}
                      className="w-full text-xs font-bold p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-indigo-600 dark:text-indigo-400 font-mono"
                    />
                  </div>
                </div>

                {/* Tier 3 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Tier 3 Min Qty:
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 40"
                      value={formData.tier3Qty}
                      onChange={(e) => setFormData({ ...formData, tier3Qty: e.target.value })}
                      className="w-full text-xs font-semibold p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Tier 3 Rate (₹/unit):
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1650"
                      value={formData.tier3Price}
                      onChange={(e) => setFormData({ ...formData, tier3Price: e.target.value })}
                      className="w-full text-xs font-bold p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-indigo-600 dark:text-indigo-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Initial Stock Qty:
                  </label>
                  <input
                    type="number"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Image URL:
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Product Description:
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Master carton packaging with barcode..."
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors text-xs uppercase tracking-wider"
              >
                Add Product to Wholesale Catalog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
