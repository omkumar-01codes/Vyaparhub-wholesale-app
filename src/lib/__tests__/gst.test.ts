import { describe, it, expect } from 'vitest';
import { computeOrderTotals, computeTotals, isIntraState, dealerStateFromGstin, hsnRateHint } from '../gst';

describe('computeOrderTotals', () => {
  it('applies no bulk discount under the threshold', () => {
    const r = computeOrderTotals([{ subtotal: 10000, gstRate: 5 }], true);
    expect(r.discountAmount).toBe(0);
    expect(r.cgstAmount).toBe(250);
    expect(r.sgstAmount).toBe(250);
    expect(r.igstAmount).toBe(0);
    expect(r.taxAmount).toBe(500);
    expect(r.totalAmount).toBe(10500);
  });

  it('applies the 3% bulk discount over ₹50,000 before tax', () => {
    const r = computeOrderTotals([{ subtotal: 60000, gstRate: 5 }], true);
    expect(r.discountAmount).toBe(1800);
    expect(r.taxable).toBe(58200);
    expect(r.taxAmount).toBe(2910);
    expect(r.totalAmount).toBe(61110);
  });

  it('taxes each line at its own GST rate, discount spread proportionally', () => {
    const r = computeOrderTotals(
      [
        { subtotal: 40000, gstRate: 5 },
        { subtotal: 20000, gstRate: 18 }
      ],
      true
    );
    // discount factor = 58200/60000 = 0.97
    // line1 taxable = 38800 @5% = 1940; line2 taxable = 19400 @18% = 3492
    expect(r.taxAmount).toBe(5432);
    expect(r.totalAmount).toBe(63632);
  });

  it('uses IGST (not CGST/SGST) for inter-state orders', () => {
    const r = computeOrderTotals([{ subtotal: 10000, gstRate: 12 }], false);
    expect(r.cgstAmount).toBe(0);
    expect(r.sgstAmount).toBe(0);
    expect(r.igstAmount).toBe(1200);
  });

  it('never produces a negative or NaN total for an empty order', () => {
    const r = computeOrderTotals([], true);
    expect(r.totalAmount).toBe(0);
    expect(Number.isNaN(r.totalAmount)).toBe(false);
  });

  it('computeTotals is a single-line convenience wrapper', () => {
    const a = computeTotals(10000, true, 18);
    const b = computeOrderTotals([{ subtotal: 10000, gstRate: 18 }], true);
    expect(a).toEqual(b);
  });
});

describe('isIntraState', () => {
  it('matches exact and near-equal state names', () => {
    expect(isIntraState('Delhi', 'Delhi')).toBe(true);
    expect(isIntraState('Delhi', 'New Delhi')).toBe(true);
  });
  it('treats different states as inter-state', () => {
    expect(isIntraState('Delhi', 'Punjab')).toBe(false);
  });
  it('treats an unknown buyer state as inter-state, never silently intra', () => {
    expect(isIntraState('Delhi', '')).toBe(false);
  });
});

describe('dealerStateFromGstin', () => {
  it('derives the state from the GSTIN prefix', () => {
    expect(dealerStateFromGstin('07AAAAA0000A1Z5')).toBe('Delhi');
    expect(dealerStateFromGstin('27AAAAA0000A1Z5')).toBe('Maharashtra');
  });
  it('falls back when there is no GSTIN', () => {
    expect(dealerStateFromGstin(null)).toBeTruthy();
  });
});

describe('hsnRateHint', () => {
  it('matches the longest known prefix', () => {
    expect(hsnRateHint('19052090')).toBe(18); // biscuits
    expect(hsnRateHint('11010000')).toBe(5); // wheat flour
  });
  it('returns undefined for an unrecognised code', () => {
    expect(hsnRateHint('999999')).toBeUndefined();
    expect(hsnRateHint(undefined)).toBeUndefined();
  });
});
