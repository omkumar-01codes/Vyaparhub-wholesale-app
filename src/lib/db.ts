import {
  Product,
  Customer,
  Order,
  LedgerEntry,
  DealerProfile,
  MonthlyStats,
  RegionalInsight,
  PaymentMode,
  PaymentStatus,
  OrderStatus,
  SettlementMode
} from './types';

// Default Dealer Profile (Shree Laxmi Wholesale Distributors)
export const initialDealerProfile: DealerProfile = {
  name: "Rajesh Sharma",
  businessName: "Shree Laxmi Trading & Wholesale Hub",
  tagline: "Authorized Master Wholesaler & FMCG Distributor",
  phone: "+91 98765 43210",
  email: "rajesh@shreelaxmitrading.com",
  address: "Shop #14-16, Wholesale Grain & FMCG Market, Sector 22, New Delhi - 110028",
  gstin: "07AAAAA0000A1Z5",
  upiId: "shreelaxmitrading@okaxis",
  upiName: "Shree Laxmi Trading Co",
  bankAccount: "987654321012",
  ifscCode: "HDFC0001234",
  bankName: "HDFC Bank, Wholesale Market Branch"
};

// Seed Products
export const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Fortune Sunlite Refined Sunflower Oil (1L Pouch)",
    category: "Edible Oils & Ghee",
    description: "Premium refined sunflower oil with vitamins A & D. Carton packaging with 12 pouches.",
    sku: "OIL-FORT-1L-12",
    gstRate: 5, // demo default; set per-product on the GST portal
    wholesalePrice: 1240, // for pack of 12 (₹103.3/pc vs MRP ₹135)
    mrp: 1620,
    moq: 5, // 5 cartons
    packSize: "Box of 12 pouches (1L each)",
    stockQty: 320,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80",
    regionPopularity: { "North": 92, "West": 75, "South": 60, "East": 55 },
    tiers: [
      { minQty: 5, pricePerUnit: 1240, label: "MOQ Standard" },
      { minQty: 15, pricePerUnit: 1190, label: "Bulk Carton (Save ₹50)" },
      { minQty: 40, pricePerUnit: 1140, label: "Super Distributor (Save ₹100)" }
    ]
  },
  {
    id: "prod-2",
    name: "Tata Tea Gold Leaf Premium Tea (500g Pack)",
    category: "Beverages & Tea",
    description: "Exquisite blend of fine Assam tea with gently rolled long leaves. Master carton of 24 units.",
    sku: "TEA-TATA-500G-24",
    gstRate: 5, // demo default; set per-product on the GST portal
    wholesalePrice: 5760, // ₹240/pc vs MRP ₹310
    mrp: 7440,
    moq: 2,
    packSize: "Master Box of 24 packs (500g)",
    stockQty: 185,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80",
    regionPopularity: { "North": 88, "West": 85, "South": 70, "East": 96 },
    tiers: [
      { minQty: 2, pricePerUnit: 5760, label: "MOQ Standard" },
      { minQty: 6, pricePerUnit: 5520, label: "Bulk Box (Save ₹240)" },
      { minQty: 15, pricePerUnit: 5280, label: "Wholesale Mandi (Save ₹480)" }
    ]
  },
  {
    id: "prod-3",
    name: "Aashirvaad Shudh Chakki Atta (10kg Bag)",
    category: "Staples & Flour",
    description: "100% whole wheat flour, fiber-rich rotis. Bundle of 5 bags.",
    sku: "ATTA-AASH-10KG-5",
    gstRate: 5, // demo default; set per-product on the GST portal
    wholesalePrice: 1950, // ₹390/bag vs MRP ₹475
    mrp: 2375,
    moq: 10,
    packSize: "Bundle of 5 Bags (10kg each)",
    stockQty: 450,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    regionPopularity: { "North": 98, "West": 82, "South": 45, "East": 78 },
    tiers: [
      { minQty: 10, pricePerUnit: 1950, label: "MOQ Standard" },
      { minQty: 25, pricePerUnit: 1875, label: "Bulk Bundle (Save ₹75)" },
      { minQty: 60, pricePerUnit: 1800, label: "Mandi Truckload (Save ₹150)" }
    ]
  },
  {
    id: "prod-4",
    name: "Cadbury Dairy Milk Silk Chocolate (60g)",
    category: "Confectionery & Snacks",
    description: "Creamy chocolate bar. Display stand pack of 48 units.",
    sku: "CHOC-CAD-60G-48",
    gstRate: 5, // demo default; set per-product on the GST portal
    wholesalePrice: 2880, // ₹60/pc vs MRP ₹85
    mrp: 4080,
    moq: 4,
    packSize: "Retail Display Box (48 bars)",
    stockQty: 110,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80",
    regionPopularity: { "North": 75, "West": 94, "South": 89, "East": 65 },
    tiers: [
      { minQty: 4, pricePerUnit: 2880, label: "MOQ Standard" },
      { minQty: 12, pricePerUnit: 2720, label: "Festive Pack (Save ₹160)" },
      { minQty: 30, pricePerUnit: 2550, label: "Super Wholesale (Save ₹330)" }
    ]
  },
  {
    id: "prod-5",
    name: "Surf Excel Easy Wash Detergent Powder (1kg Pack)",
    category: "Household & Cleaning",
    description: "Superior stain removal detergent. Carton containing 20 packs of 1kg.",
    sku: "DET-SURF-1KG-20",
    gstRate: 5, // demo default; set per-product on the GST portal
    wholesalePrice: 2400, // ₹120/pc vs MRP ₹155
    mrp: 3100,
    moq: 3,
    packSize: "Carton of 20 packs (1kg each)",
    stockQty: 240,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80",
    regionPopularity: { "North": 85, "West": 88, "South": 82, "East": 90 },
    tiers: [
      { minQty: 3, pricePerUnit: 2400, label: "MOQ Standard" },
      { minQty: 10, pricePerUnit: 2280, label: "Bulk Carton (Save ₹120)" },
      { minQty: 25, pricePerUnit: 2160, label: "Distributor Case (Save ₹240)" }
    ]
  },
  {
    id: "prod-6",
    name: "Dettol Original Liquid Handwash Refill (1.5L Pouch)",
    category: "Personal Care & Hygiene",
    description: "10x better germ protection. Wholesale case of 12 pouches.",
    sku: "HW-DETT-1.5L-12",
    gstRate: 5, // demo default; set per-product on the GST portal
    wholesalePrice: 2040, // ₹170/pc vs MRP ₹230
    mrp: 2760,
    moq: 2,
    packSize: "Case of 12 pouches (1.5L each)",
    stockQty: 95,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    regionPopularity: { "North": 70, "West": 90, "South": 92, "East": 60 },
    tiers: [
      { minQty: 2, pricePerUnit: 2040, label: "MOQ Standard" },
      { minQty: 8, pricePerUnit: 1920, label: "Bulk Case (Save ₹120)" },
      { minQty: 20, pricePerUnit: 1800, label: "Agency Wholesale (Save ₹240)" }
    ]
  },
  {
    id: "prod-7",
    name: "Maggi 2-Minute Noodles Masala (70g Pack)",
    category: "Confectionery & Snacks",
    description: "India's favorite instant noodles. Super bulk master carton of 96 packs.",
    sku: "NOD-MAGG-70G-96",
    gstRate: 5, // demo default; set per-product on the GST portal
    wholesalePrice: 1152, // ₹12/pc vs MRP ₹14
    mrp: 1344,
    moq: 5,
    packSize: "Master Box of 96 packs",
    stockQty: 480,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80",
    regionPopularity: { "North": 95, "West": 91, "South": 85, "East": 94 },
    tiers: [
      { minQty: 5, pricePerUnit: 1152, label: "MOQ Standard" },
      { minQty: 15, pricePerUnit: 1080, label: "Bulk Carton (Save ₹72)" },
      { minQty: 40, pricePerUnit: 1020, label: "Super Mega-Box (Save ₹132)" }
    ]
  },
  {
    id: "prod-8",
    name: "Haldiram's Bhujia Sev Special (1kg Pouch)",
    category: "Confectionery & Snacks",
    description: "Spicy crisp gram flour noodle snack. Carton of 15 packs.",
    sku: "SNK-HALD-1KG-15",
    gstRate: 5, // demo default; set per-product on the GST portal
    wholesalePrice: 3300, // ₹220/pc vs MRP ₹290
    mrp: 4350,
    moq: 3,
    packSize: "Carton of 15 Packs (1kg)",
    stockQty: 160,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80",
    regionPopularity: { "North": 99, "West": 80, "South": 50, "East": 72 },
    tiers: [
      { minQty: 3, pricePerUnit: 3300, label: "MOQ Standard" },
      { minQty: 8, pricePerUnit: 3120, label: "Bulk Pack (Save ₹180)" },
      { minQty: 20, pricePerUnit: 2940, label: "Mandi Stockist (Save ₹360)" }
    ]
  }
];

// Seed Customers / Retailers
export const initialCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Mohan Lal Gupta",
    businessName: "Gupta Super Store & Kirana",
    phone: "+91 98111 22334",
    email: "gupta.kirana@gmail.com",
    state: "Delhi",
    city: "Rohini, Delhi",
    address: "Plot 42, Pocket C-8, Sector 8, Rohini",
    gstNumber: "07BXZPG1234M1ZV",
    creditLimit: 150000,
    outstandingDebt: 42500,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "cust-2",
    name: "Rameshwar Patel",
    businessName: "Patel Provision & Mart",
    phone: "+91 98222 33445",
    email: "patel.mart@gmail.com",
    state: "Gujarat",
    city: "Ahmedabad",
    address: "Shop 12, Maninagar Cross Road, Ahmedabad",
    gstNumber: "24AAECP9876C1ZQ",
    creditLimit: 200000,
    outstandingDebt: 87200,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "cust-3",
    name: "Suresh Reddy",
    businessName: "Sri Balaji Wholesale Retailers",
    phone: "+91 98333 44556",
    email: "balaji.reddy@gmail.com",
    state: "Telangana",
    city: "Hyderabad",
    address: "Begum Bazar Main Road, Hyderabad",
    gstNumber: "36AACCR4567R1ZS",
    creditLimit: 300000,
    outstandingDebt: 115000,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "cust-4",
    name: "Amitabh Sen",
    businessName: "Bengal Variety Store",
    phone: "+91 98444 55667",
    email: "sen.bengal@gmail.com",
    state: "West Bengal",
    city: "Kolkata",
    address: "45 Bara Bazar, Posta, Kolkata",
    gstNumber: "19AADCS3456N1ZX",
    creditLimit: 120000,
    outstandingDebt: 18400,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "cust-5",
    name: "Vikas Verma",
    businessName: "Verma Traders & Daily Needs",
    phone: "+91 98555 66778",
    email: "vikas.verma@gmail.com",
    state: "Uttar Pradesh",
    city: "Lucknow",
    address: "Aminabad Commercial Market, Lucknow",
    gstNumber: "09AAEPV6789K1ZK",
    creditLimit: 180000,
    outstandingDebt: 0,
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
  }
];

// Seed Past Orders
export const initialOrders: Order[] = [
  {
    id: "ord-101",
    orderNumber: "ORD-2026-0801",
    customerId: "cust-1",
    customerName: "Mohan Lal Gupta",
    customerPhone: "+91 98111 22334",
    businessName: "Gupta Super Store & Kirana",
    state: "Delhi",
    city: "Rohini, Delhi",
    items: [
      {
        productId: "prod-1",
        productName: "Fortune Sunlite Refined Sunflower Oil (1L Pouch)",
        sku: "OIL-FORT-1L-12",
        wholesalePrice: 1240,
        quantity: 10,
        packSize: "Box of 12 pouches",
        totalPrice: 12400
      },
      {
        productId: "prod-3",
        productName: "Aashirvaad Shudh Chakki Atta (10kg Bag)",
        sku: "ATTA-AASH-10KG-5",
        wholesalePrice: 1950,
        quantity: 15,
        packSize: "Bundle of 5 Bags",
        totalPrice: 29250
      }
    ],
    subtotal: 41650,
    taxAmount: 2082.5,
    discountAmount: 1232.5,
    totalAmount: 42500,
    paymentMode: "CREDIT_DEBT",
    paymentStatus: "ADDED_TO_DEBT",
    orderStatus: "DELIVERED",
    notes: "Regular monthly staple restock on 30-day credit.",
    createdAt: "2026-08-10T11:30:00.000Z"
  },
  {
    id: "ord-102",
    orderNumber: "ORD-2026-0802",
    customerId: "cust-2",
    customerName: "Rameshwar Patel",
    customerPhone: "+91 98222 33445",
    businessName: "Patel Provision & Mart",
    state: "Gujarat",
    city: "Ahmedabad",
    items: [
      {
        productId: "prod-4",
        productName: "Cadbury Dairy Milk Silk Chocolate (60g)",
        sku: "CHOC-CAD-60G-48",
        wholesalePrice: 2880,
        quantity: 10,
        packSize: "Retail Display Box (48 bars)",
        totalPrice: 28800
      },
      {
        productId: "prod-2",
        productName: "Tata Tea Gold Leaf Premium Tea (500g Pack)",
        sku: "TEA-TATA-500G-24",
        wholesalePrice: 5760,
        quantity: 8,
        packSize: "Master Box of 24 packs",
        totalPrice: 46080
      },
      {
        productId: "prod-7",
        productName: "Maggi 2-Minute Noodles Masala (70g Pack)",
        sku: "NOD-MAGG-70G-96",
        wholesalePrice: 1152,
        quantity: 10,
        packSize: "Master Box of 96 packs",
        totalPrice: 11520
      }
    ],
    subtotal: 86400,
    taxAmount: 4320,
    discountAmount: 3520,
    totalAmount: 87200,
    paymentMode: "CREDIT_DEBT",
    paymentStatus: "ADDED_TO_DEBT",
    orderStatus: "DISPATCHED",
    notes: "Raksha Bandhan festival rush stock.",
    createdAt: "2026-08-16T14:15:00.000Z"
  },
  {
    id: "ord-103",
    orderNumber: "ORD-2026-0803",
    customerId: "cust-5",
    customerName: "Vikas Verma",
    customerPhone: "+91 98555 66778",
    businessName: "Verma Traders & Daily Needs",
    state: "Uttar Pradesh",
    city: "Lucknow",
    items: [
      {
        productId: "prod-5",
        productName: "Surf Excel Easy Wash Detergent Powder (1kg Pack)",
        sku: "DET-SURF-1KG-20",
        wholesalePrice: 2400,
        quantity: 12,
        packSize: "Carton of 20 packs",
        totalPrice: 28800
      },
      {
        productId: "prod-6",
        productName: "Dettol Original Liquid Handwash Refill (1.5L Pouch)",
        sku: "HW-DETT-1.5L-12",
        wholesalePrice: 2040,
        quantity: 10,
        packSize: "Case of 12 pouches",
        totalPrice: 20400
      }
    ],
    subtotal: 49200,
    taxAmount: 2460,
    discountAmount: 1660,
    totalAmount: 50000,
    paymentMode: "UPI_QR",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    upiReference: "UPI-AXIS-982374619283",
    notes: "Instant UPI scan payment settled.",
    createdAt: "2026-08-18T09:45:00.000Z"
  },
  {
    id: "ord-104",
    orderNumber: "ORD-2026-0804",
    customerId: "cust-4",
    customerName: "Amitabh Sen",
    customerPhone: "+91 98444 55667",
    businessName: "Bengal Variety Store",
    state: "West Bengal",
    city: "Kolkata",
    items: [
      {
        productId: "prod-2",
        productName: "Tata Tea Gold Leaf Premium Tea (500g Pack)",
        sku: "TEA-TATA-500G-24",
        wholesalePrice: 5760,
        quantity: 3,
        packSize: "Master Box of 24 packs",
        totalPrice: 17280
      },
      {
        productId: "prod-8",
        productName: "Haldiram's Bhujia Sev Special (1kg Pouch)",
        sku: "SNK-HALD-1KG-15",
        wholesalePrice: 3300,
        quantity: 4,
        packSize: "Carton of 15 Packs",
        totalPrice: 13200
      }
    ],
    subtotal: 30480,
    taxAmount: 1524,
    discountAmount: 1604,
    totalAmount: 30400,
    paymentMode: "CREDIT_DEBT",
    paymentStatus: "ADDED_TO_DEBT",
    orderStatus: "CONFIRMED",
    notes: "Dispatched via DTDC logistics Kolkata.",
    createdAt: "2026-08-21T16:20:00.000Z"
  }
];

// Seed Debt Ledger History
export const initialLedgerEntries: LedgerEntry[] = [
  // Customer 1 (Gupta Kirana)
  {
    id: "led-1",
    customerId: "cust-1",
    customerName: "Mohan Lal Gupta",
    businessName: "Gupta Super Store & Kirana",
    type: "DEBIT_ORDER",
    amount: 55000,
    runningBalance: 55000,
    paymentMode: "ORDER_CREDIT",
    referenceNumber: "ORD-2026-0715",
    notes: "Order purchase on credit",
    date: "2026-07-15T10:00:00.000Z"
  },
  {
    id: "led-2",
    customerId: "cust-1",
    customerName: "Mohan Lal Gupta",
    businessName: "Gupta Super Store & Kirana",
    type: "CREDIT_PAYMENT",
    amount: 55000,
    runningBalance: 0,
    paymentMode: "UPI",
    referenceNumber: "UPI-PAYTM-7839210",
    notes: "Full settlement received via Paytm UPI",
    date: "2026-07-30T17:40:00.000Z"
  },
  {
    id: "led-3",
    customerId: "cust-1",
    customerName: "Mohan Lal Gupta",
    businessName: "Gupta Super Store & Kirana",
    type: "DEBIT_ORDER",
    amount: 42500,
    runningBalance: 42500,
    paymentMode: "ORDER_CREDIT",
    referenceNumber: "ORD-2026-0801",
    notes: "Order purchase on credit (August)",
    date: "2026-08-10T11:30:00.000Z"
  },
  // Customer 2 (Patel Provision)
  {
    id: "led-4",
    customerId: "cust-2",
    customerName: "Rameshwar Patel",
    businessName: "Patel Provision & Mart",
    type: "DEBIT_ORDER",
    amount: 87200,
    runningBalance: 87200,
    paymentMode: "ORDER_CREDIT",
    referenceNumber: "ORD-2026-0802",
    notes: "Order purchase on credit",
    date: "2026-08-16T14:15:00.000Z"
  },
  // Customer 3 (Sri Balaji)
  {
    id: "led-5",
    customerId: "cust-3",
    customerName: "Suresh Reddy",
    businessName: "Sri Balaji Wholesale Retailers",
    type: "DEBIT_ORDER",
    amount: 165000,
    runningBalance: 165000,
    paymentMode: "ORDER_CREDIT",
    referenceNumber: "ORD-2026-0720",
    notes: "Wholesale bulk stock dispatch",
    date: "2026-07-20T12:00:00.000Z"
  },
  {
    id: "led-6",
    customerId: "cust-3",
    customerName: "Suresh Reddy",
    businessName: "Sri Balaji Wholesale Retailers",
    type: "CREDIT_PAYMENT",
    amount: 50000,
    runningBalance: 115000,
    paymentMode: "BANK_TRANSFER",
    referenceNumber: "NEFT-HDFC-99382109",
    notes: "Partial payment received via NEFT",
    date: "2026-08-05T15:30:00.000Z"
  },
  // Customer 4 (Bengal Variety Store)
  {
    id: "led-7",
    customerId: "cust-4",
    customerName: "Amitabh Sen",
    businessName: "Bengal Variety Store",
    type: "DEBIT_ORDER",
    amount: 30400,
    runningBalance: 30400,
    paymentMode: "ORDER_CREDIT",
    referenceNumber: "ORD-2026-0804",
    notes: "Order purchase on credit",
    date: "2026-08-21T16:20:00.000Z"
  },
  {
    id: "led-8",
    customerId: "cust-4",
    customerName: "Amitabh Sen",
    businessName: "Bengal Variety Store",
    type: "CREDIT_PAYMENT",
    amount: 12000,
    runningBalance: 18400,
    paymentMode: "CASH",
    referenceNumber: "CASH-REC-109",
    notes: "Cash payment received by delivery agent",
    date: "2026-08-23T11:00:00.000Z"
  }
];

