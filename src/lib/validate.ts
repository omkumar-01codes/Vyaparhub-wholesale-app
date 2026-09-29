// Small dependency-free validation helpers for API routes.

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function str(v: unknown, max = 200): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length > 0 && t.length <= max ? t : undefined;
}

export function reqStr(v: unknown, label: string, max = 200): string {
  const s = str(v, max);
  if (!s) throw new HttpError(400, `${label} is required (max ${max} characters).`);
  return s;
}

export function num(v: unknown, opts: { min?: number; max?: number; int?: boolean } = {}): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  if (opts.int && !Number.isInteger(n)) return undefined;
  if (opts.min !== undefined && n < opts.min) return undefined;
  if (opts.max !== undefined && n > opts.max) return undefined;
  return n;
}

export function reqNum(v: unknown, label: string, opts: { min?: number; max?: number; int?: boolean } = {}): number {
  const n = num(v, opts);
  if (n === undefined) throw new HttpError(400, `${label} is invalid.`);
  return n;
}

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Normalises Indian mobile numbers to 10 digits. Returns null if not a valid mobile. */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;

export function httpsUrl(v: unknown, max = 500): string | undefined {
  const s = str(v, max);
  if (!s) return undefined;
  try {
    return new URL(s).protocol === 'https:' ? s : undefined;
  } catch {
    return undefined;
  }
}
