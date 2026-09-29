import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { requireSession, handleError, jsonError } from '@/lib/guard';
import { HttpError, httpsUrl, reqNum, reqStr, str } from '@/lib/validate';
import { DEFAULT_GST_RATE } from '@/lib/gst';

const VALID_GST_RATES = [0, 5, 12, 18, 28];
function parseGstRate(v: unknown, fallback = DEFAULT_GST_RATE): number {
  const n = Number(v);
  return VALID_GST_RATES.includes(n) ? n : fallback;
}

// GET is public on purpose: it is the storefront catalogue. Everything else is DEALER-only.
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { tiers: { orderBy: { minQty: 'asc' } } },
      orderBy: { id: 'asc' }
    });

    const formatted = products.map((p) => {
      let region: unknown = undefined;
      try {
        region = p.regionPopularity ? JSON.parse(p.regionPopularity) : undefined;
      } catch {
        region = undefined;
      }
      return {
        ...p,
        regionPopularity: region,
        tiers: p.tiers.map((t) => ({
          id: t.id,
          minQty: t.minQty,
          pricePerUnit: t.pricePerUnit,
          label: t.label || undefined
        }))
      };
    });
    return NextResponse.json(formatted);
  } catch (err) {
    return handleError(err, 'products:GET', 'Failed to fetch products');
  }
}

function parseTiers(raw: unknown) {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw) || raw.length > 20) throw new HttpError(400, 'Invalid pricing tiers.');
  return raw.map((t: any) => ({
    minQty: reqNum(t?.minQty, 'Tier quantity', { int: true, min: 1, max: 1e7 }),
    pricePerUnit: reqNum(t?.pricePerUnit, 'Tier price', { min: 0.01, max: 1e7 }),
    label: str(t?.label, 60) || null
  }));
}

function parseRegion(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  if (s.length > 4000) throw new HttpError(400, 'regionPopularity is too large.');
  return s;
}

export async function POST(req: Request) {
  try {
    const auth = await requireSession(req, ['DEALER']);
    if ('error' in auth) return auth.error;

    const b = await req.json().catch(() => ({}));
    const tiers = parseTiers(b.tiers) || [];

    const created = await prisma.product.create({
      data: {
        id: `prod-${randomUUID()}`,
        sku: reqStr(b.sku, 'SKU', 60),
        barcode: str(b.barcode, 60) || null,
        hsnCode: str(b.hsnCode, 12) || '2106',
        gstRate: parseGstRate(b.gstRate),
        name: reqStr(b.name, 'Name', 160),
        category: reqStr(b.category, 'Category', 60),
        description: str(b.description, 2000) || '',
        wholesalePrice: reqNum(b.wholesalePrice, 'Wholesale price', { min: 0.01, max: 1e7 }),
        mrp: reqNum(b.mrp, 'MRP', { min: 0.01, max: 1e7 }),
        moq: reqNum(b.moq ?? 1, 'MOQ', { int: true, min: 1, max: 1e6 }),
        packSize: reqStr(b.packSize, 'Pack size', 60),
        stockQty: reqNum(b.stockQty ?? 0, 'Stock', { int: true, min: 0, max: 1e8 }),
        inStock: b.inStock === undefined ? true : Boolean(b.inStock),
        imageUrl: (() => {
          const u = httpsUrl(b.imageUrl);
          if (!u) throw new HttpError(400, 'Image URL must be a valid https URL.');
          return u;
        })(),
        regionPopularity: parseRegion(b.regionPopularity) ?? null,
        tiers: { create: tiers }
      },
      include: { tiers: true }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleError(err, 'products:POST', 'Failed to create product');
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireSession(req, ['DEALER']);
    if ('error' in auth) return auth.error;

    const b = await req.json().catch(() => ({}));
    const id = str(b.id, 100);
    if (!id) return jsonError(400, 'Product ID is required');

    const data: Record<string, any> = {};
    if (b.sku !== undefined) data.sku = reqStr(b.sku, 'SKU', 60);
    if (b.barcode !== undefined) data.barcode = str(b.barcode, 60) || null;
    if (b.hsnCode !== undefined) data.hsnCode = str(b.hsnCode, 12) || '2106';
    if (b.gstRate !== undefined) data.gstRate = parseGstRate(b.gstRate);
    if (b.name !== undefined) data.name = reqStr(b.name, 'Name', 160);
    if (b.category !== undefined) data.category = reqStr(b.category, 'Category', 60);
    if (b.description !== undefined) data.description = str(b.description, 2000) || '';
    if (b.wholesalePrice !== undefined) data.wholesalePrice = reqNum(b.wholesalePrice, 'Wholesale price', { min: 0.01, max: 1e7 });
    if (b.mrp !== undefined) data.mrp = reqNum(b.mrp, 'MRP', { min: 0.01, max: 1e7 });
    if (b.moq !== undefined) data.moq = reqNum(b.moq, 'MOQ', { int: true, min: 1, max: 1e6 });
    if (b.packSize !== undefined) data.packSize = reqStr(b.packSize, 'Pack size', 60);
    if (b.stockQty !== undefined) data.stockQty = reqNum(b.stockQty, 'Stock', { int: true, min: 0, max: 1e8 });
    if (b.inStock !== undefined) data.inStock = Boolean(b.inStock);
    if (b.imageUrl !== undefined) {
      const u = httpsUrl(b.imageUrl);
      if (!u) throw new HttpError(400, 'Image URL must be a valid https URL.');
      data.imageUrl = u;
    }
    if (b.regionPopularity !== undefined) data.regionPopularity = parseRegion(b.regionPopularity);
    const tiers = parseTiers(b.tiers);

    const updated = await prisma.$transaction(async (tx) => {
      if (tiers) {
        await tx.pricingTier.deleteMany({ where: { productId: id } });
        if (tiers.length > 0) {
          await tx.pricingTier.createMany({ data: tiers.map((t) => ({ productId: id, ...t })) });
        }
      }
      return tx.product.update({
        where: { id },
        data,
        include: { tiers: { orderBy: { minQty: 'asc' } } }
      });
    });
    return NextResponse.json(updated);
  } catch (err) {
    return handleError(err, 'products:PUT', 'Failed to update product');
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireSession(req, ['DEALER']);
    if ('error' in auth) return auth.error;

    const id = str(new URL(req.url).searchParams.get('id'), 100);
    if (!id) return jsonError(400, 'Product ID is required');
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, id });
  } catch (err) {
    return handleError(err, 'products:DELETE', 'Failed to delete product');
  }
}
