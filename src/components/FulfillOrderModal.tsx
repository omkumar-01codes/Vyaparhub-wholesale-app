'use client';

import React, { useState } from 'react';
import { Order, OrderItem } from '@/lib/types';
import { useApp } from '@/lib/store';
import { generateDeliveryChallanPdf } from '@/lib/pdf-generator';
import { X, Truck, CheckCircle2, AlertTriangle, FileText, Download } from 'lucide-react';

interface FulfillOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function FulfillOrderModal({ isOpen, onClose, order }: FulfillOrderModalProps) {
  const { fulfillOrderPartially, dealerProfile, customers } = useApp();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Initialize quantities when modal opens with order
  React.useEffect(() => {
    if (order) {
      const initial: Record<string, number> = {};
      order.items.forEach((item) => {
        initial[item.productId] = item.dispatchedQuantity !== undefined ? item.dispatchedQuantity : item.quantity;
      });
      setQuantities(initial);
      setDispatchNotes('');
      setSuccessOrder(null);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleQtyChange = (productId: string, val: number, maxQty: number) => {
    const clamped = Math.min(maxQty, Math.max(0, isNaN(val) ? 0 : val));
    setQuantities((prev) => ({ ...prev, [productId]: clamped }));
  };

  const hasBackorders = order.items.some((item) => {
    const dispatched = quantities[item.productId] ?? item.quantity;
    return dispatched < item.quantity;
  });

  const totalOrdered = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalDispatched = order.items.reduce(
    (sum, item) => sum + (quantities[item.productId] ?? item.quantity),
    0
  );
  const totalBackordered = totalOrdered - totalDispatched;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fulfillOrderPartially(order.id, quantities, dispatchNotes);
    const updatedOrder: Order = {
      ...order,
      orderStatus: hasBackorders ? 'PARTIALLY_DISPATCHED' : 'DISPATCHED',
      items: order.items.map((i) => ({
        ...i,
        dispatchedQuantity: quantities[i.productId] ?? i.quantity,
        backorderedQuantity: i.quantity - (quantities[i.productId] ?? i.quantity)
      }))
    };
    setSuccessOrder(updatedOrder);
  };

  const cust = customers.find((c) => c.id === order.customerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Truck className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Warehouse Dispatch & Fulfillment</h3>
              <p className="text-xs text-blue-200">Order #{order.orderNumber} • {order.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {successOrder ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold">Fulfillment Recorded Successfully!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Status updated to{' '}
              <b className="text-blue-600 dark:text-blue-400">{successOrder.orderStatus}</b>. (
              {totalDispatched} units dispatched, {totalBackordered} backordered).
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={() => generateDeliveryChallanPdf(successOrder, dealerProfile, cust)}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Delivery Challan (PDF)</span>
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Total Ordered: <b>{totalOrdered} Units</b></span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                Dispatching: {totalDispatched} Units
              </span>
              {hasBackorders && (
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  Backordered: {totalBackordered} Units
                </span>
              )}
            </div>

            {/* Items Table */}
            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {order.items.map((item) => {
                const currentDisp = quantities[item.productId] ?? item.quantity;
                const backordered = item.quantity - currentDisp;

                return (
                  <div
                    key={item.productId}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 dark:text-white">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.sku} • {item.packSize}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Ordered: <b>{item.quantity}</b> units
                      </div>
                    </div>

                    {/* Dispatch quantity input */}
                    <div className="text-right">
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                        Dispatch Now:
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={currentDisp}
                        onChange={(e) =>
                          handleQtyChange(item.productId, parseInt(e.target.value), item.quantity)
                        }
                        className="w-16 text-center text-xs font-bold py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      {backordered > 0 && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                          {backordered} Backordered
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasBackorders && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <b>Partial Fulfillment:</b> Order will be marked <b>PARTIALLY DISPATCHED</b>. You can print a Delivery Challan for today&apos;s cargo, and fulfill the remaining units later.
                </div>
              </div>
            )}

            {/* Dispatch Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Logistics / Transporter Notes (Optional):
              </label>
              <input
                type="text"
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                placeholder="e.g. Loaded on Truck #MH-04-AB-1234, Driver Rajesh (98201...)"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Confirm Dispatch & Update Queue</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
