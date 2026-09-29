import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, DealerProfile, Customer } from './types';

export function generateInvoicePdf(
  order: Order,
  dealer: DealerProfile,
  customer?: Customer
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(30, 58, 138); // Deep Royal Blue
  doc.rect(0, 0, 210, 32, 'F');

  // Dealer Name & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(dealer.businessName, 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(dealer.tagline, 14, 20);
  doc.text(`GSTIN: ${dealer.gstin} | Ph: ${dealer.phone}`, 14, 26);

  // Invoice Title on Right
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 196, 15, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${order.orderNumber}`, 196, 21, { align: 'right' });
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 196, 26, { align: 'right' });

  // Bill To (Customer) vs Ship From (Dealer)
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO (RETAILER):', 14, 42);

  doc.setFontSize(10);
  doc.text(order.businessName || order.customerName, 14, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Contact Person: ${order.customerName}`, 14, 53);
  doc.text(`Phone: ${order.customerPhone}`, 14, 58);
  doc.text(`Address: ${order.city}, ${order.state}`, 14, 63);
  if (customer?.gstNumber) {
    doc.text(`GSTIN: ${customer.gstNumber}`, 14, 68);
  }

  // Payment Status Box on Right
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(115, 38, 81, 34, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('PAYMENT & BILL DETAILS', 119, 44);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const paymentModeLabel =
    order.paymentMode === 'CREDIT_DEBT'
      ? 'On Credit (Debt / Udhaar)'
      : order.paymentMode === 'UPI_QR'
      ? 'Instant UPI QR'
      : 'Cash / Bank Transfer';

  doc.text(`Payment Mode: ${paymentModeLabel}`, 119, 50);
  doc.text(`Payment Status: ${order.paymentStatus === 'VERIFICATION_PENDING' ? 'VERIFICATION PENDING' : order.paymentStatus}`, 119, 56);
  if (order.upiReference) {
    doc.text(`Ref / UTR: ${order.upiReference}`, 119, 62);
  }
  doc.text(`Fulfillment: ${order.orderStatus}`, 119, order.upiReference ? 68 : 62);

  // Table Items
  const tableData = order.items.map((item, index) => [
    index + 1,
    item.productName,
    item.sku,
    item.packSize,
    item.quantity,
    item.dispatchedQuantity !== undefined ? `${item.dispatchedQuantity} / ${item.quantity}` : `${item.quantity}`,
    `₹${item.wholesalePrice.toLocaleString('en-IN')}`,
    `₹${item.totalPrice.toLocaleString('en-IN')}`
  ]);

  autoTable(doc, {
    startY: 76,
    head: [['#', 'Item Description', 'SKU', 'Packing Unit', 'Order Qty', 'Dispatched', 'Rate (₹)', 'Amount (₹)']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 25 },
      3: { cellWidth: 26 },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' }
    }
  });

  // Financial Breakdown calculations
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const rightX = 130;
  const valX = 196;

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', rightX, finalY);
  doc.text(`₹${order.subtotal.toLocaleString('en-IN')}`, valX, finalY, { align: 'right' });

  doc.text('GST:', rightX, finalY + 6);
  doc.text(`+ ₹${order.taxAmount.toLocaleString('en-IN')}`, valX, finalY + 6, { align: 'right' });

  if (order.discountAmount > 0) {
    doc.text('Bulk Discount:', rightX, finalY + 12);
    doc.setTextColor(22, 163, 74);
    doc.text(`- ₹${order.discountAmount.toLocaleString('en-IN')}`, valX, finalY + 12, { align: 'right' });
    doc.setTextColor(71, 85, 105);
  }

  // Grand Total Line
  doc.setDrawColor(203, 213, 225);
  doc.line(rightX, finalY + 16, 196, finalY + 16);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('GRAND TOTAL:', rightX, finalY + 23);
  doc.text(`₹${order.totalAmount.toLocaleString('en-IN')}`, valX, finalY + 23, { align: 'right' });

  // Signature Block at Bottom
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your valued wholesale business!', 14, 275);

  doc.text(`For ${dealer.businessName}`, 196, 265, { align: 'right' });
  doc.line(140, 274, 196, 274);
  doc.text('Authorized Signatory', 196, 278, { align: 'right' });

  // Save the PDF
  doc.save(`Invoice-${order.orderNumber}.pdf`);
}

// Problem 4: Delivery Challan & Dispatch Slip for Partial / Full Fulfillment
export function generateDeliveryChallanPdf(
  order: Order,
  dealer: DealerProfile,
  customer?: Customer
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner in Emerald / Teal for Delivery Challan
  doc.setFillColor(6, 78, 59); // Deep Emerald
  doc.rect(0, 0, 210, 32, 'F');

  // Dealer Name & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text(dealer.businessName, 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('WAREHOUSE DISPATCH & LOGISTICS SLIP', 14, 20);
  doc.text(`GSTIN: ${dealer.gstin} | Dispatch Desk: ${dealer.phone}`, 14, 26);

  // Challan Title on Right
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DELIVERY CHALLAN', 196, 15, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Challan #: ${order.deliveryChallanNumber || 'DC-' + order.orderNumber.replace('ORD-', '')}`, 196, 21, { align: 'right' });
  doc.text(`Order Ref: ${order.orderNumber}`, 196, 26, { align: 'right' });

  // Consignee / Retailer Details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIGNEE (DELIVER TO):', 14, 42);

  doc.setFontSize(10);
  doc.text(order.businessName || order.customerName, 14, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Contact: ${order.customerName} (${order.customerPhone})`, 14, 53);
  doc.text(`Destination: ${order.city}, ${order.state}`, 14, 58);
  if (order.notes) {
    doc.text(`Instructions: ${order.notes}`, 14, 63);
  }

  // Dispatch Status Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(120, 38, 76, 28, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text('LOGISTICS DISPATCH INFO', 124, 44);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Dispatch Date: ${new Date().toLocaleDateString('en-IN')}`, 124, 50);
  doc.text(`Fulfillment Status: ${order.orderStatus}`, 124, 56);
  doc.text(`Payment: ${order.paymentMode}`, 124, 62);

  // Table Items: Ordered vs Dispatched vs Backordered
  const tableData = order.items.map((item, index) => {
    const disp = item.dispatchedQuantity !== undefined ? item.dispatchedQuantity : item.quantity;
    const back = item.backorderedQuantity !== undefined ? item.backorderedQuantity : 0;
    const status = back > 0 ? 'PARTIAL' : 'FULFILLED';
    return [
      index + 1,
      item.productName,
      item.sku,
      item.packSize,
      item.quantity,
      disp,
      back,
      status
    ];
  });

  autoTable(doc, {
    startY: 72,
    head: [['#', 'Item Description', 'SKU', 'Pack Unit', 'Ordered', 'Dispatched', 'Backordered', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 25 },
      3: { cellWidth: 26 },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' },
      7: { cellWidth: 22, halign: 'center' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;

  // Dispatch Note
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Note: Dispatched units have been checked and verified by warehouse logistics.', 14, finalY);
  doc.text('Backordered items will be dispatched automatically upon restock without duplicate delivery charges.', 14, finalY + 5);

  // Dual Signatures: Driver & Receiver
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 260, 80, 260);
  doc.text('Driver / Carrier Signature', 14, 265);

  doc.line(130, 260, 196, 260);
  doc.text('Retailer Receiver Seal & Signature', 130, 265);

  // Save PDF
  doc.save(`DeliveryChallan-${order.orderNumber}.pdf`);
}
