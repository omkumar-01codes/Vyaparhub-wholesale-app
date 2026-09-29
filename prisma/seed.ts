import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  initialProducts,
  initialCustomers,
  initialOrders,
  initialLedgerEntries,
  initialDealerProfile
} from '../src/lib/db';

const prisma = new PrismaClient();

// Demo customers / orders / ledger / logins exist ONLY for local demos. They ship known
// passwords, so they are never created in production.
const DEMO = process.env.SEED_DEMO_USERS === 'true' && process.env.NODE_ENV !== 'production';

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Dealer Profile
  await prisma.dealerProfile.upsert({
    where: { id: 'dealer-main' },
    update: {
      name: initialDealerProfile.name,
      businessName: initialDealerProfile.businessName,
      tagline: initialDealerProfile.tagline,
      phone: initialDealerProfile.phone,
      email: initialDealerProfile.email,
      address: initialDealerProfile.address,
      gstin: initialDealerProfile.gstin,
      upiId: initialDealerProfile.upiId,
      upiName: initialDealerProfile.upiName,
      bankAccount: initialDealerProfile.bankAccount,
      ifscCode: initialDealerProfile.ifscCode,
      bankName: initialDealerProfile.bankName
    },
    create: {
      id: 'dealer-main',
      name: initialDealerProfile.name,
      businessName: initialDealerProfile.businessName,
      tagline: initialDealerProfile.tagline,
      phone: initialDealerProfile.phone,
      email: initialDealerProfile.email,
      address: initialDealerProfile.address,
      gstin: initialDealerProfile.gstin,
      upiId: initialDealerProfile.upiId,
      upiName: initialDealerProfile.upiName,
      bankAccount: initialDealerProfile.bankAccount,
      ifscCode: initialDealerProfile.ifscCode,
      bankName: initialDealerProfile.bankName
    }
  });
  console.log('✅ Dealer Profile seeded.');

  // 2. Seed Products with Tiers
  const hsnMap: Record<string, string> = {
    'Edible Oils': '1507',
    'Atta & Flours': '1101',
    'Sugar & Sweeteners': '1701',
    'Spices & Masalas': '0910',
    'Tea & Beverages': '0902',
    'Personal Care': '3401',
    'Biscuits & Snacks': '1905'
  };
  // Approximate demo defaults only - confirm the exact GST slab per product on the GST portal.
  const gstRateMap: Record<string, number> = {
    'Edible Oils': 5,
    'Atta & Flours': 5,
    'Sugar & Sweeteners': 5,
    'Spices & Masalas': 5,
    'Tea & Beverages': 5,
    'Personal Care': 18,
    'Biscuits & Snacks': 18
  };

  for (const prod of initialProducts) {
    const hsnCode = hsnMap[prod.category] || '2106';
    const gstRate = gstRateMap[prod.category] ?? 5;

    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        sku: prod.sku,
        hsnCode,
        gstRate,
        name: prod.name,
        category: prod.category,
        description: prod.description || '',
        wholesalePrice: prod.wholesalePrice,
        mrp: prod.mrp,
        moq: prod.moq,
        packSize: prod.packSize,
        stockQty: prod.stockQty,
        inStock: prod.inStock,
        imageUrl: prod.imageUrl,
        regionPopularity: prod.regionPopularity ? JSON.stringify(prod.regionPopularity) : null
      },
      create: {
        id: prod.id,
        sku: prod.sku,
        hsnCode,
        gstRate,
        name: prod.name,
        category: prod.category,
        description: prod.description || '',
        wholesalePrice: prod.wholesalePrice,
        mrp: prod.mrp,
        moq: prod.moq,
        packSize: prod.packSize,
        stockQty: prod.stockQty,
        inStock: prod.inStock,
        imageUrl: prod.imageUrl,
        regionPopularity: prod.regionPopularity ? JSON.stringify(prod.regionPopularity) : null
      }
    });

    // Seed pricing tiers
    if (prod.tiers && prod.tiers.length > 0) {
      await prisma.pricingTier.deleteMany({ where: { productId: prod.id } });
      for (const tier of prod.tiers) {
        await prisma.pricingTier.create({
          data: {
            productId: prod.id,
            minQty: tier.minQty,
            pricePerUnit: tier.pricePerUnit,
            label: tier.label || null
          }
        });
      }
    }
  }
  console.log(`✅ ${initialProducts.length} Products and Volume Tiers seeded.`);

  if (DEMO) {
  // 3. Seed Customers
  for (const cust of initialCustomers) {
    await prisma.customer.upsert({
      where: { id: cust.id },
      update: {
        name: cust.name,
        businessName: cust.businessName,
        phone: cust.phone,
        email: cust.email || '',
        state: cust.state,
        city: cust.city,
        address: cust.address || '',
        gstNumber: cust.gstNumber || null,
        creditLimit: cust.creditLimit,
        outstandingDebt: cust.outstandingDebt,
        avatarUrl: cust.avatarUrl || null
      },
      create: {
        id: cust.id,
        name: cust.name,
        businessName: cust.businessName,
        phone: cust.phone,
        email: cust.email || '',
        state: cust.state,
        city: cust.city,
        address: cust.address || '',
        gstNumber: cust.gstNumber || null,
        creditLimit: cust.creditLimit,
        outstandingDebt: cust.outstandingDebt,
        avatarUrl: cust.avatarUrl || null
      }
    });
  }
  console.log(`✅ ${initialCustomers.length} Customers seeded.`);

  // 4. Seed Orders with Items
  for (const ord of initialOrders) {
    await prisma.order.upsert({
      where: { id: ord.id },
      update: {
        orderNumber: ord.orderNumber,
        customerId: ord.customerId,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        businessName: ord.businessName,
        state: ord.state,
        city: ord.city,
        subtotal: ord.subtotal,
        taxAmount: ord.taxAmount,
        discountAmount: ord.discountAmount,
        totalAmount: ord.totalAmount,
        paymentMode: ord.paymentMode,
        paymentStatus: ord.paymentStatus,
        orderStatus: ord.orderStatus,
        notes: ord.notes || null,
        createdAt: new Date(ord.createdAt),
        upiReference: ord.upiReference || null
      },
      create: {
        id: ord.id,
        orderNumber: ord.orderNumber,
        customerId: ord.customerId,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        businessName: ord.businessName,
        state: ord.state,
        city: ord.city,
        subtotal: ord.subtotal,
        taxAmount: ord.taxAmount,
        discountAmount: ord.discountAmount,
        totalAmount: ord.totalAmount,
        paymentMode: ord.paymentMode,
        paymentStatus: ord.paymentStatus,
        orderStatus: ord.orderStatus,
        notes: ord.notes || null,
        createdAt: new Date(ord.createdAt),
        upiReference: ord.upiReference || null,
        items: {
          create: ord.items.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            sku: it.sku,
            wholesalePrice: it.wholesalePrice,
            quantity: it.quantity,
            dispatchedQuantity: it.dispatchedQuantity ?? it.quantity,
            backorderedQuantity: it.backorderedQuantity ?? 0,
            packSize: it.packSize,
            totalPrice: it.totalPrice
          }))
        }
      }
    });
  }
  console.log(`✅ ${initialOrders.length} Orders and line items seeded.`);

  // 5. Seed Ledger Entries
  for (const entry of initialLedgerEntries) {
    await prisma.ledgerEntry.upsert({
      where: { id: entry.id },
      update: {
        customerId: entry.customerId,
        customerName: entry.customerName,
        businessName: entry.businessName,
        type: entry.type,
        amount: entry.amount,
        runningBalance: entry.runningBalance,
        paymentMode: entry.paymentMode,
        referenceNumber: entry.referenceNumber || null,
        notes: entry.notes || null,
        date: new Date(entry.date),
        agingStatus: entry.agingStatus || 'CURRENT'
      },
      create: {
        id: entry.id,
        customerId: entry.customerId,
        customerName: entry.customerName,
        businessName: entry.businessName,
        type: entry.type,
        amount: entry.amount,
        runningBalance: entry.runningBalance,
        paymentMode: entry.paymentMode,
        referenceNumber: entry.referenceNumber || null,
        notes: entry.notes || null,
        date: new Date(entry.date),
        agingStatus: entry.agingStatus || 'CURRENT'
      }
    });
  }
  console.log(`✅ ${initialLedgerEntries.length} Ledger entries seeded.`);

  } // end DEMO-only customers / orders / ledger

  // 6. Users
  // The real dealer login comes from env vars - there is no default/known password.
  const dealerPassword = process.env.SEED_DEALER_PASSWORD || '';
  const dealerEmail = (process.env.SEED_DEALER_EMAIL || '').trim().toLowerCase();
  const dealerPhone = (process.env.SEED_DEALER_PHONE || '').replace(/\D/g, '');
  if (dealerPassword.length < 12 || !dealerEmail || !/^[6-9]\d{9}$/.test(dealerPhone)) {
    throw new Error(
      'Set SEED_DEALER_EMAIL, SEED_DEALER_PHONE (10 digits) and SEED_DEALER_PASSWORD (12+ chars) before seeding.'
    );
  }
  const dealerHash = bcrypt.hashSync(dealerPassword, 12);
  await prisma.user.upsert({
    where: { email: dealerEmail },
    update: { name: initialDealerProfile.name, phone: dealerPhone, password: dealerHash, role: 'DEALER', customerId: null },
    create: {
      id: 'usr-dealer-1',
      name: initialDealerProfile.name,
      email: dealerEmail,
      phone: dealerPhone,
      password: dealerHash,
      role: 'DEALER',
      customerId: null
    }
  });
  console.log('✅ Dealer user seeded.');

  if (DEMO) {
    const demoUsers = [
      { id: 'usr-retailer-1', name: 'Ramesh Gupta', email: 'ramesh@guptastores.com', phone: '9876543210', password: 'retailer123', role: 'RETAILER', customerId: 'cust-1' },
      { id: 'usr-retailer-2', name: 'Suresh Sharma', email: 'suresh@sharmaprovisions.com', phone: '9876543211', password: 'retailer123', role: 'RETAILER', customerId: 'cust-2' },
      { id: 'usr-sales-1', name: 'Rajesh Sharma', email: 'sales@vyaparhub.com', phone: '9876599999', password: 'sales123', role: 'SALES_REP', customerId: null }
    ];
    for (const u of demoUsers) {
      const hashed = bcrypt.hashSync(u.password, 10);
      await prisma.user.upsert({
        where: { email: u.email },
        update: { name: u.name, phone: u.phone, password: hashed, role: u.role, customerId: u.customerId },
        create: { ...u, password: hashed }
      });
    }
    console.log(`✅ ${demoUsers.length} DEMO users seeded (local only).`);
  }

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
