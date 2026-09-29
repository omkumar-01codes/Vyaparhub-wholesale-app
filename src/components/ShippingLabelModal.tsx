'use client';

import React from 'react';
import { Order, DealerProfile, Customer } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, PackageCheck, Truck, MapPin, Phone, Building2 } from 'lucide-react';

interface ShippingLabelModalProps {
  order: Order;
  dealer: DealerProfile;
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShippingLabelModal({
  order,
  dealer,
  customer,
  isOpen,
  onClose
}: ShippingLabelModalProps) {
  if (!isOpen || !order) return null;

  const totalCartons = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // QR Payload for logistics dispatch tracking
  const qrPayload = JSON.stringify({
    orderNumber: order.orderNumber,
    orderId: order.id,
    consignee: order.businessName || order.customerName,
    phone: order.customerPhone,
    destination: `${order.city}, ${order.state}`,
    cartons: totalCartons,
    date: order.createdAt
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                B2B Shipping Label & Carton Slip
              </h3>
              <p className="text-xs text-slate-500">Order #{order.orderNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Label Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-white text-slate-900 print:p-0 print:m-0">
          <div className="border-2 border-dashed border-slate-400 p-5 rounded-2xl print:border-solid print:border-black print:rounded-none">
            {/* Top Bar: Master Wholesaler & Dispatch Info */}
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  SHIP FROM (CONSIGNOR):
                </span>
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  {dealer.businessName}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">{dealer.address}</p>
                <p className="text-[11px] font-mono text-slate-700 mt-0.5">
                  GSTIN: <b>{dealer.gstin}</b> | Ph: {dealer.phone}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-mono font-bold">
                  B2B FREIGHT
                </span>
                <p className="text-xs font-mono font-bold mt-1 text-slate-800">
                  {order.deliveryChallanNumber || 'PRE-DISPATCH'}
                </p>
              </div>
            </div>

            {/* Middle Section: Consignee & QR Code */}
            <div className="grid grid-cols-3 gap-4 py-4 border-b-2 border-slate-900">
              <div className="col-span-2 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  DELIVER TO (CONSIGNEE):
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase">
                  {order.businessName || order.customerName}
                </h3>
                <p className="text-xs font-semibold text-slate-800">
                  Attn: {order.customerName}
                </p>
                <p className="text-xs text-slate-700 leading-snug">
                  {customer?.address || `${order.city}, ${order.state}`}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-800 pt-1">
                  <span>📞 {order.customerPhone}</span>
                  {customer?.gstNumber && <span>GST: <b>{customer.gstNumber}</b></span>}
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 print:border-black text-center">
                <QRCodeSVG value={qrPayload} size={84} level="M" />
                <span className="text-[9px] font-mono font-bold mt-1 text-slate-600">
                  SCAN FOR DETAILS
                </span>
              </div>
            </div>

            {/* Shipment Breakdown */}
            <div className="py-3 border-b-2 border-slate-900 grid grid-cols-3 text-center text-xs">
              <div className="border-r border-slate-300">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">TOTAL CARTONS</span>
                <span className="text-lg font-extrabold text-slate-900">{totalCartons} Cartons</span>
              </div>
              <div className="border-r border-slate-300">
                <span className="text-[10px] uppercase text-slate-500 font-bold block">ORDER DATE</span>
                <span className="text-xs font-bold text-slate-800">
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold block">PAYMENT MODE</span>
                <span className="text-xs font-bold text-slate-800 uppercase">
                  {order.paymentMode.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Itemized Manifest Table */}
            <div className="pt-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                CARTON MANIFEST & VERIFICATION
              </span>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-1 px-2">SKU</th>
                    <th className="py-1 px-2">Product Description</th>
                    <th className="py-1 px-2 text-center">Pack Unit</th>
                    <th className="py-1 px-2 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {order.items.map((item) => (
                    <tr key={item.productId}>
                      <td className="py-1 px-2 font-mono text-[11px] font-bold text-slate-700">{item.sku}</td>
                      <td className="py-1 px-2 font-medium">{item.productName}</td>
                      <td className="py-1 px-2 text-center text-[11px] text-slate-600">{item.packSize}</td>
                      <td className="py-1 px-2 text-right font-bold">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Footer */}
            <div className="mt-4 pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
              <span>Generated via VyaparHub B2B Platform</span>
              <span>Handle with care • Goods in Transit</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Print Button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Shipping Label</span>
          </button>
        </div>
      </div>
    </div>
  );
}
