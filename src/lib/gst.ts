import { round2 } from './validate';

// GSTIN first two digits -> state / UT name
const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
  '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur',
  '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal',
  '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra', '29': 'Karnataka',
  '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh'
};

export function dealerStateFromGstin(gstin?: string | null): string {
  const fromGstin = gstin ? GST_STATE_CODES[gstin.trim().slice(0, 2)] : undefined;
  return fromGstin || process.env.DEALER_STATE || 'Delhi';
}

export function isIntraState(dealerState: string, buyerState: string): boolean {
  const a = dealerState.trim().toLowerCase();
  const b = (buyerState || '').trim().toLowerCase();
  if (!a || !b) return false; // unknown buyer state -> treat as inter-state (IGST), never silently intra
  return a === b || a.includes(b) || b.includes(a);
}

export const DEFAULT_GST_RATE = 5; // fallback % if a product has no rate set
export const BULK_DISCOUNT_THRESHOLD = 50000;
export const BULK_DISCOUNT_RATE = 0.03;

// Common HSN-chapter prefixes -> typical GST slab, shown as a hint in the product form.
// This is NOT authoritative - always confirm the exact rate on the GST portal for the product.
export const HSN_RATE_HINTS: { prefix: string; rate: number; label: string }[] = [
  { prefix: '10', rate: 0, label: 'Cereals (unbranded)' },
  { prefix: '1101', rate: 5, label: 'Wheat/meslin flour' },
  { prefix: '1905', rate: 18, label: 'Biscuits, pastry, bread (varies by type)' },
  { prefix: '1704', rate: 18, label: 'Sugar confectionery' },
  { prefix: '1806', rate: 18, label: 'Chocolate' },
  { prefix: '0902', rate: 5, label: 'Tea' },
  { prefix: '0901', rate: 5, label: 'Coffee' },
  { prefix: '1512', rate: 5, label: 'Edible oils' },
  { prefix: '2106', rate: 18, label: 'Food preparations n.e.s.' },
  { prefix: '3401', rate: 18, label: 'Soap' },
  { prefix: '3305', rate: 18, label: 'Shampoo / hair prep' },
  { prefix: '3306', rate: 18, label: 'Oral hygiene (toothpaste etc.)' },
  { prefix: '9619', rate: 18, label: 'Sanitary/hygiene products' }
];

export function hsnRateHint(hsnCode?: string | null): number | undefined {
  if (!hsnCode) return undefined;
  const code = hsnCode.trim();
  const match = HSN_RATE_HINTS.filter((h) => code.startsWith(h.prefix)).sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return match?.rate;
}

export interface GstLine {
  /** Line amount BEFORE the order-level bulk discount, i.e. unitPrice * quantity. */
  subtotal: number;
  /** This product's own GST %, e.g. 5, 12, 18, 28. */
  gstRate: number;
}

/**
 * Per-line GST: the order-level bulk discount is spread proportionally across lines
 * (so a ₹60k order gets one consistent discount %), then each line is taxed at ITS OWN
 * product's GST rate rather than one flat rate for the whole order.
 * Shared by the server (source of truth) and the client (preview only).
 */
export function computeOrderTotals(lines: GstLine[], intra: boolean) {
  const subtotal = round2(lines.reduce((s, l) => s + l.subtotal, 0));
  const discountAmount = subtotal > BULK_DISCOUNT_THRESHOLD ? round2(subtotal * BULK_DISCOUNT_RATE) : 0;
  const discountFactor = subtotal > 0 && discountAmount > 0 ? (subtotal - discountAmount) / subtotal : 1;

  let taxable = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  for (const line of lines) {
    const lineTaxable = round2(line.subtotal * discountFactor);
    taxable += lineTaxable;
    const rate = Number.isFinite(line.gstRate) ? line.gstRate / 100 : DEFAULT_GST_RATE / 100;
    const lineTax = round2(lineTaxable * rate);
    if (intra) {
      cgstAmount += round2(lineTax / 2);
      sgstAmount += round2(lineTax / 2);
    } else {
      igstAmount += lineTax;
    }
  }

  taxable = round2(taxable);
  cgstAmount = round2(cgstAmount);
  sgstAmount = round2(sgstAmount);
  igstAmount = round2(igstAmount);
  const taxAmount = round2(cgstAmount + sgstAmount + igstAmount);
  const totalAmount = round2(taxable + taxAmount);

  return { subtotal, discountAmount, taxable, cgstAmount, sgstAmount, igstAmount, taxAmount, totalAmount };
}

/** Simple preview when only a total (no per-line rates) is available, e.g. a quick cart summary. */
export function computeTotals(subtotal: number, intra: boolean, gstRate = DEFAULT_GST_RATE) {
  return computeOrderTotals([{ subtotal, gstRate }], intra);
}
