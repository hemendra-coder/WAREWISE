export interface OfflineMoveItem {
  id: string;
  timestamp: string;
  type: 'PICKING_LOG' | 'STOCK_RECEIPT' | 'STOCK_ADJUSTMENT' | 'BIN_TRANSFER' | 'BARCODE_SCAN';
  title: string;
  details: string;
  operator: string;
  payload: any;
  status: 'PENDING_SYNC' | 'SYNCED' | 'FAILED';
}

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'WAREHOUSE_ADMIN'
  | 'WAREHOUSE_MANAGER' 
  | 'INVENTORY_MANAGER' 
  | 'ORDER_MANAGER'
  | 'PICKER'
  | 'PACKER'
  | 'DISPATCHER'
  | 'OFFICIAL'
  | 'FULFILLMENT_OPERATOR' 
  | 'DISPATCH_OPERATOR' 
  | 'CUSTOMER';

export interface StockAdjustment {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  previousPhysicalQty: number;
  adjustmentQty: number;
  newPhysicalQty: number;
  reason: 'DAMAGED' | 'MISSING' | 'EXPIRED' | 'RETURNED' | 'COUNTING_CORRECTION' | 'WAREHOUSE_TRANSFER' | 'ADMINISTRATIVE_CORRECTION' | 'OTHER';
  notes?: string;
  operator: string;
  operatorRole: string;
  timestamp: string;
}

export interface StockReceipt {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  supplier: string;
  referenceNumber: string;
  importDate: string;
  binLocation: string;
  zone: string;
  condition: 'PRISTINE' | 'INSPECTED' | 'NEEDS_LABELING' | 'PARTIAL_DAMAGE';
  operator: string;
  notes?: string;
  timestamp: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  type: 'STOCK_RECEIVED' | 'ORDER_RESERVED' | 'PICKED' | 'PACKED' | 'DISPATCHED' | 'DAMAGED' | 'MISSING' | 'MANUAL_ADJUSTMENT' | 'RETURN_RESTOCKED' | 'RESERVATION_CANCELLED';
  quantityChange: number; // positive for additions, negative for deductions
  physicalStockAfter: number;
  availableStockAfter: number;
  referenceId: string; // Order ID, PO ID, or Adj ID
  operator: string;
  timestamp: string;
  notes?: string;
}

export interface WarehouseAlert {
  id: string;
  type: 'OUT_OF_STOCK' | 'OVERSELLING_RISK' | 'CRITICAL_DELAY' | 'LOW_STOCK' | 'PICKING_BOTTLENECK' | 'PACKING_BOTTLENECK' | 'REPLENISHMENT_NEEDED' | 'NEW_STOCK_RECEIVED' | 'EXCEPTION_REPORTED';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  relatedEntityId?: string; // Sku, OrderId, BinId
  status: 'UNREAD' | 'ACKNOWLEDGED' | 'RESOLVED';
  suggestedAction?: string;
  actionModuleKey?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  company?: string;
  assignedZone?: string;
  warehouseAccess?: string[];
}

export type StockHealthStatus = 'HEALTHY' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK' | 'PROJECTED_STOCKOUT' | 'OVERSTOCK';

export type ProductCategory = 
  | 'Edge Computing' 
  | 'Robotics & IoT' 
  | 'Smart Audio' 
  | 'Displays & Vision' 
  | 'Power & Energy' 
  | 'Pro Hardware'
  | 'Mobiles & 5G'
  | 'Computers & Laptops'
  | 'Smart Home & Living'
  | 'Daily Essentials';

export type CustomerNavTab = 
  | 'HOME'
  | 'SHOP'
  | 'CATEGORIES'
  | 'DEALS'
  | 'AI_SHOP'
  | 'WISHLIST'
  | 'ORDERS'
  | 'CART'
  | 'ACCOUNT'
  | 'ORDER_CONFIRMATION';

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

export interface ProductQA {
  id: string;
  question: string;
  askedBy: string;
  date: string;
  answer: string;
  answeredBy: string;
  isAiVerified: boolean;
}

export interface CustomerAddress {
  id: string;
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

export interface CouponDiscount {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderValue: number;
  description: string;
  expiryDays: number;
}

export interface ProductVariantOption {
  label: string;
  priceDelta: number;
  inStock: boolean;
}

export interface ProductVariant {
  type: string;
  options: ProductVariantOption[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory | string;
  brand?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  secondaryImages?: string[];
  description: string;
  specs: Record<string, string>;
  availableStock: number;
  reservedStock: number;
  damagedStock: number;
  incomingStock: number;
  safetyStock: number;
  reorderThreshold: number;
  dailyDemand: number;
  leadTimeDays: number;
  binLocation: string;
  alternateBinLocation?: string;
  warehouseId?: string;
  zone?: string;
  health?: StockHealthStatus;
  deliveryConfidence?: number;
  aiVerdict?: string;
  pros?: string[];
  cons?: string[];
  tags?: string[];
  fastDeliveryAvailable?: boolean;
  reviews?: CustomerReview[];
  qaList?: ProductQA[];
  variants?: ProductVariant[];
}

export interface WarehouseBin {
  id: string;
  warehouseId: string;
  zone: 'Zone A (High Velocity)' | 'Zone B (IoT & Robotics)' | 'Zone C (Bulk & Overflow)' | 'Zone D (Cold/Secure)';
  aisle: string;
  shelf: string;
  level: string;
  sku: string;
  productName: string;
  capacity: number;
  currentQty: number;
  reservedQty: number;
  status: 'OPTIMAL' | 'NEAR_EMPTY' | 'OVERFLOW' | 'FLAGGED_EXCEPTION';
}

export type OrderPriorityTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';

export interface PriorityFactor {
  name: string;
  weight: number;
  score: number;
  reason: string;
}

export type OrderStatus =
  | 'CREATED'
  | 'PENDING_APPROVAL'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PRIORITIZED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'PRIORITY_DETERMINED'
  | 'INVENTORY_CHECK'
  | 'SHORTAGE_FLAGGED'
  | 'STOCK_ALLOCATED'
  | 'ALLOCATED'
  | 'RECEIVED'
  | 'PICKING'
  | 'PICKED'
  | 'PACKING'
  | 'PACKED'
  | 'QC'
  | 'QC_CHECK'
  | 'QC_FAILED'
  | 'READY_FOR_DISPATCH'
  | 'DISPATCHED'
  | 'OUT_FOR_DELIVERY'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURN_REJECTED'
  | 'RETURNED'
  | 'REFUND_PROCESSED'
  | 'COMPLETED'
  | 'EXCEPTION'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  sku: string;
  name?: string;
  price?: number;
  pricePerUnit?: number;
  quantity: number;
  allocatedQty?: number;
  binLocation?: string;
  image?: string;
  qcVerified?: boolean;
}

export interface TimelineEvent {
  id: string;
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  isAiDriven?: boolean;
  metadata?: Record<string, any>;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerTier: 'ENTERPRISE_VIP' | 'PRO_TIER' | 'STANDARD' | 'PREMIUM' | 'VIP' | 'REGULAR';
  items: OrderItem[];
  totalAmount: number;
  subtotalAmount?: number;
  discountAmount?: number;
  discountApplied?: number;
  shippingFee?: number;
  taxAmount?: number;
  paymentMethod?: string;
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
  fulfillmentStatus?: 'PENDING' | 'ALLOCATED' | 'PICKED' | 'PACKED' | 'DELIVERED';
  priorityScore?: number;
  priorityTier?: OrderPriorityTier;
  priorityFactors?: PriorityFactor[];
  status: OrderStatus;
  allowPartialDelivery?: boolean;
  slaMinutesRemaining?: number;
  allocationStatus?: 'FULLY_ALLOCATED' | 'PARTIAL' | 'UNALLOCATED' | 'REALLOCATED';
  donorOrderId?: string;
  reallocatedQty?: number;
  pickerId?: string;
  pickerName?: string;
  packingStationId?: string;
  qcStationId?: string;
  qcStatus?: 'PENDING' | 'PASS' | 'FAIL' | 'REVIEW';
  qcNotes?: string;
  notes?: string;
  allocatedItems?: Array<{ productId: string; sku?: string; quantity: number; binLocation?: string }>;
  pickedItems?: Array<{ productId: string; sku?: string; quantity: number; binLocation?: string }>;
  packedItems?: Array<{ productId: string; sku?: string; quantity: number; cartonType?: string }>;
  carrier?: string;
  trackingNumber?: string;
  dispatchWave?: string;
  slaDeadline?: string;
  createdAt?: string;
  fulfillmentTimeline?: TimelineEvent[];
  aiExplanation?: string;
  shippingAddress?: string | {
    name?: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export type ExceptionType = 
  | 'MISSING_ITEM'
  | 'DAMAGED_ITEM'
  | 'DAMAGED_GOODS'
  | 'WRONG_ITEM'
  | 'PARTIAL_STOCK'
  | 'STOCKOUT'
  | 'DELAYED_ORDER'
  | 'QC_FAILED'
  | 'DISPATCH_BOTTLENECK'
  | 'BOTTLENECK_CONGESTION'
  | 'ALLOCATION_CONFLICT';

export type ExceptionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ExceptionStatus = 'OPEN' | 'INVESTIGATING' | 'DECISION_PENDING' | 'RESOLVED';

export interface WarehouseException {
  id: string;
  type: ExceptionType | string;
  orderId?: string;
  affectedOrderId?: string;
  sku?: string;
  affectedSku?: string;
  productName?: string;
  reportedBy?: string;
  status: ExceptionStatus;
  severity: ExceptionSeverity;
  timestamp: string;
  rootCause: string;
  investigatedDetails?: string;
  description?: string;
  affectedLocation?: string;
  recommendedAction: string;
  alternativeAction?: string;
  impactAnalysis?: string;
  resolutionDetails?: string;
  resolvedAt?: string;
}

export type Exception = WarehouseException;

export interface DecisionRecommendation {
  id: string;
  title: string;
  category: 'ALLOCATION_PROTECTION' | 'PICKER_REROUTE' | 'STAFF_DISPATCH_INTERVENTION' | 'REORDER_TRIGGER' | 'QC_REPACK';
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reason: string;
  expectedResult: string;
  confidenceScore: number;
  affectedOrders: string[];
  affectedSKUs: string[];
  impactSummary: string;
  status: 'PROPOSED' | 'APPLIED' | 'REJECTED' | 'SIMULATING';
  actions: {
    primaryLabel: string;
    secondaryLabel?: string;
  };
}

export interface WarehouseOperator {
  id: string;
  name: string;
  role: 'PICKER' | 'PACKER' | 'QC_INSPECTOR' | 'DISPATCH_AGENT';
  currentZone: string;
  activeTask?: string;
  throughputPerHour: number;
  status: 'ACTIVE' | 'IDLE' | 'ASSIGNED' | 'REALLOCATED';
  avatar: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  category: 'ALLOCATION' | 'PRIORITY' | 'EXCEPTION' | 'DISPATCH' | 'COMMERCE' | 'INVENTORY' | 'PICKING' | 'PACKING' | 'QUALITY';
  aiAssisted: boolean;
  beforeState?: string;
  afterState?: string;
}

export interface OperationalMetrics {
  totalOrdersToday: number;
  criticalSlaCount: number;
  activePickingTasks: number;
  packingQueueCount: number;
  qcQueueCount: number;
  readyDispatchCount: number;
  unresolvedExceptionsCount: number;
  pickingRatePerHour: number;
  packingRatePerHour: number;
  dispatchAdherencePercent: number;
  reorderAlertsCount: number;
  warehouseOccupancyPercent: number;
}

export type CheckoutStep = 'ADDRESS' | 'SHIPPING' | 'PAYMENT' | 'REVIEW' | 'CONFIRMATION';

export interface CustomerAuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  role: 'CUSTOMER';
  avatar: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  subject: string;
  category: 'ORDER_DELAY' | 'DAMAGED_DELIVERY' | 'REFUND_INQUIRY' | 'PAYMENT_ISSUE' | 'PRODUCT_SUPPORT' | 'GENERAL';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'REOPENED';
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  messages: Array<{
    id: string;
    sender: 'CUSTOMER' | 'AGENT' | 'SYSTEM' | 'AI_COPILOT';
    senderName: string;
    message: string;
    timestamp: string;
    attachments?: string[];
  }>;
}

export interface ReturnRMA {
  id: string;
  rmaNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  sku: string;
  productName: string;
  quantity: number;
  reason: 'DEFECTIVE' | 'WRONG_ITEM' | 'NOT_AS_DESCRIBED' | 'ACCIDENTAL_ORDER' | 'SIZE_FIT' | 'BETTER_PRICE';
  type: 'REFUND' | 'EXCHANGE' | 'STORE_CREDIT';
  status: 'REQUESTED' | 'APPROVED' | 'PICKUP_SCHEDULED' | 'RECEIVED_AT_HUB' | 'QC_INSPECTED' | 'REFUND_ISSUED' | 'REJECTED';
  pickupCarrier?: string;
  pickupTracking?: string;
  inspectionNotes?: string;
  refundAmount: number;
  requestedAt: string;
  resolvedAt?: string;
}

export interface RefundRecord {
  id: string;
  refundReference?: string;
  orderId: string;
  rmaId?: string;
  customerId?: string;
  customerName?: string;
  amount: number;
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'NET_BANKING' | 'WALLET' | 'STORE_CREDIT' | 'CARD';
  gatewayTransactionId?: string;
  status: 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'MANUAL_REVIEW';
  reason: string;
  approvedBy?: string;
  createdAt?: string;
  initiatedAt?: string;
  approvedAt?: string;
  completedAt?: string;
}

export interface PromotionCampaign {
  id: string;
  title: string;
  code?: string;
  type: 'FLASH_SALE' | 'SEASONAL' | 'CATEGORY_DEAL' | 'BUNDLE' | 'CART_TIER';
  discountType: 'PERCENT' | 'FLAT' | 'BUY_X_GET_Y';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  targetCategory?: string;
  targetSkus?: string[];
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'ARCHIVED';
  usageCount: number;
  usageLimit?: number;
  bannerImage?: string;
  tagline?: string;
}

export interface GiftCardRecord {
  id: string;
  cardNumber: string;
  initialBalance: number;
  currentBalance: number;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  expiryDate: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'DEACTIVATED';
  createdAt: string;
  redemptionHistory: Array<{
    orderId: string;
    amountUsed: number;
    timestamp: string;
  }>;
}

export interface LoyaltyAccount {
  customerId: string;
  customerName: string;
  tier: 'STANDARD' | 'PRO_TIER' | 'ENTERPRISE_VIP';
  pointsBalance: number;
  lifetimePointsEarned: number;
  tierProgress: number;
  pointHistory: Array<{
    id: string;
    type: 'EARNED' | 'REDEEMED' | 'MANUAL_ADJUSTMENT' | 'EXPIRED';
    points: number;
    orderId?: string;
    reason: string;
    timestamp: string;
  }>;
}

export interface SellerRecord {
  id: string;
  name: string;
  brand: string;
  rating: number;
  status: 'VERIFIED' | 'PENDING_AUDIT' | 'SUSPENDED';
  activeProductsCount: number;
  fulfillmentScore: number;
  commissionRatePercent: number;
  joinedDate: string;
  contactEmail: string;
  city: string;
}

export interface BusinessRule {
  id: string;
  key: string;
  category: 'PRIORITY' | 'ALLOCATION' | 'REORDER' | 'RETURNS' | 'FULFILLMENT' | 'SECURITY';
  name: string;
  description: string;
  value: any;
  valueType: 'number' | 'boolean' | 'string' | 'json';
  lastModifiedBy: string;
  lastModifiedAt: string;
  isSystemCritical: boolean;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  environment: 'PRODUCTION' | 'STAGING' | 'DEV';
  updatedAt: string;
}

export interface SecuritySession {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  loginTime: string;
  lastActiveTime: string;
  isCurrent: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'FLAGGED';
}

export interface NotificationTemplate {
  id: string;
  key: string;
  name: string;
  channel: 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH';
  subject: string;
  body: string;
  availableVariables: string[];
  isActive: boolean;
  lastEdited: string;
}

export interface CategorySchema {
  id: string;
  categoryName: string;
  iconName: string;
  customAttributeFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'select' | 'number';
    options?: string[];
    required: boolean;
  }>;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  demandSurgePercent: number;
  stockReductionPercent: number;
  carrierDelayHours: number;
  estimatedAffectedOrders: number;
  estimatedStockouts: number;
  recommendedIntervention: string;
}

