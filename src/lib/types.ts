export type UserRole = 'DEALER' | 'RETAILER' | 'SALES_REP';
export type PaymentMode = 'CREDIT_DEBT' | 'UPI_QR' | 'COD_BANK';
export type PaymentStatus = 'PAID' | 'ADDED_TO_DEBT' | 'PENDING' | 'VERIFICATION_PENDING' | 'REJECTED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PARTIALLY_DISPATCHED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface PricingTier {
  minQty: number; // e.g. 5, 15, 50
  pricePerUnit: number; // e.g. 850, 815, 780
  label?: string; // e.g. "Standard MOQ", "Bulk Carton", "Super Distributor"
}

export interface TierCalculationResult {
  unitPrice: number;
  activeTier?: PricingTier;
  nextTier?: PricingTier;
  unitsNeededForNextTier: number;
  savingsVsBase: number;
  savingsVsMrp: number;
  totalSavingsVsBase: number;
}

export function calculateItemPrice(product: Product, quantity: number): TierCalculationResult {
  const tiers = product.tiers && product.tiers.length > 0
    ? [...product.tiers].sort((a, b) => a.minQty - b.minQty)
    : [
        {
          minQty: product.moq || 1,
          pricePerUnit: product.wholesalePrice,
          label: 'Standard Wholesale'
        }
      ];

  let activeTier: PricingTier = tiers[0];
  let nextTier: PricingTier | undefined = undefined;

  for (let i = 0; i < tiers.length; i++) {
    if (quantity >= tiers[i].minQty) {
      activeTier = tiers[i];
      nextTier = tiers[i + 1];
    } else {
      if (!nextTier) {
        nextTier = tiers[i];
      }
      break;
    }
  }

  const unitPrice = activeTier ? activeTier.pricePerUnit : product.wholesalePrice;
  const basePrice = tiers[0].pricePerUnit;
  const unitsNeededForNextTier = nextTier ? Math.max(0, nextTier.minQty - quantity) : 0;
  const savingsVsBase = Math.max(0, basePrice - unitPrice);
  const savingsVsMrp = Math.max(0, product.mrp - unitPrice);
  const totalSavingsVsBase = savingsVsBase * quantity;

  return {
    unitPrice,
    activeTier,
    nextTier,
    unitsNeededForNextTier,
    savingsVsBase,
    savingsVsMrp,
    totalSavingsVsBase
  };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  sku: string;
  barcode?: string;
  hsnCode?: string;
  gstRate: number; // GST % for this product, e.g. 5 / 12 / 18 / 28
  wholesalePrice: number;
  mrp: number;
  moq: number; // Minimum Order Quantity
  packSize: string; // e.g. "Pack of 12 pcs"
  stockQty: number;
  inStock: boolean;
  imageUrl: string;
  regionPopularity?: Record<string, number>; // Region wise score for AI
  tiers?: PricingTier[];
}

export interface Customer {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  address: string;
  gstNumber?: string;
  creditLimit: number;
  outstandingDebt: number;
  avatarUrl?: string;
  lastReminderSent?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  hsnCode?: string;
  gstRate?: number;
  wholesalePrice: number;
  quantity: number;
  dispatchedQuantity?: number;
  backorderedQuantity?: number;
  packSize: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  businessName: string;
  state: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number; // Total GST
  taxType?: 'INTRA_STATE' | 'INTER_STATE';
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  discountAmount: number;
  totalAmount: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  upiReference?: string;
  upiProofNote?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  deliveryChallanNumber?: string;
  bookedBy?: string;
  ewayBillNumber?: string;
  ewayBillValidUntil?: string;
  transporterId?: string;
  transporterName?: string;
  vehicleNumber?: string;
}

export type LedgerTransactionType = 'DEBIT_ORDER' | 'CREDIT_PAYMENT';
export type SettlementMode = 'CASH' | 'UPI' | 'CHEQUE' | 'BANK_TRANSFER' | 'ORDER_CREDIT';
export type AgingCategory = 'CURRENT' | 'DUE_SOON' | 'OVERDUE';

export interface LedgerEntry {
  id: string;
  customerId: string;
  customerName: string;
  businessName: string;
  type: LedgerTransactionType; // DEBIT = customer owes more; CREDIT = customer paid money
  amount: number;
  runningBalance: number;
  paymentMode: SettlementMode;
  referenceNumber?: string; // Order #, UTR, Cheque #
  notes?: string;
  date: string;
  agingStatus?: AgingCategory;
}

export interface DealerProfile {
  name: string;
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  upiId: string;
  upiName: string;
  bankAccount: string;
  ifscCode: string;
  bankName: string;
}

export interface MonthlyStats {
  month: string;
  year: number;
  salesRevenue: number;
  debtRecovered: number;
  newDebtGiven: number;
  orderCount: number;
  activeRetailers: number;
}

export interface RegionalInsight {
  region: string;
  salesVolume: number;
  revenue: number;
  topProduct: string;
  growthPercentage: number;
  demandTrend: 'HIGH' | 'STABLE' | 'GROWING' | 'LOW';
  recommendation: string;
}

export interface DebtAgingSummary {
  currentAmount: number;   // 0 - 15 days
  dueSoonAmount: number;   // 16 - 30 days
  overdueAmount: number;   // > 30 days
  hasOverdue: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  customerId?: string | null;
  avatarUrl?: string | null;
}

export interface RegisterFormData {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  password: string;
  state: string;
  city: string;
  address: string;
  gstNumber?: string;
}

export interface EwayBillData {
  ewayBillNumber: string;
  generatedAt: string;
  validUntil: string;
  orderNumber: string;
  invoiceValue: number;
  taxType: 'INTRA_STATE' | 'INTER_STATE';
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  fromGstin: string;
  fromTradeName: string;
  fromAddress: string;
  toGstin?: string;
  toTradeName: string;
  toAddress: string;
  transporterId: string;
  transporterName: string;
  vehicleNumber: string;
  distanceKm: number;
  items: Array<{
    productName: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    taxableAmount: number;
  }>;
}


