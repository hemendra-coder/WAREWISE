/**
 * AllocationService Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AllocationService } from '../services/AllocationService';
import { Order, Product } from '../types';

describe('AllocationService', () => {
  let mockOrders: Order[];
  let mockProduct: Product;

  beforeEach(() => {
    mockProduct = {
      id: 'prod-001',
      sku: 'SKU-001',
      name: 'Test Product',
      category: 'Test',
      price: 1000,
      rating: 4.5,
      reviewsCount: 10,
      image: 'https://example.com/image.jpg',
      description: 'Test product',
      specs: {},
      availableStock: 10,
      reservedStock: 5,
      damagedStock: 2,
      incomingStock: 20,
      safetyStock: 5,
      reorderThreshold: 8,
      dailyDemand: 2,
      leadTimeDays: 3,
      binLocation: 'A-01-1',
    };

    mockOrders = [
      {
        id: 'ORD-001',
        customerId: 'cust-001',
        items: [{ productId: 'prod-001', sku: 'SKU-001', quantity: 5, pricePerUnit: 1000 }],
        totalAmount: 5000,
        status: 'INVENTORY_CHECK',
        shippingAddress: '123 Main St',
        createdAt: new Date().toISOString(),
        slaMinutesRemaining: 30, // Urgent
        discountApplied: 0,
        customerTier: 'PREMIUM',
        paymentStatus: 'COMPLETED',
        fulfillmentStatus: 'PENDING',
        allowPartialDelivery: true,
        allocatedItems: [],
        pickedItems: [],
        packedItems: [],
        notes: '',
      },
      {
        id: 'ORD-002',
        customerId: 'cust-002',
        items: [{ productId: 'prod-001', sku: 'SKU-001', quantity: 8, pricePerUnit: 1000 }],
        totalAmount: 8000,
        status: 'INVENTORY_CHECK',
        shippingAddress: '456 Oak Ave',
        createdAt: new Date().toISOString(),
        slaMinutesRemaining: 120, // Less urgent
        discountApplied: 0,
        customerTier: 'REGULAR',
        paymentStatus: 'COMPLETED',
        fulfillmentStatus: 'PENDING',
        allowPartialDelivery: true,
        allocatedItems: [],
        pickedItems: [],
        packedItems: [],
        notes: '',
      },
    ];
  });

  describe('calculateOrderPriority', () => {
    it('prioritizes order with short SLA', () => {
      const urgentOrder = { ...mockOrders[0], slaMinutesRemaining: 30 };
      const normalOrder = { ...mockOrders[1], slaMinutesRemaining: 300 };

      const urgentPriority = AllocationService.calculateOrderPriority(urgentOrder);
      const normalPriority = AllocationService.calculateOrderPriority(normalOrder);

      expect(urgentPriority).toBeGreaterThan(normalPriority);
    });

    it('prioritizes premium customer', () => {
      const premiumOrder = { ...mockOrders[0], customerTier: 'PREMIUM' as const };
      const regularOrder = { ...mockOrders[1], customerTier: 'REGULAR' as const };

      const premiumPriority = AllocationService.calculateOrderPriority(premiumOrder);
      const regularPriority = AllocationService.calculateOrderPriority(regularOrder);

      expect(premiumPriority).toBeGreaterThan(regularPriority);
    });

    it('prioritizes SHORTAGE_FLAGGED status', () => {
      const shortageOrder = { ...mockOrders[0], status: 'SHORTAGE_FLAGGED' as const };
      const normalOrder = { ...mockOrders[1], status: 'INVENTORY_CHECK' as const };

      const shortagePriority = AllocationService.calculateOrderPriority(shortageOrder);
      const normalPriority = AllocationService.calculateOrderPriority(normalOrder);

      expect(shortagePriority).toBeGreaterThan(normalPriority);
    });
  });

  describe('allocateCompetingOrders', () => {
    it('allocates to highest priority order first', () => {
      const results = AllocationService.allocateCompetingOrders(mockOrders, mockProduct, 10);

      // ORD-001 should get full allocation (higher priority - urgent SLA)
      const ord001Result = results.find((r) => r.orderId === 'ORD-001');
      expect(ord001Result?.status).toBe('FULL');

      // ORD-002 should get no allocation (lower priority and less stock)
      const ord002Result = results.find((r) => r.orderId === 'ORD-002');
      expect(ord002Result?.status).toBe('NONE');
    });

    it('handles partial allocation', () => {
      const results = AllocationService.allocateCompetingOrders(mockOrders, mockProduct, 7);

      // ORD-001 needs 5, so gets FULL allocation
      const ord001Result = results.find((r) => r.orderId === 'ORD-001');
      expect(ord001Result?.allocatedQty).toBe(5);

      // ORD-002 needs 8, gets PARTIAL with 2
      const ord002Result = results.find((r) => r.orderId === 'ORD-002');
      expect(ord002Result?.allocatedQty).toBe(2);
      expect(ord002Result?.status).toBe('PARTIAL');
    });

    it('allocates no stock when zero available', () => {
      const results = AllocationService.allocateCompetingOrders(mockOrders, mockProduct, 0);

      results.forEach((result) => {
        expect(result.status).toBe('NONE');
        expect(result.allocatedQty).toBe(0);
      });
    });
  });

  describe('overrideAllocation', () => {
    it('validates correct override', () => {
      const result = AllocationService.overrideAllocation({
        orderId: 'ORD-001',
        productId: 'prod-001',
        newQty: 5,
        reason: 'Customer priority',
        adminId: 'admin-001',
      });

      expect(result.valid).toBe(true);
    });

    it('rejects negative quantity', () => {
      const result = AllocationService.overrideAllocation({
        orderId: 'ORD-001',
        productId: 'prod-001',
        newQty: -1,
        reason: 'Customer priority',
        adminId: 'admin-001',
      });

      expect(result.valid).toBe(false);
    });

    it('rejects missing reason', () => {
      const result = AllocationService.overrideAllocation({
        orderId: 'ORD-001',
        productId: 'prod-001',
        newQty: 5,
        reason: '',
        adminId: 'admin-001',
      });

      expect(result.valid).toBe(false);
    });

    it('rejects missing admin ID', () => {
      const result = AllocationService.overrideAllocation({
        orderId: 'ORD-001',
        productId: 'prod-001',
        newQty: 5,
        reason: 'Customer priority',
        adminId: '',
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('isPartialAllocationAcceptable', () => {
    it('accepts partial allocation above 50%', () => {
      const result = AllocationService.isPartialAllocationAcceptable(mockOrders[0], 'prod-001', 3, 5);
      expect(result).toBe(true); // 3/5 = 60%
    });

    it('rejects partial allocation below 50%', () => {
      const result = AllocationService.isPartialAllocationAcceptable(mockOrders[0], 'prod-001', 2, 5);
      expect(result).toBe(false); // 2/5 = 40%
    });

    it('rejects zero allocation', () => {
      const result = AllocationService.isPartialAllocationAcceptable(mockOrders[0], 'prod-001', 0, 5);
      expect(result).toBe(false);
    });

    it('rejects when order doesn\'t allow partial delivery', () => {
      const noPartialOrder = { ...mockOrders[0], allowPartialDelivery: false };
      const result = AllocationService.isPartialAllocationAcceptable(noPartialOrder, 'prod-001', 3, 5);
      expect(result).toBe(false);
    });
  });

  describe('suggestReallocations', () => {
    it('suggests reallocation from lower-priority orders', () => {
      const allOrders = [
        mockOrders[0],
        { ...mockOrders[1], status: 'PICKING' as const, slaMinutesRemaining: 300 },
      ];

      const suggestions = AllocationService.suggestReallocations(mockOrders[0], mockProduct, 5, allOrders);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].transferableQty).toBeGreaterThan(0);
    });

    it('returns empty array when no donors available', () => {
      const suggestions = AllocationService.suggestReallocations(mockOrders[0], mockProduct, 5, [mockOrders[0]]);

      expect(suggestions).toHaveLength(0);
    });
  });

  describe('calculateEfficiency', () => {
    it('calculates 100% for all full allocations', () => {
      const efficiency = AllocationService.calculateEfficiency(5, 5, 0);
      expect(efficiency).toBe(100);
    });

    it('calculates 50% for all partial allocations', () => {
      const efficiency = AllocationService.calculateEfficiency(5, 0, 5);
      expect(efficiency).toBe(50);
    });

    it('calculates mixed efficiency', () => {
      const efficiency = AllocationService.calculateEfficiency(4, 2, 2); // 2 full + 2 partial
      // (2*100 + 2*50) / (4*100) = 300/400 = 75
      expect(efficiency).toBe(75);
    });

    it('handles zero orders', () => {
      const efficiency = AllocationService.calculateEfficiency(0, 0, 0);
      expect(efficiency).toBe(100);
    });
  });
});
