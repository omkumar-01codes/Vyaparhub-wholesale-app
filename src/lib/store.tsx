'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  SettlementMode,
  DebtAgingSummary,
  AgingCategory,
  calculateItemPrice,
  AuthUser,
  RegisterFormData
} from './types';
import {
  initialProducts,
  initialCustomers,
  initialOrders,
  initialLedgerEntries,
  initialDealerProfile
} from './db';
import { computeMonthlyStats, computeRegionalInsights, buildInsightsSummary } from './analytics';
import { Language, translations } from './i18n';

export type UserRole = 'DEALER' | 'RETAILER' | 'SALES_REP';
export type Theme = 'light' | 'dark';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.en) => string;

  // Auth Session & User Management
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalTab: 'LOGIN' | 'REGISTER';
  openAuthModal: (tab?: 'LOGIN' | 'REGISTER') => void;
  closeAuthModal: () => void;

  // Dealer access is derived from the verified server session (no client-side PIN).
  isDealerUnlocked: boolean;
  lockDealer: () => void;

  currentCustomer: Customer;
  setCurrentCustomer: (customer: Customer) => void;
  dealerProfile: DealerProfile;
  setDealerProfile: (profile: DealerProfile) => void;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStock: (id: string) => void;
  lowStockProducts: Product[];

  // Cart & Drawer State
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  // Orders
  orders: Order[];
  placeOrder: (details: {
    paymentMode: PaymentMode;
    notes?: string;
    upiReference?: string;
    upiProofNote?: string;
    bookedBy?: string;
    targetCustomer?: Customer;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  verifyPayment: (orderId: string, approved: boolean, note?: string) => void;
  fulfillOrderPartially: (orderId: string, fulfillmentMap: Record<string, number>, notes?: string) => void;

  // Customers & Ledger (Khata)
  customers: Customer[];
  ledgerEntries: LedgerEntry[];
  recordPayment: (details: {
    customerId: string;
    amount: number;
    paymentMode: SettlementMode;
    referenceNumber?: string;
    notes?: string;
  }) => void;
  getCustomerLedger: (customerId: string) => LedgerEntry[];
  getCustomerAging: (customerId: string) => DebtAgingSummary;

  // Analytics & AI Insights
  monthlyStats: MonthlyStats[];
  regionalData: RegionalInsight[];
  aiAnalysisText: string;
  isGeneratingAi: boolean;
  generateAiInsights: () => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('RETAILER');
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');

  // Auth Session State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const openAuthModal = (tab: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Dealer access mirrors the server-verified session. The real gate is server-side
  // (middleware + per-route checks); this flag only drives the UI.
  const isDealerUnlocked = currentUser?.role === 'DEALER';

  const [products, setProductsState] = useState<Product[]>(initialProducts);
  const [customers, setCustomersState] = useState<Customer[]>(initialCustomers);
  const [currentCustomer, setCurrentCustomerState] = useState<Customer>(initialCustomers[0]);
  const [orders, setOrdersState] = useState<Order[]>(initialOrders);
  const [ledgerEntries, setLedgerEntriesState] = useState<LedgerEntry[]>(initialLedgerEntries);
  const [dealerProfile, setDealerProfileState] = useState<DealerProfile>(initialDealerProfile);
  
  // Cart State & Drawer visibility
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Computed live from real orders/ledger/customers - see lib/analytics.ts. No hardcoded demo numbers.
  const monthlyStats = React.useMemo(() => computeMonthlyStats(orders, ledgerEntries), [orders, ledgerEntries]);
  const regionalData = React.useMemo(() => computeRegionalInsights(orders, customers), [orders, customers]);
  const [aiAnalysisText, setAiAnalysisText] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Persistence loader
  useEffect(() => {
    try {
      const savedAuthUser = localStorage.getItem('vyapar_auth_user');
      if (savedAuthUser) {
        try {
          const parsedUser: AuthUser = JSON.parse(savedAuthUser);
          setCurrentUser(parsedUser);
        } catch (e) {
          console.warn('Failed to parse saved user', e);
        }
      }

      const savedRole = localStorage.getItem('vyapar_role') as UserRole;
      if (savedRole) setRole(savedRole);

      const savedTheme = localStorage.getItem('vyapar_theme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      const savedLang = localStorage.getItem('vyapar_lang') as Language;
      if (savedLang) setLanguage(savedLang);

      // Legacy keys from older builds: purge sensitive data that must never sit in localStorage.
      ['vyapar_dealer_unlocked', 'vyapar_customers', 'vyapar_orders', 'vyapar_ledger', 'vyapar_dealer_profile'].forEach(
        (k) => localStorage.removeItem(k)
      );

      const savedProducts = localStorage.getItem('vyapar_products');
      if (savedProducts) {
        const parsed: Product[] = JSON.parse(savedProducts);
        const merged = parsed.map((p) => {
          const init = initialProducts.find((ip) => ip.id === p.id);
          return {
            ...p,
            tiers: p.tiers && p.tiers.length > 0 ? p.tiers : init?.tiers
          };
        });
        setProductsState(merged);
      }

      // Persisted Cart recovery
      const savedCart = localStorage.getItem('vyapar_cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) setCart(parsedCart);
        } catch (err) {
          console.error('Error parsing saved cart:', err);
        }
      }

      void syncFromDb();
    } catch (e) {
      console.error('Error loading stored state:', e);
    }
  }, []);

  // Loads everything the CURRENT SESSION is allowed to see. Sensitive data (customers, orders,
  // ledger) is kept in memory only - never in localStorage.
  const syncFromDb = async () => {
    try {
      const me = await fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null));
      const user: AuthUser | null = me?.user ?? null;

      if (!user) {
        setCurrentUser(null);
        localStorage.removeItem('vyapar_auth_user');
        setRole('RETAILER');
        localStorage.setItem('vyapar_role', 'RETAILER');
      } else {
        setCurrentUser(user);
        localStorage.setItem('vyapar_auth_user', JSON.stringify(user));
        // Never let a stale/edited localStorage role exceed what the server session grants.
        setRole((prev) =>
          (prev === 'DEALER' && user.role !== 'DEALER') ||
          (prev === 'SALES_REP' && user.role === 'RETAILER')
            ? user.role
            : prev
        );
      }

      const [prodRes, custRes, ordRes, ledRes, dealRes] = await Promise.all([
        fetch('/api/products').then((r) => (r.ok ? r.json() : null)),
        user ? fetch('/api/customers').then((r) => (r.ok ? r.json() : null)) : Promise.resolve(null),
        user ? fetch('/api/orders').then((r) => (r.ok ? r.json() : null)) : Promise.resolve(null),
        user ? fetch('/api/ledger').then((r) => (r.ok ? r.json() : null)) : Promise.resolve(null),
        fetch(user?.role === 'DEALER' ? '/api/dealer' : '/api/store-profile').then((r) => (r.ok ? r.json() : null))
      ]);

      if (Array.isArray(prodRes)) {
        setProductsState(prodRes);
        saveState('vyapar_products', prodRes);
      }
      if (!user) {
        setCustomersState([]);
        setOrdersState([]);
        setLedgerEntriesState([]);
      } else {
        if (Array.isArray(custRes)) {
          setCustomersState(custRes);
          if (custRes.length > 0) {
            const mine = user.customerId ? custRes.find((c: Customer) => c.id === user.customerId) : undefined;
            setCurrentCustomerState((prev) => mine || custRes.find((c: Customer) => c.id === prev.id) || custRes[0]);
          }
        }
        if (Array.isArray(ordRes)) setOrdersState(ordRes);
        if (Array.isArray(ledRes)) setLedgerEntriesState(ledRes);
      }
      if (dealRes && dealRes.businessName) {
        setDealerProfileState((prev) => ({ ...prev, ...dealRes }));
      }
    } catch (err) {
      console.warn('API sync failed:', err);
    }
  };

  // After a failed write, reload the truth from the server (drops optimistic changes it rejected).
  const syncOnFail = (r: Response) => {
    if (!r.ok) void syncFromDb();
  };

  const saveState = (key: string, data: any) => {
    // Sensitive business data is never written to localStorage.
    if (['vyapar_customers', 'vyapar_orders', 'vyapar_ledger', 'vyapar_dealer_profile'].includes(key)) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  // Theme Toggle
  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('vyapar_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Language Toggle
  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('vyapar_lang', nextLang);
  };

  // Translation helper
  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  // Auth Session Methods (Login, Register, Logout)
  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' };
      }

      const user: AuthUser = data.user;
      setCurrentUser(user);
      localStorage.setItem('vyapar_auth_user', JSON.stringify(user));

      // Synchronize role
      setRole(user.role);
      localStorage.setItem('vyapar_role', user.role);

      if (data.customer) {
        setCurrentCustomerState(data.customer);
        setCustomersState((prev) => {
          const exists = prev.find((c) => c.id === data.customer.id);
          if (!exists) return [...prev, data.customer];
          return prev.map((c) => (c.id === data.customer.id ? data.customer : c));
        });
      }

      setIsAuthModalOpen(false);
      void syncFromDb();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Network error during login' };
    }
  };

  const register = async (formData: RegisterFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      const user: AuthUser = data.user;
      setCurrentUser(user);
      localStorage.setItem('vyapar_auth_user', JSON.stringify(user));

      setRole('RETAILER');
      localStorage.setItem('vyapar_role', 'RETAILER');

      if (data.customer) {
        setCurrentCustomerState(data.customer);
        setCustomersState((prev) => [...prev, data.customer]);
      }

      setIsAuthModalOpen(false);
      void syncFromDb();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Network error during registration' };
    }
  };

  const logout = () => {
    // The session cookie is httpOnly, so it must be cleared by the server.
    void fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setCurrentUser(null);
    localStorage.removeItem('vyapar_auth_user');
    setRole('RETAILER');
    localStorage.setItem('vyapar_role', 'RETAILER');
    setCustomersState([]);
    setOrdersState([]);
    setLedgerEntriesState([]);
    clearCart();
  };

  const lockDealer = () => logout();

  // Product Operations (Optimistic UI + API Persistence)
  const addProduct = async (newProd: Omit<Product, 'id'>) => {
    const tempId = `prod-${Date.now()}`;
    const p: Product = {
      ...newProd,
      id: tempId
    };
    const updated = [p, ...products];
    setProductsState(updated);
    saveState('vyapar_products', updated);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      if (res.ok) {
        const saved = await res.json();
        const final = updated.map((item) => (item.id === tempId ? saved : item));
        setProductsState(final);
        saveState('vyapar_products', final);
      } else {
        syncOnFail(res);
      }
    } catch (err) {
      console.error('Error adding product to DB:', err);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProductsState(updated);
    saveState('vyapar_products', updated);

    try {
      const r = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      syncOnFail(r);
    } catch (err) {
      console.error('Error updating product in DB:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProductsState(updated);
    saveState('vyapar_products', updated);

    try {
      const r = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      syncOnFail(r);
    } catch (err) {
      console.error('Error deleting product from DB:', err);
    }
  };

  const toggleProductStock = async (id: string) => {
    const current = products.find((p) => p.id === id);
    if (!current) return;
    await updateProduct(id, { inStock: !current.inStock });
  };

  const lowStockProducts = products.filter((p) => p.stockQty < 150);

  // Cart Operations with localStorage synchronization & drawer opening
  const addToCart = (product: Product, quantity = product.moq) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...prev, { product, quantity }];
      }
      saveState('vyapar_cart', updated);
      return updated;
    });
    // Open the drawer automatically so user never misses their item!
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      saveState('vyapar_cart', updated);
      return updated;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      saveState('vyapar_cart', updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    saveState('vyapar_cart', []);
  };

  const cartTotal = cart.reduce((sum, item) => {
    const { unitPrice } = calculateItemPrice(item.product, item.quantity);
    return sum + unitPrice * item.quantity;
  }, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Order Placement & Fulfillment
  // The SERVER prices the order (tiers, MOQ, GST, discount), checks stock and credit, and
  // decides the customer from the session. We only send product ids + quantities, then adopt
  // whatever the server returns. Nothing is faked locally.
  const placeOrder = async ({
    paymentMode,
    notes,
    upiReference,
    upiProofNote,
    bookedBy,
    targetCustomer
  }: {
    paymentMode: PaymentMode;
    notes?: string;
    upiReference?: string;
    upiProofNote?: string;
    bookedBy?: string;
    targetCustomer?: Customer;
  }): Promise<Order> => {
    const activeCustomer = targetCustomer || currentCustomer;

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: activeCustomer?.id,
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        paymentMode,
        notes,
        upiReference,
        upiProofNote,
        bookedBy
      })
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) openAuthModal('LOGIN');
      throw new Error(data?.error || 'Could not place the order. Please try again.');
    }

    clearCart();
    await syncFromDb(); // refresh stock, credit balance, ledger and order list from the server
    return data as Order;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o));
    setOrdersState(updated);
    saveState('vyapar_orders', updated);

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: status })
    }).then(syncOnFail).catch((e) => console.warn('Failed to update order status in DB:', e));
  };

  const updatePaymentStatus = (orderId: string, status: PaymentStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, paymentStatus: status } : o));
    setOrdersState(updated);
    saveState('vyapar_orders', updated);

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: status })
    }).then(syncOnFail).catch((e) => console.warn('Failed to update payment status in DB:', e));
  };

  const verifyPayment = (orderId: string, approved: boolean, note?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const newPaymentStatus: PaymentStatus = approved ? 'PAID' : 'REJECTED';
    const verifiedAt = approved ? new Date().toISOString() : undefined;
    const rejectionReason = !approved ? note || 'Payment verification failed' : undefined;

    const updatedOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            paymentStatus: newPaymentStatus,
            verifiedAt,
            rejectionReason
          }
        : o
    );
    setOrdersState(updatedOrders);
    saveState('vyapar_orders', updatedOrders);

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentStatus: newPaymentStatus,
        verifiedAt: verifiedAt || null,
        rejectionReason: rejectionReason || null
      })
    }).then(syncOnFail).catch((e) => console.warn('Failed to verify payment in DB:', e));
  };

  const fulfillOrderPartially = (
    orderId: string,
    fulfillmentMap: Record<string, number>,
    notes?: string
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    let hasBackorder = false;
    const updatedItems = targetOrder.items.map((item) => {
      const dispatched = Math.min(item.quantity, Math.max(0, fulfillmentMap[item.productId] ?? item.quantity));
      const backordered = item.quantity - dispatched;
      if (backordered > 0) hasBackorder = true;
      return {
        ...item,
        dispatchedQuantity: dispatched,
        backorderedQuantity: backordered
      };
    });

    const newStatus: OrderStatus = hasBackorder ? 'PARTIALLY_DISPATCHED' : 'DISPATCHED';
    const challanNo = `DC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            items: updatedItems,
            orderStatus: newStatus,
            deliveryChallanNumber: challanNo,
            notes: notes ? `${o.notes ? o.notes + ' • ' : ''}${notes}` : o.notes
          }
        : o
    );

    setOrdersState(updatedOrders);
    saveState('vyapar_orders', updatedOrders);

    fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderStatus: newStatus,
        deliveryChallanNumber: challanNo,
        items: updatedItems
      })
    }).then(syncOnFail).catch((e) => console.warn('Failed to update dispatch in DB:', e));
  };

  const recordPayment = ({
    customerId,
    amount,
    paymentMode,
    referenceNumber,
    notes
  }: {
    customerId: string;
    amount: number;
    paymentMode: SettlementMode;
    referenceNumber?: string;
    notes?: string;
  }) => {
    const targetCust = customers.find((c) => c.id === customerId);
    if (!targetCust) return;

    const newBalance = Math.max(0, targetCust.outstandingDebt - amount);

    const newEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      customerId: targetCust.id,
      customerName: targetCust.name,
      businessName: targetCust.businessName,
      type: 'CREDIT_PAYMENT',
      amount,
      runningBalance: newBalance,
      paymentMode,
      referenceNumber: referenceNumber || `${paymentMode}-${Date.now().toString().slice(-6)}`,
      notes: notes || `Payment received via ${paymentMode}`,
      date: new Date().toISOString()
    };

    const updatedLedger = [newEntry, ...ledgerEntries];
    setLedgerEntriesState(updatedLedger);
    saveState('vyapar_ledger', updatedLedger);

    const updatedCustomers = customers.map((c) =>
      c.id === customerId ? { ...c, outstandingDebt: newBalance } : c
    );
    setCustomersState(updatedCustomers);
    if (currentCustomer.id === customerId) {
      setCurrentCustomerState({ ...currentCustomer, outstandingDebt: newBalance });
    }
    saveState('vyapar_customers', updatedCustomers);

    fetch('/api/ledger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        amount,
        paymentMode,
        referenceNumber: newEntry.referenceNumber,
        notes
      })
    }).then(syncOnFail).catch((e) => console.warn('Failed to record payment in DB:', e));
  };

  const getCustomerLedger = (customerId: string) => {
    return ledgerEntries.filter((e) => e.customerId === customerId);
  };

  const getCustomerAging = (customerId: string): DebtAgingSummary => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust || cust.outstandingDebt <= 0) {
      return { currentAmount: 0, dueSoonAmount: 0, overdueAmount: 0, hasOverdue: false };
    }

    const now = new Date().getTime();
    const custDebits = ledgerEntries
      .filter((e) => e.customerId === customerId && e.type === 'DEBIT_ORDER')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let remainingDebt = cust.outstandingDebt;
    let currentAmount = 0;
    let dueSoonAmount = 0;
    let overdueAmount = 0;

    for (const debit of custDebits) {
      if (remainingDebt <= 0) break;
      const allocated = Math.min(remainingDebt, debit.amount);
      const debitTime = new Date(debit.date).getTime();
      const diffDays = Math.floor((now - debitTime) / (1000 * 60 * 60 * 24));

      if (diffDays <= 15) {
        currentAmount += allocated;
      } else if (diffDays <= 30) {
        dueSoonAmount += allocated;
      } else {
        overdueAmount += allocated;
      }

      remainingDebt -= allocated;
    }

    if (remainingDebt > 0) {
      overdueAmount += remainingDebt;
    }

    return {
      currentAmount,
      dueSoonAmount,
      overdueAmount,
      hasOverdue: overdueAmount > 0
    };
  };

  // Builds a rule-based summary from real, already-loaded data (see lib/analytics.ts).
  // This is NOT a live model call - it's an on-device computed report, labelled as such in the UI.
  const generateAiInsights = async (): Promise<string> => {
    setIsGeneratingAi(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const totalOutstanding = customers.reduce((acc, c) => acc + c.outstandingDebt, 0);
    const totalCreditIssued = ledgerEntries.filter((e) => e.type === 'DEBIT_ORDER').reduce((s, e) => s + e.amount, 0);
    const analysis = buildInsightsSummary(monthlyStats, regionalData, totalOutstanding, totalCreditIssued);

    setAiAnalysisText(analysis);
    setIsGeneratingAi(false);
    return analysis;
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole: (r) => {
          setRole(r);
          saveState('vyapar_role', r);
        },
        theme,
        toggleTheme,
        language,
        toggleLanguage,
        t,
        // Auth Session
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        isDealerUnlocked,
        lockDealer,
        currentCustomer,
        setCurrentCustomer: (c) => {
          setCurrentCustomerState(c);
        },
        dealerProfile,
        setDealerProfile: setDealerProfileState,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStock,
        lowStockProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        isCartOpen,
        openCart,
        closeCart,
        orders,
        placeOrder,
        updateOrderStatus,
        updatePaymentStatus,
        verifyPayment,
        fulfillOrderPartially,
        customers,
        ledgerEntries,
        recordPayment,
        getCustomerLedger,
        getCustomerAging,
        monthlyStats,
        regionalData,
        aiAnalysisText,
        isGeneratingAi,
        generateAiInsights
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
