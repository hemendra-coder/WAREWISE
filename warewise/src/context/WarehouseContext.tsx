import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  WarehouseBin,
  Order,
  WarehouseException,
  DecisionRecommendation,
  WarehouseOperator,
  AuditLogEntry,
  OperationalMetrics,
  UserProfile,
  UserRole,
  OrderStatus,
  CustomerNavTab,
  CustomerAddress,
  CouponDiscount,
  CustomerReview,
  ProductQA,
  CheckoutStep,
  StockReceipt,
  StockAdjustment,
  InventoryTransaction,
  WarehouseAlert,
  SupportTicket,
  ReturnRMA,
  RefundRecord,
  PromotionCampaign,
  GiftCardRecord,
  LoyaltyAccount,
  SellerRecord,
  BusinessRule,
  FeatureFlag,
  SecuritySession,
  NotificationTemplate,
  CategorySchema,
  SimulationScenario,
  OfflineMoveItem,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_BINS,
  INITIAL_ORDERS,
  INITIAL_EXCEPTIONS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_OPERATORS,
  INITIAL_AUDIT_LOGS,
  INITIAL_METRICS,
  DEMO_USERS,
  INITIAL_STOCK_RECEIPTS,
  INITIAL_STOCK_ADJUSTMENTS,
  INITIAL_INVENTORY_TRANSACTIONS,
  INITIAL_WAREHOUSE_ALERTS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_RETURNS_RMA,
  INITIAL_REFUNDS,
  INITIAL_PROMOTIONS,
  INITIAL_GIFT_CARDS,
  INITIAL_LOYALTY_ACCOUNTS,
  INITIAL_SELLERS,
  INITIAL_BUSINESS_RULES,
  INITIAL_FEATURE_FLAGS,
  INITIAL_SECURITY_SESSIONS,
  INITIAL_NOTIFICATION_TEMPLATES,
  INITIAL_CATEGORY_SCHEMAS,
  INITIAL_SIMULATION_SCENARIOS,
} from '../data/mockData';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'ORDER' | 'PRICE_DROP' | 'SYSTEM' | 'DEAL';
}

export type AdminModuleKey =
  | '01_COMMAND'
  | '02_INVENTORY'
  | '03_ORDERS'
  | '04_ALLOCATION'
  | '05_PICKING'
  | '06_PACKING'
  | '07_QC'
  | '08_DISPATCH'
  | '09_EXCEPTIONS'
  | '10_ANALYTICS'
  | '11_COPILOT'
  | '12_USERS'
  | '13_PRODUCTS'
  | '14_BINS'
  | '15_AUDIT'
  | '16_ALERTS'
  | '17_REPORTS'
  | '18_COMMERCE_SUITE'
  | '19_CUSTOMERS'
  | '20_INTELLIGENCE_SIM'
  | '21_PLATFORM_SETTINGS';


export type ProductSortOption =
  | 'FEATURED'
  | 'PRICE_LOW_HIGH'
  | 'PRICE_HIGH_LOW'
  | 'RATING'
  | 'NEWEST';

interface WarehouseContextType {
  // State
  products: Product[];
  bins: WarehouseBin[];
  orders: Order[];
  exceptions: WarehouseException[];
  recommendations: DecisionRecommendation[];
  operators: WarehouseOperator[];
  auditLogs: AuditLogEntry[];
  metrics: OperationalMetrics;
  stockReceipts: StockReceipt[];
  stockAdjustments: StockAdjustment[];
  inventoryTransactions: InventoryTransaction[];
  warehouseAlerts: WarehouseAlert[];

  // Authentication & Session
  currentUser: UserProfile;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'LOGIN' | 'REGISTER' | 'FORGOT';
  openAuthModal: (tab?: 'LOGIN' | 'REGISTER' | 'FORGOT') => void;
  closeAuthModal: () => void;
  loginCustomer: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  registerCustomer: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logoutCustomer: () => void;
  updateCustomerProfile: (data: Partial<UserProfile>) => void;

  // Admin Security & Portal
  activePortal: 'CUSTOMER' | 'ADMIN';
  setActivePortal: (portal: 'CUSTOMER' | 'ADMIN') => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (loggedIn: boolean) => void;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => void;
  activeAdminModule: AdminModuleKey;
  setActiveAdminModule: (module: AdminModuleKey) => void;
  switchUser: (role: UserRole) => void;
  activeAdminRole: UserRole;
  setActiveAdminRole: (role: UserRole) => void;
  hasPermission: (moduleKey: AdminModuleKey) => boolean;

  // Operational Inventory & Warehouse Actions
  recordStockReceipt: (receipt: Omit<StockReceipt, 'id' | 'timestamp'>) => void;
  recordStockAdjustment: (adjustment: Omit<StockAdjustment, 'id' | 'timestamp'>) => void;
  approveOrder: (orderId: string, notes?: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => boolean;
  completePickItem: (orderId: string, sku: string, qty: number) => void;
  completePackOrder: (orderId: string, cartonType: string, weightKg: number) => void;
  dispatchOrder: (orderId: string, carrier: string, trackingNumber: string) => void;
  reportBenchException: (data: { orderId?: string; sku: string; type: string; quantity: number; notes: string; location?: string }) => void;
  logException: (exceptionData: Partial<WarehouseException>) => void;
  reallocateStaff: (dockOrZone: string, count: number) => void;
  updateBinOccupancy: (binId: string, newOccupancy: number) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;

  // Customer Navigation & Commerce State
  activeCustomerNavTab: CustomerNavTab;
  setActiveCustomerNavTab: (tab: CustomerNavTab) => void;
  customerSearchQuery: string;
  setCustomerSearchQuery: (query: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  productSortOption: ProductSortOption;
  setProductSortOption: (option: ProductSortOption) => void;
  priceFilterRange: [number, number];
  setPriceFilterRange: (range: [number, number]) => void;
  minRatingFilter: number;
  setMinRatingFilter: (rating: number) => void;
  inStockOnlyFilter: boolean;
  setInStockOnlyFilter: (val: boolean) => void;
  viewMode: 'GRID' | 'LIST';
  setViewMode: (mode: 'GRID' | 'LIST') => void;

  // Cart & Wishlist
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  wishlist: string[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;

  // Comparison
  comparisonList: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isComparisonOpen: boolean;
  setIsComparisonOpen: (open: boolean) => void;

  // Addresses & Coupons
  customerAddresses: CustomerAddress[];
  addCustomerAddress: (addr: Omit<CustomerAddress, 'id'>) => void;
  editCustomerAddress: (id: string, addr: Partial<CustomerAddress>) => void;
  deleteCustomerAddress: (id: string) => void;
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;

  availableCoupons: CouponDiscount[];
  appliedCoupon: CouponDiscount | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Modals & Drawers
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAiChatOpen: boolean;
  setIsAiChatOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  checkoutStep: CheckoutStep;
  setCheckoutStep: (step: CheckoutStep) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isVoiceSearchOpen: boolean;
  setIsVoiceSearchOpen: (open: boolean) => void;
  isImageSearchOpen: boolean;
  setIsImageSearchOpen: (open: boolean) => void;

  // Orders & Tracking
  latestPlacedOrder: Order | null;
  setLatestPlacedOrder: (order: Order | null) => void;
  placeCustomerOrder: (
    address: Order['shippingAddress'],
    shippingTier: 'STANDARD' | 'EXPRESS' | 'SAME_DAY',
    paymentMethod?: string,
    cardDetails?: { cardNumber: string; expiry: string; cvv: string; cardHolder: string }
  ) => Order;
  selectedTrackingOrderId: string | null;
  setSelectedTrackingOrderId: (id: string | null) => void;
  cancelCustomerOrder: (orderId: string, reason: string) => void;
  requestCustomerReturn: (orderId: string, sku: string, reason: string, type: 'REFUND' | 'EXCHANGE') => void;

  // Reviews & QA
  submitProductReview: (productId: string, review: Omit<CustomerReview, 'id' | 'date'>) => void;
  submitProductQuestion: (productId: string, question: string) => void;

  // Notifications
  notifications: CustomerNotificationItem[];
  unreadNotificationCount: number;
  markNotificationsRead: () => void;
  markAllNotificationsRead: () => void;

  // Selected details / Modals
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;

  // Operational Actions (For Admin)
  applyReallocation: (targetOrderId: string, donorOrderId: string, sku: string, qty: number) => void;
  advanceOrderStatus: (orderId: string, nextStatus?: OrderStatus) => void;
  reroutePicker: (exceptionId: string, operatorId: string, newBin: string) => void;
  reassignStaff: (operatorId: string, newRole: WarehouseOperator['role'], newZone: string) => void;
  runQCCheck: (orderId: string, pass: boolean, notes: string) => void;
  resolveException: (exceptionId: string, resolutionNote: string) => void;
  triggerReorder: (sku: string, qty: number) => void;
  applyRecommendation: (recId: string) => void;
  rejectRecommendation: (recId: string) => void;
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  // Domain Extension: Support, RMAs, Refunds
  supportTickets: SupportTicket[];
  returnRMAs: ReturnRMA[];
  refunds: RefundRecord[];
  replyToSupportTicket: (ticketId: string, message: string, sender?: 'AGENT' | 'AI_COPILOT') => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  approveRMA: (rmaId: string, notes?: string) => void;
  rejectRMA: (rmaId: string, notes?: string) => void;
  updateRMAStatus: (rmaId: string, status: ReturnRMA['status'], notes?: string) => void;
  processInstantRefund: (orderId: string, rmaId?: string, amount?: number, reason?: string) => Promise<{ success: boolean; refundRef: string }>;

  // Commerce & Platform Extension
  promotions: PromotionCampaign[];
  giftCards: GiftCardRecord[];
  loyaltyAccounts: LoyaltyAccount[];
  sellers: SellerRecord[];
  categorySchemas: CategorySchema[];
  savePromotion: (promo: PromotionCampaign) => void;
  deletePromotion: (id: string) => void;
  issueGiftCard: (card: Omit<GiftCardRecord, 'id' | 'createdAt' | 'redemptionHistory'>) => void;
  toggleGiftCardStatus: (id: string) => void;
  adjustLoyaltyPoints: (customerId: string, deltaPoints: number, reason: string) => void;
  updateSellerStatus: (sellerId: string, status: SellerRecord['status']) => void;
  saveCategorySchema: (schema: CategorySchema) => void;
  bulkUpdatePrices: (category: string, percentageChange: number) => void;
  bulkUpdateStock: (stockDeltas: Array<{ sku: string; delta: number; reason: string }>) => void;
  splitOrder: (orderId: string, splitSkus: string[]) => void;
  reorderInventoryItem: (sku: string, quantity: number) => void;

  // Platform & Governance Extension
  businessRules: BusinessRule[];
  featureFlags: FeatureFlag[];
  securitySessions: SecuritySession[];
  notificationTemplates: NotificationTemplate[];
  simulationScenarios: SimulationScenario[];
  updateBusinessRule: (ruleId: string, newValue: any) => void;
  toggleFeatureFlag: (flagId: string) => void;
  updateFeatureFlagRollout: (flagId: string, percentage: number) => void;
  terminateSecuritySession: (sessionId: string) => void;
  flagSecuritySession: (sessionId: string) => void;
  updateNotificationTemplate: (templateId: string, body: string, subject?: string) => void;
  rebuildSearchIndex: () => Promise<{ indexedCount: number; durationMs: number }>;

  // Scenario Walkthrough Helper
  heroStep: number;
  isHeroRunning: boolean;
  runHeroSimulationStep: (step: number) => void;
  resetSimulationData: () => void;

  // Network Connectivity Listener & Offline State Manager
  isOnline: boolean;
  toggleSimulatedNetwork: (forcedState?: boolean) => void;
  offlineQueue: OfflineMoveItem[];
  enqueueOfflineMove: (move: Omit<OfflineMoveItem, 'id' | 'timestamp' | 'status'>) => OfflineMoveItem;
  clearOfflineQueue: () => void;
  syncOfflineQueue: () => Promise<{ syncedCount: number }>;

  // Dark Mode Theme State
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DEFAULT_ADDRESSES: CustomerAddress[] = [
  {
    id: 'addr-01',
    name: 'Kishore Venkat',
    phone: '+91 98450 78901',
    street: 'Villa 42, Palm Meadows Boulevard, Whitefield',
    landmark: 'Near Forum Shantiniketan',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    type: 'HOME',
    isDefault: true,
  },
  {
    id: 'addr-02',
    name: 'AeroTech Systems Operations',
    phone: '+91 98801 23456',
    street: '7th Floor, AeroTech Tower, Outer Ring Road, Bellandur',
    landmark: 'Opposite Ecospace Tech Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    type: 'WORK',
    isDefault: false,
  },
  {
    id: 'addr-03',
    name: 'Robotics & Hardware Lab',
    phone: '+91 94480 55432',
    street: 'Bay 14, Peenya Industrial Complex Phase 2',
    landmark: 'Near Peenya Metro Station',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560058',
    type: 'WORK',
    isDefault: false,
  },
];

const DEFAULT_COUPONS: CouponDiscount[] = [
  {
    code: 'WELCOME500',
    discountPercent: 10,
    maxDiscount: 500,
    minOrderValue: 2500,
    description: 'Flat 10% off up to ₹500 on your customer order',
    expiryDays: 30,
  },
  {
    code: 'WAREWISEAI',
    discountPercent: 15,
    maxDiscount: 5000,
    minOrderValue: 10000,
    description: '15% instant discount on intelligent AI & edge hardware up to ₹5,000',
    expiryDays: 12,
  },
  {
    code: 'PRODEV2026',
    discountPercent: 10,
    maxDiscount: 12000,
    minOrderValue: 30000,
    description: '10% discount on workstation monitors, laptops & robotics kits',
    expiryDays: 20,
  },
  {
    code: 'AIRPRIORITY',
    discountPercent: 100,
    maxDiscount: 499,
    minOrderValue: 2000,
    description: 'Free Air Express Flight Wave upgrade (Save ₹499)',
    expiryDays: 5,
  },
];

const DEFAULT_NOTIFICATIONS: CustomerNotificationItem[] = [
  {
    id: 'notif-01',
    title: 'Order Status Update',
    message: 'Order ORD-WW-1042 has completed QC Check and is staged at BlueDart Air Express Sortation Bay 4.',
    timestamp: '10m ago',
    read: false,
    type: 'ORDER',
  },
  {
    id: 'notif-02',
    title: 'Smart Stock Reservation',
    message: 'Warehouse WH-METRO-01 confirmed 100% stock allocation for your expedited order.',
    timestamp: '45m ago',
    read: false,
    type: 'ORDER',
  },
  {
    id: 'notif-03',
    title: 'Price Drop Alert',
    message: 'VisionMatrix 34" Curved QD-OLED Master Monitor dropped by ₹15,000 in your saved wishlist.',
    timestamp: '2h ago',
    read: false,
    type: 'PRICE_DROP',
  },
];

const DEFAULT_CUSTOMER: UserProfile = {
  id: 'usr-cust-01',
  name: 'Kishore Venkat',
  email: 'srivenkatakishoren@gmail.com',
  phone: '+91 98450 78901',
  company: 'AeroTech Systems Pvt Ltd',
  role: 'CUSTOMER',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
};

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core Entities
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('warewise_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [bins, setBins] = useState<WarehouseBin[]>(INITIAL_BINS);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('warewise_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [exceptions, setExceptions] = useState<WarehouseException[]>(INITIAL_EXCEPTIONS);
  const [recommendations, setRecommendations] = useState<DecisionRecommendation[]>(INITIAL_RECOMMENDATIONS);
  const [operators, setOperators] = useState<WarehouseOperator[]>(INITIAL_OPERATORS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [metrics, setMetrics] = useState<OperationalMetrics>(INITIAL_METRICS);

  const [stockReceipts, setStockReceipts] = useState<StockReceipt[]>(() => {
    const saved = localStorage.getItem('warewise_stock_receipts');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_RECEIPTS;
  });

  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem('warewise_stock_adjustments');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ADJUSTMENTS;
  });

  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem('warewise_inventory_transactions');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY_TRANSACTIONS;
  });

  const [warehouseAlerts, setWarehouseAlerts] = useState<WarehouseAlert[]>(() => {
    const saved = localStorage.getItem('warewise_warehouse_alerts');
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSE_ALERTS;
  });

  // Admin Control Center Domain States
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [returnRMAs, setReturnRMAs] = useState<ReturnRMA[]>(INITIAL_RETURNS_RMA);
  const [refunds, setRefunds] = useState<RefundRecord[]>(INITIAL_REFUNDS);
  const [promotions, setPromotions] = useState<PromotionCampaign[]>(INITIAL_PROMOTIONS);
  const [giftCards, setGiftCards] = useState<GiftCardRecord[]>(INITIAL_GIFT_CARDS);
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<LoyaltyAccount[]>(INITIAL_LOYALTY_ACCOUNTS);
  const [sellers, setSellers] = useState<SellerRecord[]>(INITIAL_SELLERS);
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>(INITIAL_BUSINESS_RULES);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(INITIAL_FEATURE_FLAGS);
  const [securitySessions, setSecuritySessions] = useState<SecuritySession[]>(INITIAL_SECURITY_SESSIONS);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(INITIAL_NOTIFICATION_TEMPLATES);
  const [categorySchemas, setCategorySchemas] = useState<CategorySchema[]>(INITIAL_CATEGORY_SCHEMAS);
  const [simulationScenarios, setSimulationScenarios] = useState<SimulationScenario[]>(INITIAL_SIMULATION_SCENARIOS);

  const [activeAdminRole, setActiveAdminRole] = useState<UserRole>('SUPER_ADMIN');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('warewise_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOMER;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('warewise_auth_token') !== 'logged_out';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  // Admin Security State
  const [activePortal, setActivePortalState] = useState<'CUSTOMER' | 'ADMIN'>('ADMIN');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(true);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [activeAdminModule, setActiveAdminModule] = useState<AdminModuleKey>('01_COMMAND');

  // Customer Catalog State
  const [activeCustomerNavTab, setActiveCustomerNavTab] = useState<CustomerNavTab>('SHOP');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [productSortOption, setProductSortOption] = useState<ProductSortOption>('FEATURED');
  const [priceFilterRange, setPriceFilterRange] = useState<[number, number]>([0, 150000]);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [inStockOnlyFilter, setInStockOnlyFilter] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('warewise_cart');
    return saved ? JSON.parse(saved) : [
      { product: INITIAL_PRODUCTS[1], quantity: 1 }
    ];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('warewise_wishlist');
    return saved ? JSON.parse(saved) : ['prod-003', 'prod-007'];
  });
  const [comparisonList, setComparisonList] = useState<Product[]>([INITIAL_PRODUCTS[0], INITIAL_PRODUCTS[1]]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Address & Coupon State
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>(() => {
    const saved = localStorage.getItem('warewise_addresses');
    return saved ? JSON.parse(saved) : DEFAULT_ADDRESSES;
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-01');
  const [availableCoupons] = useState<CouponDiscount[]>(DEFAULT_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDiscount | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<CustomerNotificationItem[]>(DEFAULT_NOTIFICATIONS);

  // UI Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('ADDRESS');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);

  // Selected Detail States
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>('ORD-WW-1042');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('ORD-WW-1042');
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<Order | null>(null);

  // Scenario Walkthrough
  const [heroStep, setHeroStep] = useState<number>(0);
  const [isHeroRunning, setIsHeroRunning] = useState<boolean>(false);

  // Network Connectivity Listener & Offline State Manager
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const saved = localStorage.getItem('warewise_is_online');
    if (saved !== null) return saved === 'true';
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [offlineQueue, setOfflineQueue] = useState<OfflineMoveItem[]>(() => {
    const saved = localStorage.getItem('warewise_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('warewise_is_online', String(isOnline));
  }, [isOnline]);

  // Dark Mode System-Wide Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('warewise_theme');
    if (saved) return saved === 'dark';
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('warewise_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('warewise_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  useEffect(() => {
    localStorage.setItem('warewise_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulatedNetwork = (forcedState?: boolean) => {
    setIsOnline((prev) => (typeof forcedState === 'boolean' ? forcedState : !prev));
  };

  const enqueueOfflineMove = (move: Omit<OfflineMoveItem, 'id' | 'timestamp' | 'status'>) => {
    const newItem: OfflineMoveItem = {
      ...move,
      id: `OFFLINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      status: 'PENDING_SYNC',
    };
    setOfflineQueue((prev) => [newItem, ...prev]);
    return newItem;
  };

  const clearOfflineQueue = () => {
    setOfflineQueue([]);
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return { syncedCount: 0 };
    const count = offlineQueue.length;

    // Flush offline items to audit log
    offlineQueue.forEach((item) => {
      setAuditLogs((prev) => [
        {
          id: `LOG-OFFLINE-SYNC-${Date.now()}-${Math.floor(Math.random() * 100)}`,
          timestamp: new Date().toISOString(),
          user: item.operator || currentUser.name,
          role: currentUser.role,
          action: `OFFLINE_SYNC_${item.type}`,
          details: `[OFFLINE SYNCED] ${item.title}: ${item.details}`,
        },
        ...prev,
      ]);
    });

    setOfflineQueue([]);
    return { syncedCount: count };
  };

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('warewise_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('warewise_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('warewise_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('warewise_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('warewise_addresses', JSON.stringify(customerAddresses));
  }, [customerAddresses]);

  useEffect(() => {
    localStorage.setItem('warewise_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('warewise_stock_receipts', JSON.stringify(stockReceipts));
  }, [stockReceipts]);

  useEffect(() => {
    localStorage.setItem('warewise_stock_adjustments', JSON.stringify(stockAdjustments));
  }, [stockAdjustments]);

  useEffect(() => {
    localStorage.setItem('warewise_inventory_transactions', JSON.stringify(inventoryTransactions));
  }, [inventoryTransactions]);

  useEffect(() => {
    localStorage.setItem('warewise_warehouse_alerts', JSON.stringify(warehouseAlerts));
  }, [warehouseAlerts]);

  // Derived Calculations
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart]
  );
  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Secure Portal Setter with Authorization Guard
  const setActivePortal = (portal: 'CUSTOMER' | 'ADMIN') => {
    if (portal === 'ADMIN') {
      if (!isAdminLoggedIn && currentUser.role === 'CUSTOMER') {
        // Normal customer is not authorized -> open Admin Login Gate
        setIsAdminLoginModalOpen(true);
        return;
      }
    }
    setActivePortalState(portal);
  };

  // Auth Modal Helpers
  const openAuthModal = (tab: 'LOGIN' | 'REGISTER' | 'FORGOT' = 'LOGIN') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginCustomer = async (email: string, _password?: string): Promise<{ success: boolean; message: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    const customerUser: UserProfile = {
      id: `usr-cust-${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      phone: '+91 98450 78901',
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };

    setCurrentUser(customerUser);
    setIsAuthenticated(true);
    setActivePortalState('CUSTOMER');
    localStorage.setItem('warewise_auth_token', 'active_session');
    closeAuthModal();
    return { success: true, message: `Welcome back, ${customerUser.name}!` };
  };

  const registerCustomer = async (
    name: string,
    email: string,
    phone: string,
    _password?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!name.trim()) return { success: false, message: 'Please enter your full name.' };
    if (!email.includes('@')) return { success: false, message: 'Please enter a valid email address.' };
    if (phone.length < 10) return { success: false, message: 'Please enter a valid phone number.' };

    const newUser: UserProfile = {
      id: `usr-cust-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setActivePortalState('CUSTOMER');
    localStorage.setItem('warewise_auth_token', 'active_session');
    closeAuthModal();
    return { success: true, message: `Account created successfully! Welcome to WareWise, ${newUser.name}.` };
  };

  const logoutCustomer = () => {
    setIsAuthenticated(false);
    localStorage.setItem('warewise_auth_token', 'logged_out');
    // Set fallback guest profile
    setCurrentUser({
      id: 'usr-guest',
      name: 'Guest Customer',
      email: 'guest@warewise.ai',
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });
  };

  const updateCustomerProfile = (data: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  // Admin Portal Login & Security
  const loginAdmin = async (email: string, _password: string): Promise<{ success: boolean; message: string }> => {
    const adminUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.role !== 'CUSTOMER'
    ) || DEMO_USERS[0];

    if (!email.trim()) {
      return { success: false, message: 'Please enter administrator identifier.' };
    }

    setCurrentUser(adminUser);
    setIsAdminLoggedIn(true);
    setIsAdminLoginModalOpen(false);
    setActivePortalState('ADMIN');
    return { success: true, message: `Authorized: Signed in as ${adminUser.name} (${adminUser.role})` };
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setActivePortalState('ADMIN');
  };

  const switchUser = (role: UserRole) => {
    const found = DEMO_USERS.find((u) => u.role === role) || {
      id: `usr-${role.toLowerCase()}`,
      name: role.replace('_', ' '),
      email: `${role.toLowerCase()}@warewise.ai`,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };
    setCurrentUser(found);
    if (role === 'CUSTOMER') {
      setIsAdminLoggedIn(false);
      setActivePortalState('CUSTOMER');
    } else {
      setIsAdminLoggedIn(true);
      setActivePortalState('ADMIN');
    }
  };

  // Audit Logs
  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: 'Just now',
      ...entry,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Cart & Wishlist Handlers
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Comparison Handlers
  const addToComparison = (product: Product) => {
    setComparisonList((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      if (prev.length >= 4) {
        return [...prev.slice(1), product];
      }
      return [...prev, product];
    });
    setIsComparisonOpen(true);
  };

  const removeFromComparison = (productId: string) => {
    setComparisonList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearComparison = () => {
    setComparisonList([]);
    setIsComparisonOpen(false);
  };

  // Address Handlers
  const addCustomerAddress = (addr: Omit<CustomerAddress, 'id'>) => {
    const newAddr: CustomerAddress = {
      id: `addr-${Date.now()}`,
      ...addr,
    };
    if (newAddr.isDefault) {
      setCustomerAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
      );
    } else {
      setCustomerAddresses((prev) => [...prev, newAddr]);
    }
    setSelectedAddressId(newAddr.id);
  };

  const editCustomerAddress = (id: string, addrUpdate: Partial<CustomerAddress>) => {
    setCustomerAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...addrUpdate } : a))
    );
  };

  const deleteCustomerAddress = (id: string) => {
    setCustomerAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddressId === id && customerAddresses.length > 1) {
      const remaining = customerAddresses.filter((a) => a.id !== id);
      setSelectedAddressId(remaining[0]?.id || '');
    }
  };

  // Coupon Handlers
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const found = availableCoupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );
    if (!found) {
      return { success: false, message: `Coupon "${code}" is invalid or expired.` };
    }
    if (cartSubtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Coupon "${found.code}" requires minimum cart subtotal of ₹${found.minOrderValue.toLocaleString()}.`,
      };
    }
    setAppliedCoupon(found);
    return {
      success: true,
      message: `Coupon "${found.code}" applied! You save up to ₹${found.maxDiscount.toLocaleString()}.`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Customer Order Cancellation & RMA Returns
  const cancelCustomerOrder = (orderId: string, reason: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'CANCELLED',
            aiExplanation: `Order cancelled by customer. Reason: ${reason}. Full refund of ₹${o.totalAmount.toLocaleString()} initiated.`,
            fulfillmentTimeline: [
              ...o.fulfillmentTimeline,
              {
                id: `tl-cancel-${Date.now()}`,
                status: 'CANCELLED',
                title: 'Order Cancelled by Customer',
                description: `Reason: ${reason}. Refund initiated to source payment method.`,
                timestamp: 'Just now',
                actor: 'Customer Support Bot',
              },
            ],
          };
        }
        return o;
      })
    );

    // Restore stock to catalog
    setProducts((prev) =>
      prev.map((p) => {
        const item = target.items.find((i) => i.productId === p.id);
        if (item) {
          return {
            ...p,
            availableStock: p.availableStock + item.quantity,
            reservedStock: Math.max(0, p.reservedStock - item.quantity),
          };
        }
        return p;
      })
    );

    addAuditLog({
      actor: `${currentUser.name} (Customer)`,
      action: `Cancelled Order ${orderId}`,
      details: `Reason: ${reason}. Stock returned to inventory.`,
      category: 'COMMERCE',
      aiAssisted: false,
    });
  };

  const requestCustomerReturn = (
    orderId: string,
    sku: string,
    reason: string,
    type: 'REFUND' | 'EXCHANGE'
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            fulfillmentTimeline: [
              ...o.fulfillmentTimeline,
              {
                id: `tl-return-${Date.now()}`,
                status: o.status,
                title: `${type === 'REFUND' ? 'Return' : 'Exchange'} Requested for ${sku}`,
                description: `Reason: ${reason}. Reverse logistics courier pickup scheduled.`,
                timestamp: 'Just now',
                actor: 'Reverse Logistics Node',
              },
            ],
          };
        }
        return o;
      })
    );

    const newException: WarehouseException = {
      id: `EXC-RMA-${Date.now().toString().slice(-4)}`,
      type: 'DAMAGED_ITEM',
      orderId,
      sku,
      status: 'OPEN',
      severity: 'MEDIUM',
      timestamp: 'Just now',
      rootCause: `Customer return request: ${reason}`,
      recommendedAction: `Inspect returned parcel at Reverse QC Dock Bay 2 for SKU ${sku}`,
    };
    setExceptions((prev) => [newException, ...prev]);

    addAuditLog({
      actor: `${currentUser.name} (Customer)`,
      action: `Requested ${type} for Order ${orderId}`,
      details: `SKU: ${sku}, Reason: ${reason}`,
      category: 'EXCEPTION',
      aiAssisted: true,
    });
  };

  // Product Reviews & QA
  const submitProductReview = (
    productId: string,
    review: Omit<CustomerReview, 'id' | 'date'>
  ) => {
    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      date: 'Today',
      ...review,
    };
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedReviews = [newReview, ...(p.reviews || [])];
          const newAvgRating = Number(
            (
              updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
              updatedReviews.length
            ).toFixed(1)
          );
          return {
            ...p,
            reviews: updatedReviews,
            reviewsCount: p.reviewsCount + 1,
            rating: newAvgRating,
          };
        }
        return p;
      })
    );
  };

  const submitProductQuestion = (productId: string, question: string) => {
    const newQA: ProductQA = {
      id: `qa-${Date.now()}`,
      question,
      askedBy: currentUser.name || 'Verified Customer',
      date: 'Today',
      answer:
        'Thank you for your question! WareWise technical engineers have verified the specifications.',
      answeredBy: 'WareWise Hardware Specialist',
      isAiVerified: true,
    };
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            qaList: [newQA, ...(p.qaList || [])],
          };
        }
        return p;
      })
    );
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Customer Places Order with Clear Logical Breakdown
  const placeCustomerOrder = (
    address: Order['shippingAddress'],
    shippingTier: 'STANDARD' | 'EXPRESS' | 'SAME_DAY',
    paymentMethod = 'UPI (Instant)',
    _cardDetails?: { cardNumber: string; expiry: string; cvv: string; cardHolder: string }
  ): Order => {
    const orderId = `ORD-WW-${Math.floor(1000 + Math.random() * 9000)}`;
    const items = cart.map((item) => ({
      productId: item.product.id,
      sku: item.product.sku,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      allocatedQty: item.quantity,
      binLocation: item.product.binLocation,
      image: item.product.image,
    }));

    const rawSubtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const discountAmount = appliedCoupon
      ? Math.min(appliedCoupon.maxDiscount, Math.round((rawSubtotal * appliedCoupon.discountPercent) / 100))
      : 0;
    const shippingFee = shippingTier === 'SAME_DAY' ? 799 : shippingTier === 'EXPRESS' ? 499 : 0;
    const taxableSubtotal = Math.max(0, rawSubtotal - discountAmount);
    const taxAmount = Math.round(taxableSubtotal * 0.18); // 18% GST standard
    const totalAmount = taxableSubtotal + shippingFee + taxAmount;

    const newOrder: Order = {
      id: orderId,
      customerName: currentUser.name || address.name || 'Valued Customer',
      customerEmail: currentUser.email || 'customer@warewise.ai',
      customerTier: 'PRO_TIER',
      items,
      totalAmount,
      subtotalAmount: rawSubtotal,
      discountAmount,
      shippingFee,
      taxAmount,
      paymentMethod,
      priorityScore: shippingTier === 'SAME_DAY' ? 95 : shippingTier === 'EXPRESS' ? 88 : 65,
      priorityTier: shippingTier === 'SAME_DAY' ? 'CRITICAL' : shippingTier === 'EXPRESS' ? 'HIGH' : 'MEDIUM',
      priorityFactors: [
        {
          name: 'Shipping Velocity',
          weight: 40,
          score: shippingTier === 'SAME_DAY' ? 98 : shippingTier === 'EXPRESS' ? 90 : 60,
          reason: `${shippingTier} shipping option selected with ${paymentMethod}`,
        },
        {
          name: 'Inventory Health',
          weight: 30,
          score: 95,
          reason: 'All items verified physically in stock at Metro Hub',
        },
        {
          name: 'Order Value',
          weight: 30,
          score: 80,
          reason: `Total ₹${totalAmount.toLocaleString()}`,
        },
      ],
      status: 'CREATED',
      allocationStatus: 'FULLY_ALLOCATED',
      slaDeadline: new Date(
        Date.now() + (shippingTier === 'SAME_DAY' ? 8 : shippingTier === 'EXPRESS' ? 24 : 48) * 3600 * 1000
      ).toISOString(),
      createdAt: new Date().toISOString(),
      fulfillmentTimeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'CREATED',
          title: 'Order Placed & Payment Confirmed',
          description: `Payment authorized via ${paymentMethod}. Order sent to WH-METRO-01 queue.`,
          timestamp: 'Just now',
          actor: 'Customer Checkout System',
        },
      ],
      aiExplanation: 'Order verified against active physical bin inventory. Allocation confirmed.',
      shippingAddress: address,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLatestPlacedOrder(newOrder);
    setSelectedTrackingOrderId(orderId);
    clearCart();
    setAppliedCoupon(null);

    // Deduct available stock
    setProducts((prev) =>
      prev.map((p) => {
        const matchingItem = items.find((i) => i.productId === p.id);
        if (matchingItem) {
          return {
            ...p,
            availableStock: Math.max(0, p.availableStock - matchingItem.quantity),
            reservedStock: p.reservedStock + matchingItem.quantity,
          };
        }
        return p;
      })
    );

    setMetrics((prev) => ({
      ...prev,
      totalOrdersToday: prev.totalOrdersToday + 1,
    }));

    addAuditLog({
      actor: `${currentUser.name} (Customer)`,
      action: `Placed Order ${orderId}`,
      details: `${items.length} items totaling ₹${totalAmount.toLocaleString()} via ${shippingTier}`,
      category: 'COMMERCE',
      aiAssisted: false,
    });

    return newOrder;
  };

  // Operational Actions for Admin
  const applyReallocation = (
    targetOrderId: string,
    donorOrderId: string,
    sku: string,
    qty: number
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === targetOrderId) {
          const updatedItems = order.items.map((item) =>
            item.sku === sku ? { ...item, allocatedQty: item.quantity } : item
          );
          return {
            ...order,
            items: updatedItems,
            allocationStatus: 'FULLY_ALLOCATED',
            status: 'ALLOCATED',
            donorOrderId,
            reallocatedQty: qty,
            aiExplanation: `REALLOCATION APPLIED: Acquired ${qty} units of ${sku} from donor order #${donorOrderId}. Order is now 100% allocated.`,
            fulfillmentTimeline: [
              ...order.fulfillmentTimeline,
              {
                id: `tl-realloc-${Date.now()}`,
                status: 'ALLOCATED',
                title: `Autonomous Reallocation: +${qty} Units`,
                description: `Acquired 3 units from donor order #${donorOrderId}. Order #1042 is now 100% allocated.`,
                timestamp: 'Just now',
                actor: 'Autonomous Allocation Engine',
                isAiDriven: true,
              },
            ],
          };
        }
        if (order.id === donorOrderId) {
          return {
            ...order,
            allocationStatus: 'PARTIAL',
            aiExplanation: `DONOR PARTICIPATION: Transferred ${qty} reserved units to Order #${targetOrderId}. Donor order will be replenished via incoming Hub shipment in 8 hours before SLA deadline.`,
            fulfillmentTimeline: [
              ...order.fulfillmentTimeline,
              {
                id: `tl-donor-${Date.now()}`,
                status: 'ALLOCATED',
                title: `Reallocation Donor Transfer (${qty} Units)`,
                description: `Transferred ${qty} units to protect high-SLA Order #${targetOrderId}.`,
                timestamp: 'Just now',
                actor: 'Autonomous Allocation Engine',
                isAiDriven: true,
              },
            ],
          };
        }
        return order;
      })
    );

    setRecommendations((prev) =>
      prev.map((r) =>
        r.id === 'REC-NEXT-01' ? { ...r, status: 'APPLIED' } : r
      )
    );

    addAuditLog({
      actor: 'Autonomous Allocation Engine',
      action: `Smart Reallocation Executed: ${qty}x ${sku}`,
      details: `Transferred ${qty} reserved units from ${donorOrderId} to ${targetOrderId}. Protected SLA with 98.4% confidence.`,
      category: 'ALLOCATION',
      aiAssisted: true,
      beforeState: `${targetOrderId} PARTIAL (7/10), ${donorOrderId} (3/3)`,
      afterState: `${targetOrderId} FULLY ALLOCATED (10/10), ${donorOrderId} (0/3 - Replenishment Scheduled)`,
    });
  };

  const advanceOrderStatus = (orderId: string, nextStatus?: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'CREATED',
      'PRIORITIZED',
      'ALLOCATED',
      'PICKING',
      'PACKING',
      'QC_CHECK',
      'READY_FOR_DISPATCH',
      'DISPATCHED',
      'IN_TRANSIT',
      'DELIVERED',
    ];

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const currentIndex = statusOrder.indexOf(order.status);
          const targetStatus = nextStatus || (currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : order.status);

          const statusTitles: Record<OrderStatus, string> = {
            CREATED: 'Order Received & Locked',
            PENDING_APPROVAL: 'Pending Operational Approval',
            APPROVED: 'Order Approved for Fulfillment',
            PRIORITIZED: 'Priority Score Computed',
            ALLOCATED: 'Bin Inventory Allocated',
            PICKING: 'Picker Dispatched to Bin',
            PICKED: 'Items Picked from Staging Bins',
            PACKING: 'Items Consolidated in Packing Station',
            PACKED: 'Carton Sealed & Barcode Printed',
            QC_CHECK: 'Optical Weight & Barcode QC Passed',
            READY_FOR_DISPATCH: 'Consignment Sealed for Dispatch',
            DISPATCHED: 'Loaded into Flight Sortation Bay',
            IN_TRANSIT: 'Out for Delivery with BlueDart',
            DELIVERED: 'Delivered & Signed',
            CANCELLED: 'Order Cancelled',
          };

          const newTimelineEvent = {
            id: `tl-adv-${Date.now()}`,
            status: targetStatus,
            title: statusTitles[targetStatus] || `Status updated to ${targetStatus}`,
            description: `Order progressed to ${targetStatus} stage in warehouse flow.`,
            timestamp: 'Just now',
            actor: currentUser.name || 'Warehouse Operations System',
            isAiDriven: false,
          };

          return {
            ...order,
            status: targetStatus,
            fulfillmentTimeline: [...order.fulfillmentTimeline, newTimelineEvent],
          };
        }
        return order;
      })
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Advanced Order ${orderId}`,
      details: `Status updated to ${nextStatus || 'next sequential stage'}.`,
      category: 'COMMERCE',
      aiAssisted: false,
    });
  };

  const reroutePicker = (exceptionId: string, operatorId: string, newBin: string) => {
    setExceptions((prev) =>
      prev.map((exc) =>
        exc.id === exceptionId
          ? {
              ...exc,
              status: 'RESOLVED',
              resolvedAt: 'Just now',
              resolutionDetails: `Rerouted picker ${operatorId} to alternate bin ${newBin}. Shortage bypassed.`,
            }
          : exc
      )
    );

    setOperators((prev) =>
      prev.map((op) =>
        op.id === operatorId
          ? {
              ...op,
              activeTask: `Rerouted picking at ${newBin}`,
              status: 'ASSIGNED',
            }
          : op
      )
    );

    addAuditLog({
      actor: 'Autonomous Route Engine',
      action: `Picker Rerouted: ${operatorId} -> ${newBin}`,
      details: `Resolved Exception ${exceptionId}. Pick sequence resumed with zero delay.`,
      category: 'EXCEPTION',
      aiAssisted: true,
    });
  };

  const reassignStaff = (operatorId: string, newRole: WarehouseOperator['role'], newZone: string) => {
    setOperators((prev) =>
      prev.map((op) =>
        op.id === operatorId
          ? {
              ...op,
              role: newRole,
              currentZone: newZone,
              status: 'REALLOCATED',
              activeTask: `Dynamic support at ${newZone}`,
            }
          : op
      )
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Staff Reallocated: ${operatorId}`,
      details: `Assigned new role ${newRole} in ${newZone} to relieve queue congestion.`,
      category: 'DISPATCH',
      aiAssisted: true,
    });
  };

  const runQCCheck = (orderId: string, pass: boolean, notes: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const nextStatus = pass ? 'READY_FOR_DISPATCH' : 'QC_CHECK';
          return {
            ...order,
            qcStatus: pass ? 'PASS' : 'FAIL',
            qcNotes: notes,
            status: nextStatus,
            fulfillmentTimeline: [
              ...order.fulfillmentTimeline,
              {
                id: `tl-qc-${Date.now()}`,
                status: nextStatus,
                title: pass ? 'Quality Control Inspection Passed' : 'QC Flagged for Repacking',
                description: notes,
                timestamp: 'Just now',
                actor: currentUser.name || 'QC Inspector',
              },
            ],
          };
        }
        return order;
      })
    );

    addAuditLog({
      actor: currentUser.name,
      action: `QC Inspection: Order ${orderId}`,
      details: `Result: ${pass ? 'PASS' : 'FAIL'}. Notes: ${notes}`,
      category: 'COMMERCE',
      aiAssisted: false,
    });
  };

  const resolveException = (exceptionId: string, resolutionNote: string) => {
    setExceptions((prev) =>
      prev.map((exc) =>
        exc.id === exceptionId
          ? {
              ...exc,
              status: 'RESOLVED',
              resolvedAt: 'Just now',
              resolutionDetails: resolutionNote,
            }
          : exc
      )
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Resolved Exception ${exceptionId}`,
      details: resolutionNote,
      category: 'EXCEPTION',
      aiAssisted: false,
    });
  };

  const triggerReorder = (sku: string, qty: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === sku
          ? {
              ...p,
              incomingStock: p.incomingStock + qty,
              health: 'HEALTHY',
            }
          : p
      )
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Purchase Order Placed: ${qty}x ${sku}`,
      details: `Automated replenishment dispatched to supplier. Lead time: 2 days.`,
      category: 'INVENTORY',
      aiAssisted: true,
    });
  };

  const applyRecommendation = (recId: string) => {
    const rec = recommendations.find((r) => r.id === recId);
    if (!rec) return;

    if (rec.category === 'ALLOCATION_PROTECTION') {
      applyReallocation('ORD-WW-1042', 'ORD-WW-1047', 'SKU-NC-900', 3);
    } else if (rec.category === 'STAFF_DISPATCH_INTERVENTION') {
      reassignStaff('OP-004', 'DISPATCH_AGENT', 'Dock 03 Sortation Bay');
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, status: 'APPLIED' } : r))
      );
    } else {
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, status: 'APPLIED' } : r))
      );
    }
  };

  const rejectRecommendation = (recId: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: 'REJECTED' } : r))
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Rejected Recommendation ${recId}`,
      details: `Operator overrode automated copilot proposal.`,
      category: 'ALLOCATION',
      aiAssisted: false,
    });
  };

  const hasPermission = (moduleKey: AdminModuleKey): boolean => {
    if (activeAdminRole === 'SUPER_ADMIN') {
      return true;
    }
    if (activeAdminRole === 'WAREHOUSE_ADMIN' || activeAdminRole === 'WAREHOUSE_MANAGER') {
      // Store Manager has access to operational modules but NOT platform settings or user/staff access configuration
      return moduleKey !== '12_USERS' && moduleKey !== '21_PLATFORM_SETTINGS';
    }
    switch (activeAdminRole) {
      case 'INVENTORY_MANAGER':
        return ['01_COMMAND', '02_INVENTORY', '04_ALLOCATION', '11_COPILOT', '13_PRODUCTS', '14_BINS', '15_AUDIT', '16_ALERTS', '17_REPORTS'].includes(moduleKey);
      case 'ORDER_MANAGER':
        return ['01_COMMAND', '03_ORDERS', '04_ALLOCATION', '09_EXCEPTIONS', '10_ANALYTICS', '11_COPILOT', '14_BINS', '16_ALERTS', '17_REPORTS', '19_CUSTOMERS'].includes(moduleKey);
      case 'PICKER':
        return ['05_PICKING', '03_ORDERS', '09_EXCEPTIONS', '14_BINS', '16_ALERTS'].includes(moduleKey);
      case 'PACKER':
        return ['06_PACKING', '07_QC', '09_EXCEPTIONS', '16_ALERTS'].includes(moduleKey);
      case 'DISPATCHER':
      case 'DISPATCH_OPERATOR':
        return ['08_DISPATCH', '03_ORDERS', '09_EXCEPTIONS', '16_ALERTS'].includes(moduleKey);
      case 'FULFILLMENT_OPERATOR':
        return ['05_PICKING', '06_PACKING', '07_QC', '08_DISPATCH', '09_EXCEPTIONS'].includes(moduleKey);
      case 'OFFICIAL':
        return ['01_COMMAND', '03_ORDERS', '10_ANALYTICS', '11_COPILOT', '15_AUDIT', '16_ALERTS', '17_REPORTS', '18_COMMERCE_SUITE', '19_CUSTOMERS'].includes(moduleKey);
      default:
        return ['01_COMMAND', '03_ORDERS'].includes(moduleKey);
    }
  };

  const recordStockReceipt = (receiptData: Omit<StockReceipt, 'id' | 'timestamp'>) => {
    const id = `rcp-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newReceipt: StockReceipt = {
      ...receiptData,
      id,
      timestamp,
    };

    setStockReceipts((prev) => [newReceipt, ...prev]);

    // Update Product Stock
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === receiptData.sku || p.id === receiptData.productId) {
          const newAvail = p.availableStock + receiptData.quantity;
          const newIncoming = Math.max(0, p.incomingStock - receiptData.quantity);
          const newHealth = newAvail > p.reorderThreshold ? 'HEALTHY' : newAvail > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK';
          return {
            ...p,
            availableStock: newAvail,
            incomingStock: newIncoming,
            health: newHealth,
          };
        }
        return p;
      })
    );

    // Update Bin Qty
    setBins((prev) =>
      prev.map((b) => {
        if (b.aisle + '-' + b.shelf + '-' + b.level === receiptData.binLocation || b.id === receiptData.binLocation) {
          return {
            ...b,
            currentQty: b.currentQty + receiptData.quantity,
            status: 'OPTIMAL',
          };
        }
        return b;
      })
    );

    // Record Transaction
    const targetProduct = products.find((p) => p.sku === receiptData.sku || p.id === receiptData.productId);
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      productId: targetProduct ? targetProduct.id : receiptData.productId,
      sku: receiptData.sku,
      productName: receiptData.productName,
      type: 'STOCK_RECEIVED',
      quantityChange: receiptData.quantity,
      physicalStockAfter: (targetProduct ? targetProduct.availableStock + targetProduct.reservedStock + targetProduct.damagedStock : 0) + receiptData.quantity,
      availableStockAfter: (targetProduct ? targetProduct.availableStock : 0) + receiptData.quantity,
      referenceId: receiptData.referenceNumber,
      operator: receiptData.operator || currentUser.name,
      timestamp,
      notes: `Condition: ${receiptData.condition || 'PRISTINE'}, Staged at: ${receiptData.binLocation}`,
    };
    setInventoryTransactions((prev) => [newTx, ...prev]);

    // Add Audit Log
    addAuditLog({
      actor: receiptData.operator || currentUser.name,
      action: `Inward Stock Received: +${receiptData.quantity}x ${receiptData.sku}`,
      details: `Supplier: ${receiptData.supplier}, Ref: ${receiptData.referenceNumber}, Bin: ${receiptData.binLocation}`,
      category: 'INVENTORY',
      aiAssisted: false,
    });

    // Create Alert
    setWarehouseAlerts((prev) => [
      {
        id: `alt-${Date.now()}`,
        type: 'NEW_STOCK_RECEIVED',
        severity: 'INFO',
        title: `Stock Inward: ${receiptData.sku} (+${receiptData.quantity})`,
        message: `Successfully received and verified at Bin ${receiptData.binLocation} from ${receiptData.supplier}.`,
        timestamp: 'Just now',
        relatedEntityId: receiptData.sku,
        status: 'UNREAD',
        suggestedAction: 'View updated inventory balance',
        actionModuleKey: '02_INVENTORY',
      },
      ...prev,
    ]);
  };

  const recordStockAdjustment = (adjustmentData: Omit<StockAdjustment, 'id' | 'timestamp'>) => {
    const id = `adj-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newAdj: StockAdjustment = {
      ...adjustmentData,
      id,
      timestamp,
    };
    setStockAdjustments((prev) => [newAdj, ...prev]);

    // Update Product Stock
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === adjustmentData.sku || p.id === adjustmentData.productId) {
          let newAvail = p.availableStock;
          let newDamaged = p.damagedStock;
          const qty = adjustmentData.adjustmentQty;

          if (adjustmentData.reason === 'DAMAGED') {
            newDamaged = newDamaged + Math.abs(qty);
            newAvail = Math.max(0, newAvail - Math.abs(qty));
          } else if (adjustmentData.reason === 'MISSING') {
            newAvail = Math.max(0, newAvail - Math.abs(qty));
          } else {
            newAvail = Math.max(0, newAvail + qty);
          }

          let health = p.health;
          if (newAvail <= 0) health = 'OUT_OF_STOCK';
          else if (newAvail <= p.safetyStock) health = 'CRITICAL';
          else if (newAvail <= p.reorderThreshold) health = 'LOW_STOCK';
          else health = 'HEALTHY';

          return {
            ...p,
            availableStock: newAvail,
            damagedStock: newDamaged,
            health,
          };
        }
        return p;
      })
    );

    const targetProduct = products.find((p) => p.sku === adjustmentData.sku || p.id === adjustmentData.productId);
    const txType =
      adjustmentData.reason === 'DAMAGED'
        ? 'DAMAGED'
        : adjustmentData.reason === 'MISSING'
        ? 'MISSING'
        : 'MANUAL_ADJUSTMENT';

    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      productId: targetProduct ? targetProduct.id : adjustmentData.productId,
      sku: adjustmentData.sku,
      productName: adjustmentData.productName,
      type: txType,
      quantityChange: adjustmentData.adjustmentQty,
      physicalStockAfter: targetProduct ? targetProduct.availableStock + targetProduct.reservedStock + targetProduct.damagedStock + adjustmentData.adjustmentQty : 0,
      availableStockAfter: targetProduct ? Math.max(0, targetProduct.availableStock + adjustmentData.adjustmentQty) : 0,
      referenceId: id,
      operator: adjustmentData.operator || currentUser.name,
      timestamp,
      notes: `${adjustmentData.reason}: ${adjustmentData.notes || 'Routine balance reconciliation'}`,
    };
    setInventoryTransactions((prev) => [newTx, ...prev]);

    addAuditLog({
      actor: adjustmentData.operator || currentUser.name,
      action: `Stock Adjusted (${adjustmentData.reason}): ${adjustmentData.adjustmentQty > 0 ? '+' : ''}${adjustmentData.adjustmentQty}x ${adjustmentData.sku}`,
      details: adjustmentData.notes || 'Auditor physical count calibration',
      category: 'INVENTORY',
      aiAssisted: false,
    });
  };

  const approveOrder = (orderId: string, notes?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const nextStatus: OrderStatus = 'APPROVED';
          return {
            ...ord,
            status: nextStatus,
            fulfillmentTimeline: [
              ...ord.fulfillmentTimeline,
              {
                id: `tl-app-${Date.now()}`,
                status: nextStatus,
                title: 'Order Approved for Fulfillment',
                description: notes || 'Warehouse dispatcher verified allocation and released to pick wave.',
                timestamp: 'Just now',
                actor: currentUser.name,
                location: 'WH-METRO-01 Fulfillment Control',
              },
            ],
          };
        }
        return ord;
      })
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Approved Order #${orderId}`,
      details: notes || 'Authorized allocation & released to picking queue',
      category: 'ALLOCATION',
      aiAssisted: false,
    });
  };

  const rejectOrder = (orderId: string, reason: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      // Revert product stock reservation if applicable
      setProducts((prev) =>
        prev.map((p) => {
          const item = targetOrder.items.find((i) => i.sku === p.sku);
          if (item) {
            const newAvail = p.availableStock + item.quantity;
            const newReserved = Math.max(0, p.reservedStock - item.quantity);
            return {
              ...p,
              availableStock: newAvail,
              reservedStock: newReserved,
              health: newAvail > p.reorderThreshold ? 'HEALTHY' : 'LOW_STOCK',
            };
          }
          return p;
        })
      );
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'CANCELLED',
            fulfillmentTimeline: [
              ...ord.fulfillmentTimeline,
              {
                id: `tl-rej-${Date.now()}`,
                status: 'CANCELLED',
                title: 'Order Rejected & Cancelled',
                description: `Reason: ${reason}`,
                timestamp: 'Just now',
                actor: currentUser.name,
              },
            ],
          };
        }
        return ord;
      })
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Rejected Order #${orderId}`,
      details: `Reason: ${reason}. Reserved stock unlocked.`,
      category: 'EXCEPTION',
      aiAssisted: false,
    });
  };

  const saveProduct = (product: Product) => {
    // Ensure 5 images
    let secImgs = [...(product.secondaryImages || [])];
    const fallbackList = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    ];
    while (secImgs.length < 4) {
      secImgs.push(fallbackList[secImgs.length % fallbackList.length]);
    }

    const healthStatus: Product['health'] =
      product.availableStock <= 0
        ? 'OUT_OF_STOCK'
        : product.availableStock <= product.safetyStock
        ? 'CRITICAL'
        : product.availableStock <= product.reorderThreshold
        ? 'LOW_STOCK'
        : 'HEALTHY';

    const normalizedProduct: Product = {
      ...product,
      secondaryImages: secImgs,
      health: healthStatus,
    };

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === normalizedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === normalizedProduct.id ? normalizedProduct : p));
      }
      return [normalizedProduct, ...prev];
    });

    addAuditLog({
      actor: currentUser.name,
      action: `Product Saved: ${normalizedProduct.name} (${normalizedProduct.sku})`,
      details: `Price: ₹${normalizedProduct.price.toLocaleString('en-IN')}, Stock: ${normalizedProduct.availableStock}`,
      category: 'COMMERCE',
      aiAssisted: false,
    });
  };

  const deleteProduct = (productId: string): boolean => {
    const unfulfilled = orders.some(
      (o) =>
        ['CREATED', 'PENDING_REVIEW', 'APPROVED', 'STOCK_ALLOCATED', 'PICKING', 'PICKED', 'PACKING', 'PACKED'].includes(o.status) &&
        o.items.some((i) => i.productId === productId)
    );
    if (unfulfilled) {
      return false;
    }

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    addAuditLog({
      actor: currentUser.name,
      action: `Product Deleted: ID ${productId}`,
      details: 'Product archived from active catalog.',
      category: 'COMMERCE',
      aiAssisted: false,
    });
    return true;
  };

  const completePickItem = (orderId: string, sku: string, qty: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedItems = ord.items.map((item) => {
            if (item.sku === sku) {
              const newAllocated = Math.min(item.quantity, (item.allocatedQty || 0) + qty);
              return {
                ...item,
                allocatedQty: newAllocated,
                qcVerified: newAllocated >= item.quantity,
              };
            }
            return item;
          });
          const allItemsPicked = updatedItems.every((i) => (i.allocatedQty || 0) >= i.quantity);
          const nextStatus: OrderStatus = allItemsPicked ? 'PACKING' : (ord.status === 'ALLOCATED' || ord.status === 'PRIORITIZED' ? 'PICKING' : ord.status);

          return {
            ...ord,
            status: nextStatus,
            items: updatedItems,
            fulfillmentTimeline: [
              ...ord.fulfillmentTimeline,
              {
                id: `tl-pk-${Date.now()}`,
                status: nextStatus,
                title: `Picked ${qty}x ${sku}`,
                description: allItemsPicked ? 'All items in order picked and staged for packing.' : `Verified barcode scan at staging cart (${qty} units).`,
                timestamp: 'Just now',
                actor: currentUser.name || 'Staff Picker',
                location: 'Zone A Pick Face',
              },
            ],
          };
        }
        return ord;
      })
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Picked ${qty}x ${sku} for Order #${orderId}`,
      details: 'Scanned at staging container',
      category: 'PICKING',
      aiAssisted: false,
    });
  };

  const completePackOrder = (orderId: string, cartonType: string, weightKg: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'QC_CHECK',
            fulfillmentTimeline: [
              ...ord.fulfillmentTimeline,
              {
                id: `tl-pack-${Date.now()}`,
                status: 'QC_CHECK',
                title: 'Order Sealed & Packed',
                description: `Carton: ${cartonType}, Gross Weight: ${weightKg.toFixed(2)} kg. Tamper seal attached. Staged for QC inspection.`,
                timestamp: 'Just now',
                actor: currentUser.name || 'Packer Station',
                location: 'WH-METRO-01 Pack Bench 02',
              },
            ],
          };
        }
        return ord;
      })
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Packed Order #${orderId}`,
      details: `Carton: ${cartonType}, Weight: ${weightKg}kg`,
      category: 'PACKING',
      aiAssisted: false,
    });
  };

  const dispatchOrder = (orderId: string, carrier: string, trackingNumber: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);

    if (targetOrder) {
      // Deduct physical stock on dispatch
      setProducts((prev) =>
        prev.map((p) => {
          const item = targetOrder.items.find((i) => i.sku === p.sku);
          if (item) {
            const newReserved = Math.max(0, p.reservedStock - item.quantity);
            return {
              ...p,
              reservedStock: newReserved,
            };
          }
          return p;
        })
      );

      // Record dispatch transactions
      targetOrder.items.forEach((item) => {
        const p = products.find((prod) => prod.sku === item.sku);
        const newTx: InventoryTransaction = {
          id: `tx-${Date.now()}-${item.sku}`,
          productId: item.productId,
          sku: item.sku,
          productName: item.name,
          type: 'DISPATCHED',
          quantityChange: -item.quantity,
          physicalStockAfter: p ? Math.max(0, p.availableStock + p.reservedStock - item.quantity) : 0,
          availableStockAfter: p ? p.availableStock : 0,
          referenceId: orderId,
          operator: currentUser.name,
          timestamp: new Date().toISOString(),
          notes: `Carrier: ${carrier}, AWB: ${trackingNumber}`,
        };
        setInventoryTransactions((prev) => [newTx, ...prev]);
      });
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'DISPATCHED',
            carrierName: carrier,
            trackingNumber: trackingNumber,
            fulfillmentTimeline: [
              ...ord.fulfillmentTimeline,
              {
                id: `tl-disp-${Date.now()}`,
                status: 'DISPATCHED',
                title: `Handed Over to ${carrier}`,
                description: `Air Waybill: ${trackingNumber}. Staged at Outbound Dock 03.`,
                timestamp: 'Just now',
                actor: currentUser.name || 'Outbound Lead',
                location: 'WH-METRO-01 Outbound Dock 03',
              },
            ],
          };
        }
        return ord;
      })
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Dispatched Order #${orderId}`,
      details: `Carrier: ${carrier}, AWB: ${trackingNumber}`,
      category: 'DISPATCH',
      aiAssisted: false,
    });
  };

  const reportBenchException = (data: { orderId?: string; sku: string; type: string; quantity: number; notes: string; location?: string }) => {
    const excId = `EXC-${Date.now()}`;
    const targetProd = products.find((p) => p.sku === data.sku);
    const prevQty = targetProd ? targetProd.availableStock + targetProd.reservedStock + targetProd.damagedStock : 0;
    const newExc: WarehouseException = {
      id: excId,
      orderId: data.orderId || 'ORD-GEN-EXP',
      sku: data.sku,
      productName: targetProd?.name || data.sku,
      type: (data.type as any) || 'DAMAGED_IN_BIN',
      severity: 'CRITICAL',
      status: 'OPEN',
      affectedLocation: data.location || 'A-02-1',
      reportedBy: currentUser.name,
      timestamp: new Date().toISOString(),
      rootCause: data.notes || 'Damage/shortage flagged at operator bench',
      impactAnalysis: `Flagged ${data.quantity} units for quarantine and investigation.`,
      recommendedAction: 'Immediate cycle count & alternate bin reallocation',
    };

    setExceptions((prev) => [newExc, ...prev]);

    // Record adjustment
    recordStockAdjustment({
      productId: targetProd?.id || 'prod-002',
      sku: data.sku,
      productName: newExc.productName || data.sku,
      previousPhysicalQty: prevQty,
      adjustmentQty: -data.quantity,
      newPhysicalQty: Math.max(0, prevQty - data.quantity),
      reason: data.type === 'DAMAGED' ? 'DAMAGED' : 'MISSING',
      operator: currentUser.name,
      operatorRole: currentUser.role,
      notes: `Exception ticket ${excId}: ${data.notes}`,
    });

    // Add alert
    setWarehouseAlerts((prev) => [
      {
        id: `alt-${Date.now()}`,
        type: 'EXCEPTION_REPORTED',
        severity: 'CRITICAL',
        title: `Exception Reported: ${data.sku}`,
        message: `${data.quantity} units reported as ${data.type} at ${data.location || 'Staging'}.`,
        timestamp: 'Just now',
        relatedEntityId: excId,
        status: 'UNREAD',
        suggestedAction: 'Review and resolve exception in Operations',
        actionModuleKey: '09_EXCEPTIONS',
      },
      ...prev,
    ]);
  };

  const logException = (exceptionData: Partial<WarehouseException>) => {
    reportBenchException({
      orderId: exceptionData.orderId || exceptionData.affectedOrderId,
      sku: exceptionData.sku || exceptionData.affectedSku || 'SKU-NC-900',
      type: (exceptionData.type as string) || 'DAMAGED_GOODS',
      quantity: 1,
      notes: exceptionData.description || exceptionData.rootCause || 'QC Inspection failure flagged for quarantine',
      location: exceptionData.affectedLocation || 'Bench QC-01',
    });
  };

  const reallocateStaff = (dockOrZone: string, count: number) => {
    const availableOps = operators.filter((o) => o.status !== 'REALLOCATED').slice(0, count);
    availableOps.forEach((op) => {
      reassignStaff(op.id, 'DISPATCH_AGENT', dockOrZone);
    });
    if (availableOps.length === 0 && operators.length > 0) {
      reassignStaff(operators[0].id, 'DISPATCH_AGENT', dockOrZone);
    }
  };

  const updateBinOccupancy = (binId: string, newOccupancy: number) => {
    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { ...b, currentOccupancy: newOccupancy } : b))
    );
  };

  const acknowledgeAlert = (alertId: string) => {
    setWarehouseAlerts((prev) =>
      prev.map((alt) => (alt.id === alertId ? { ...alt, status: 'ACKNOWLEDGED' } : alt))
    );
  };

  const resolveAlert = (alertId: string) => {
    setWarehouseAlerts((prev) =>
      prev.map((alt) => (alt.id === alertId ? { ...alt, status: 'RESOLVED' } : alt))
    );
  };

  // Scenario Walkthrough Helper
  const runHeroSimulationStep = (step: number) => {
    setHeroStep(step);
    setIsHeroRunning(true);

    switch (step) {
      case 1:
        setActivePortalState('ADMIN');
        setActiveAdminModule('03_ORDERS');
        setSelectedOrderId('ORD-WW-1042');
        break;
      case 2:
        setActivePortalState('ADMIN');
        setActiveAdminModule('04_ALLOCATION');
        setSelectedOrderId('ORD-WW-1042');
        break;
      case 3:
        applyReallocation('ORD-WW-1042', 'ORD-WW-1047', 'SKU-NC-900', 3);
        setActiveAdminModule('04_ALLOCATION');
        break;
      case 4:
        setActiveAdminModule('09_EXCEPTIONS');
        reroutePicker('EXC-001', 'OP-001', 'B-07-1');
        break;
      case 5:
        setActiveAdminModule('07_QC');
        runQCCheck('ORD-WW-1042', true, 'Optical verification passed: 10/10 units intact.');
        break;
      case 6:
        setActiveAdminModule('08_DISPATCH');
        reassignStaff('OP-004', 'DISPATCH_AGENT', 'Dock 03 Sortation Bay');
        advanceOrderStatus('ORD-WW-1042', 'DISPATCHED');
        break;
      case 7:
        setActivePortalState('CUSTOMER');
        setActiveCustomerNavTab('ORDERS');
        setSelectedTrackingOrderId('ORD-WW-1042');
        break;
      default:
        break;
    }
  };

  const replyToSupportTicket = (ticketId: string, messageText: string, sender: 'AGENT' | 'AI_COPILOT' = 'AGENT') => {
    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newMsg = {
            id: `msg-${Date.now()}`,
            sender,
            senderName: sender === 'AI_COPILOT' ? 'SKANVI AI Copilot' : currentUser.name,
            message: messageText,
            timestamp: 'Just now',
          };
          return {
            ...t,
            messages: [...t.messages, newMsg],
            updatedAt: 'Just now',
          };
        }
        return t;
      })
    );
    addAuditLog({
      actor: currentUser.name,
      action: `Replied to Ticket #${ticketId}`,
      details: messageText,
      category: 'COMMERCE',
      aiAssisted: sender === 'AI_COPILOT',
    });
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: 'Just now' } : t))
    );
  };

  const approveRMA = (rmaId: string, notes?: string) => {
    setReturnRMAs((prev) =>
      prev.map((r) =>
        r.id === rmaId ? { ...r, status: 'APPROVED', inspectionNotes: notes || 'RMA authorized by administrator.' } : r
      )
    );
    addAuditLog({
      actor: currentUser.name,
      action: `Approved Return RMA #${rmaId}`,
      details: notes || 'Authorized pickup and replacement/refund clearance',
      category: 'COMMERCE',
      aiAssisted: false,
    });
  };

  const rejectRMA = (rmaId: string, notes?: string) => {
    setReturnRMAs((prev) =>
      prev.map((r) =>
        r.id === rmaId ? { ...r, status: 'REJECTED', inspectionNotes: notes || 'RMA rejected.' } : r
      )
    );
  };

  const updateRMAStatus = (rmaId: string, status: ReturnRMA['status'], notes?: string) => {
    setReturnRMAs((prev) =>
      prev.map((r) => (r.id === rmaId ? { ...r, status, inspectionNotes: notes || r.inspectionNotes } : r))
    );
  };

  const processInstantRefund = async (
    orderId: string,
    rmaId?: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refundRef: string }> => {
    const refundRef = `RFD-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRefund: RefundRecord = {
      id: `RFD-${Date.now()}`,
      refundReference: refundRef,
      orderId,
      rmaId,
      customerId: 'cust-01',
      customerName: 'Kishore Venkat',
      amount: amount || 14999,
      paymentMethod: 'UPI',
      gatewayTransactionId: `RAZORPAY_REF_${Date.now().toString().slice(-7)}`,
      status: 'COMPLETED',
      reason: reason || 'Approved return refund credit',
      approvedBy: currentUser.name,
      createdAt: 'Just now',
      completedAt: 'Just now',
    };

    setRefunds((prev) => [newRefund, ...prev]);

    // Update order timeline
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            fulfillmentTimeline: [
              ...o.fulfillmentTimeline,
              {
                id: `tl-rfd-${Date.now()}`,
                status: o.status,
                title: 'Instant Gateway Refund Issued',
                description: `₹${amount || 14999} credited back to customer account. Ref: ${refundRef}`,
                timestamp: 'Just now',
                actor: currentUser.name,
              },
            ],
          };
        }
        return o;
      })
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Issued Instant Refund for Order #${orderId}`,
      details: `Amount: ₹${amount || 14999}. Ref: ${refundRef}`,
      category: 'COMMERCE',
      aiAssisted: true,
    });

    return { success: true, refundRef };
  };

  const savePromotion = (promo: PromotionCampaign) => {
    setPromotions((prev) => {
      const idx = prev.findIndex((p) => p.id === promo.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = promo;
        return updated;
      }
      return [promo, ...prev];
    });
    addAuditLog({
      actor: currentUser.name,
      action: `Saved Promotion Campaign "${promo.title}"`,
      details: `Code: ${promo.code || 'Auto-discount'} | Value: ${promo.discountValue}%`,
      category: 'COMMERCE',
      aiAssisted: false,
    });
  };

  const deletePromotion = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  const issueGiftCard = (card: Omit<GiftCardRecord, 'id' | 'createdAt' | 'redemptionHistory'>) => {
    const newCard: GiftCardRecord = {
      ...card,
      id: `GC-${Date.now()}`,
      createdAt: 'Today',
      redemptionHistory: [],
    };
    setGiftCards((prev) => [newCard, ...prev]);
    addAuditLog({
      actor: currentUser.name,
      action: `Issued Gift Card ${newCard.cardNumber}`,
      details: `Recipient: ${newCard.recipientEmail} | Balance: ₹${newCard.initialBalance}`,
      category: 'COMMERCE',
      aiAssisted: false,
    });
  };

  const toggleGiftCardStatus = (id: string) => {
    setGiftCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE' } : c
      )
    );
  };

  const adjustLoyaltyPoints = (customerId: string, deltaPoints: number, reason: string) => {
    setLoyaltyAccounts((prev) =>
      prev.map((acc) => {
        if (acc.customerId === customerId) {
          const newBal = Math.max(0, acc.pointsBalance + deltaPoints);
          const newHistory = [
            {
              id: `LP-${Date.now()}`,
              type: deltaPoints >= 0 ? ('EARNED' as const) : ('REDEEMED' as const),
              points: deltaPoints,
              reason,
              timestamp: 'Just now',
            },
            ...acc.pointHistory,
          ];
          return {
            ...acc,
            pointsBalance: newBal,
            lifetimePointsEarned: deltaPoints > 0 ? acc.lifetimePointsEarned + deltaPoints : acc.lifetimePointsEarned,
            pointHistory: newHistory,
          };
        }
        return acc;
      })
    );
  };

  const updateSellerStatus = (sellerId: string, status: SellerRecord['status']) => {
    setSellers((prev) => prev.map((s) => (s.id === sellerId ? { ...s, status } : s)));
  };

  const saveCategorySchema = (schema: CategorySchema) => {
    setCategorySchemas((prev) => {
      const idx = prev.findIndex((c) => c.id === schema.id);
      if (idx >= 0) {
        const arr = [...prev];
        arr[idx] = schema;
        return arr;
      }
      return [...prev, schema];
    });
  };

  const bulkUpdatePrices = (category: string, percentageChange: number) => {
    const factor = 1 + percentageChange / 100;
    setProducts((prev) =>
      prev.map((p) => {
        if (category === 'ALL' || p.category === category) {
          const newPrice = Math.round(p.price * factor);
          return { ...p, price: newPrice };
        }
        return p;
      })
    );
    addAuditLog({
      actor: currentUser.name,
      action: `Bulk Price Adjustment (${percentageChange >= 0 ? '+' : ''}${percentageChange}%)`,
      details: `Category: ${category}`,
      category: 'COMMERCE',
      aiAssisted: true,
    });
  };

  const bulkUpdateStock = (stockDeltas: Array<{ sku: string; delta: number; reason: string }>) => {
    setProducts((prev) =>
      prev.map((p) => {
        const match = stockDeltas.find((d) => d.sku === p.sku);
        if (match) {
          const newAvail = Math.max(0, p.availableStock + match.delta);
          return { ...p, availableStock: newAvail };
        }
        return p;
      })
    );
  };

  const splitOrder = (orderId: string, splitSkus: string[]) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    const remainingItems = target.items.filter((i) => !splitSkus.includes(i.sku));
    const splitItems = target.items.filter((i) => splitSkus.includes(i.sku));

    if (splitItems.length === 0 || remainingItems.length === 0) return;

    const newSubTotal = splitItems.reduce((acc, i) => acc + i.itemPrice * i.quantity, 0);
    const updatedOldTotal = remainingItems.reduce((acc, i) => acc + i.itemPrice * i.quantity, 0);

    const newOrderId = `ORD-WW-${Math.floor(1000 + Math.random() * 9000)}-SPLIT`;
    const newOrder: Order = {
      ...target,
      id: newOrderId,
      items: splitItems,
      totalAmount: newSubTotal,
      subtotal: newSubTotal,
      status: 'PENDING',
      fulfillmentTimeline: [
        {
          id: `tl-split-${Date.now()}`,
          status: 'PENDING',
          title: 'Order Created via Split Allocation',
          description: `Split off from parent order #${orderId}`,
          timestamp: 'Just now',
          actor: currentUser.name,
        },
      ],
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            items: remainingItems,
            totalAmount: updatedOldTotal,
            subtotal: updatedOldTotal,
            fulfillmentTimeline: [
              ...o.fulfillmentTimeline,
              {
                id: `tl-parent-split-${Date.now()}`,
                status: o.status,
                title: 'Order Splitted',
                description: `Splitted items into new sub-order #${newOrderId}`,
                timestamp: 'Just now',
                actor: currentUser.name,
              },
            ],
          };
        }
        return o;
      }).concat(newOrder)
    );

    addAuditLog({
      actor: currentUser.name,
      action: `Split Order #${orderId}`,
      details: `Created split child order #${newOrderId} with SKUs: ${splitSkus.join(', ')}`,
      category: 'ALLOCATION',
      aiAssisted: false,
    });
  };

  const reorderInventoryItem = (sku: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === sku) {
          return {
            ...p,
            incomingStock: p.incomingStock + quantity,
          };
        }
        return p;
      })
    );

    // Add new stock receipt entry
    const targetProd = products.find((p) => p.sku === sku);
    const newReceipt: StockReceipt = {
      id: `RC-PO-${Date.now()}`,
      productId: targetProd?.id || `PROD-${sku}`,
      sku,
      productName: targetProd?.name || sku,
      quantity,
      supplier: 'Primary OEM Fab Partner',
      referenceNumber: `PO-AUTO-${Math.floor(100000 + Math.random() * 900000)}`,
      importDate: new Date().toISOString().split('T')[0],
      binLocation: targetProd?.binLocation || 'A-01-1',
      zone: targetProd?.zone || 'Zone A',
      condition: 'INSPECTED',
      operator: currentUser.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setStockReceipts((prev) => [newReceipt, ...prev]);

    addAuditLog({
      actor: currentUser.name,
      action: `Triggered Inventory Reorder PO for ${sku}`,
      details: `Requested +${quantity} units from supplier. Status: Pending Inward Dock.`,
      category: 'INVENTORY',
      aiAssisted: true,
    });
  };

  const updateBusinessRule = (ruleId: string, newValue: any) => {
    setBusinessRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              value: newValue,
              lastModifiedBy: currentUser.name,
              lastModifiedAt: 'Today',
            }
          : r
      )
    );
    addAuditLog({
      actor: currentUser.name,
      action: `Updated Business Rule #${ruleId}`,
      details: `New value: ${JSON.stringify(newValue)}`,
      category: 'COMMERCE',
      aiAssisted: false,
    });
  };

  const toggleFeatureFlag = (flagId: string) => {
    setFeatureFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, enabled: !f.enabled, updatedAt: 'Today' } : f))
    );
  };

  const updateFeatureFlagRollout = (flagId: string, percentage: number) => {
    setFeatureFlags((prev) =>
      prev.map((f) => (f.id === flagId ? { ...f, rolloutPercentage: percentage, updatedAt: 'Today' } : f))
    );
  };

  const terminateSecuritySession = (sessionId: string) => {
    setSecuritySessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'TERMINATED', isCurrent: false } : s))
    );
  };

  const flagSecuritySession = (sessionId: string) => {
    setSecuritySessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'FLAGGED' } : s))
    );
  };

  const updateNotificationTemplate = (templateId: string, body: string, subject?: string) => {
    setNotificationTemplates((prev) =>
      prev.map((t) =>
        t.id === templateId ? { ...t, body, subject: subject || t.subject, lastEdited: 'Today' } : t
      )
    );
  };

  const rebuildSearchIndex = async (): Promise<{ indexedCount: number; durationMs: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { indexedCount: products.length + orders.length, durationMs: 240 };
  };

  const resetSimulationData = () => {
    setProducts(INITIAL_PRODUCTS);
    setBins(INITIAL_BINS);
    setOrders(INITIAL_ORDERS);
    setExceptions(INITIAL_EXCEPTIONS);
    setRecommendations(INITIAL_RECOMMENDATIONS);
    setOperators(INITIAL_OPERATORS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setMetrics(INITIAL_METRICS);
    setHeroStep(0);
    setIsHeroRunning(false);
    localStorage.removeItem('warewise_products');
    localStorage.removeItem('warewise_orders');
    localStorage.removeItem('warewise_cart');
    localStorage.removeItem('warewise_wishlist');
  };

  return (
    <WarehouseContext.Provider
      value={{
        products,
        bins,
        orders,
        exceptions,
        recommendations,
        operators,
        auditLogs,
        metrics,
        stockReceipts,
        stockAdjustments,
        inventoryTransactions,
        warehouseAlerts,

        currentUser,
        isAuthenticated,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        updateCustomerProfile,

        activePortal,
        setActivePortal,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        loginAdmin,
        logoutAdmin,
        activeAdminModule,
        setActiveAdminModule,
        switchUser,
        activeAdminRole,
        setActiveAdminRole,
        hasPermission,

        recordStockReceipt,
        recordStockAdjustment,
        approveOrder,
        rejectOrder,
        saveProduct,
        deleteProduct,
        completePickItem,
        completePackOrder,
        dispatchOrder,
        reportBenchException,
        logException,
        reallocateStaff,
        updateBinOccupancy,
        acknowledgeAlert,
        resolveAlert,

        activeCustomerNavTab,
        setActiveCustomerNavTab,
        customerSearchQuery,
        setCustomerSearchQuery,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        productSortOption,
        setProductSortOption,
        priceFilterRange,
        setPriceFilterRange,
        minRatingFilter,
        setMinRatingFilter,
        inStockOnlyFilter,
        setInStockOnlyFilter,
        viewMode,
        setViewMode,

        cart,
        cartCount,
        cartSubtotal,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,

        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isComparisonOpen,
        setIsComparisonOpen,

        customerAddresses,
        addCustomerAddress,
        editCustomerAddress,
        deleteCustomerAddress,
        selectedAddressId,
        setSelectedAddressId,

        availableCoupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,

        isCartOpen,
        setIsCartOpen,
        isAiChatOpen,
        setIsAiChatOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        checkoutStep,
        setCheckoutStep,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isVoiceSearchOpen,
        setIsVoiceSearchOpen,
        isImageSearchOpen,
        setIsImageSearchOpen,

        latestPlacedOrder,
        setLatestPlacedOrder,
        placeCustomerOrder,
        selectedTrackingOrderId,
        setSelectedTrackingOrderId,
        cancelCustomerOrder,
        requestCustomerReturn,

        submitProductReview,
        submitProductQuestion,

        notifications,
        unreadNotificationCount,
        markNotificationsRead,
        markAllNotificationsRead,

        selectedProductId,
        setSelectedProductId,
        selectedOrderId,
        setSelectedOrderId,

        applyReallocation,
        advanceOrderStatus,
        reroutePicker,
        reassignStaff,
        runQCCheck,
        resolveException,
        triggerReorder,
        applyRecommendation,
        rejectRecommendation,
        addAuditLog,

        // Support, RMAs, Refunds
        supportTickets,
        returnRMAs,
        refunds,
        replyToSupportTicket,
        updateTicketStatus,
        approveRMA,
        rejectRMA,
        updateRMAStatus,
        processInstantRefund,

        // Commerce Suite
        promotions,
        giftCards,
        loyaltyAccounts,
        sellers,
        categorySchemas,
        savePromotion,
        deletePromotion,
        issueGiftCard,
        toggleGiftCardStatus,
        adjustLoyaltyPoints,
        updateSellerStatus,
        saveCategorySchema,
        bulkUpdatePrices,
        bulkUpdateStock,
        splitOrder,
        reorderInventoryItem,

        // Platform Governance
        businessRules,
        featureFlags,
        securitySessions,
        notificationTemplates,
        simulationScenarios,
        updateBusinessRule,
        toggleFeatureFlag,
        updateFeatureFlagRollout,
        terminateSecuritySession,
        flagSecuritySession,
        updateNotificationTemplate,
        rebuildSearchIndex,

        heroStep,
        isHeroRunning,
        runHeroSimulationStep,
        resetSimulationData,

        // Network Connectivity & Offline State Manager
        isOnline,
        toggleSimulatedNetwork,
        offlineQueue,
        enqueueOfflineMove,
        clearOfflineQueue,
        syncOfflineQueue,

        // Dark Mode
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};
