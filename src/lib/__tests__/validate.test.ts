import { describe, it, expect } from 'vitest';
import { normalizePhone, EMAIL_RE, GSTIN_RE, round2, str, reqStr, num, reqNum, HttpError } from '../validate';

describe('normalizePhone', () => {
  it('accepts a plain 10-digit mobile number', () => {
    expect(normalizePhone('9876543210')).toBe('9876543210');
  });
  it('strips a +91 country code and spaces', () => {
    expect(normalizePhone('+91 98765 43210')).toBe('9876543210');
  });
  it('strips a leading 0 (STD-style entry)', () => {
    expect(normalizePhone('09876543210')).toBe('9876543210');
  });
  it('rejects numbers that are too short or do not start 6-9', () => {
    expect(normalizePhone('12345')).toBeNull();
    expect(normalizePhone('5876543210')).toBeNull();
  });
});

describe('EMAIL_RE / GSTIN_RE', () => {
  it('validates a plausible email', () => {
    expect(EMAIL_RE.test('dealer@example.com')).toBe(true);
    expect(EMAIL_RE.test('not-an-email')).toBe(false);
  });
  it('validates a well-formed GSTIN', () => {
    expect(GSTIN_RE.test('07AAAAA0000A1Z5')).toBe(true);
    expect(GSTIN_RE.test('not-a-gstin')).toBe(false);
  });
});

describe('round2', () => {
  it('rounds to 2 decimal places, avoiding float drift', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(10.1 + 0.2)).toBe(10.3);
  });
});

describe('str / reqStr', () => {
  it('trims and enforces max length', () => {
    expect(str('  hi  ', 10)).toBe('hi');
    expect(str('a'.repeat(20), 10)).toBeUndefined();
    expect(str('', 10)).toBeUndefined();
  });
  it('reqStr throws HttpError(400) when missing', () => {
    expect(() => reqStr('', 'Name')).toThrow(HttpError);
  });
});

describe('num / reqNum', () => {
  it('enforces bounds and integer-ness', () => {
    expect(num('5', { min: 1, max: 10 })).toBe(5);
    expect(num('0', { min: 1, max: 10 })).toBeUndefined();
    expect(num('5.5', { int: true })).toBeUndefined();
  });
  it('reqNum throws HttpError(400) on invalid input', () => {
    expect(() => reqNum('abc', 'Quantity')).toThrow(HttpError);
  });
});
