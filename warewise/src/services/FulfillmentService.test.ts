/**
 * FulfillmentService Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FulfillmentService } from '../services/FulfillmentService';
import { Order } from '../types';

describe('FulfillmentService', () => {
  let mockOrder: Order;

  beforeEach(() => {
    mockOrder = {
      id: 'ORD-001',
      customerId: 'cust-001',
      items: [
        { productId: 'prod-001', sku: 'SKU-001', quantity: 2, pricePerUnit: 1000 },
        { productId: 'prod-002', sku: 'SKU-002', quantity: 1, pricePerUnit: 500 },
      ],
      totalAmount: 2500,
      status: 'ALLOCATED',
      shippingAddress: '123 Main St',
      createdAt: new Date().toISOString(),
      slaMinutesRemaining: 60,
      discountApplied: 0,
      customerTier: 'REGULAR',
      paymentStatus: 'COMPLETED',
      fulfillmentStatus: 'ALLOCATED',
      allowPartialDelivery: true,
      allocatedItems: [
        { productId: 'prod-001', quantity: 2 },
        { productId: 'prod-002', quantity: 1 },
      ],
      pickedItems: [],
      packedItems: [],
      notes: '',
    };
  });

  describe('canStartPicking', () => {
    it('allows picking for ALLOCATED order', () => {
      const result = FulfillmentService.canStartPicking(mockOrder);
      expect(result.canStart).toBe(true);
    });

    it('disallows picking for PICKING order', () => {
      const result = FulfillmentService.canStartPicking({ ...mockOrder, status: 'PICKING' });
      expect(result.canStart).toBe(false);
    });

    it('disallows picking for CREATED order', () => {
      const result = FulfillmentService.canStartPicking({ ...mockOrder, status: 'CREATED' });
      expect(result.canStart).toBe(false);
    });
  });

  describe('validatePickingCompletion', () => {
    it('validates correct picking completion', () => {
      const result = FulfillmentService.validatePickingCompletion({
        orderId: 'ORD-001',
        pickedItems: [
          { productId: 'prod-001', pickedQty: 2, allocatedQty: 2 },
          { productId: 'prod-002', pickedQty: 1, allocatedQty: 1 },
        ],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects picking more than allocated', () => {
      const result = FulfillmentService.validatePickingCompletion({
        orderId: 'ORD-001',
        pickedItems: [{ productId: 'prod-001', pickedQty: 3, allocatedQty: 2 }],
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Cannot pick'))).toBe(true);
    });

    it('rejects zero picked quantity', () => {
      const result = FulfillmentService.validatePickingCompletion({
        orderId: 'ORD-001',
        pickedItems: [{ productId: 'prod-001', pickedQty: 0, allocatedQty: 2 }],
      });

      expect(result.valid).toBe(false);
    });

    it('rejects non-integer quantities', () => {
      const result = FulfillmentService.validatePickingCompletion({
        orderId: 'ORD-001',
        pickedItems: [{ productId: 'prod-001', pickedQty: 1.5, allocatedQty: 2 }],
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('canStartPacking', () => {
    it('allows packing for PICKED order', () => {
      const result = FulfillmentService.canStartPacking({ ...mockOrder, status: 'PICKED' });
      expect(result.canStart).toBe(true);
    });

    it('disallows packing for ALLOCATED order', () => {
      const result = FulfillmentService.canStartPacking(mockOrder);
      expect(result.canStart).toBe(false);
    });

    it('disallows packing for PACKING order', () => {
      const result = FulfillmentService.canStartPacking({ ...mockOrder, status: 'PACKING' });
      expect(result.canStart).toBe(false);
    });
  });

  describe('validatePackingCompletion', () => {
    it('validates correct packing completion', () => {
      const result = FulfillmentService.validatePackingCompletion({
        orderId: 'ORD-001',
        cartonType: 'MEDIUM_BOX',
        weightKg: 2.5,
        dimensions: { length: 20, width: 15, height: 10 },
      });

      expect(result.valid).toBe(true);
    });

    it('rejects invalid carton type', () => {
      const result = FulfillmentService.validatePackingCompletion({
        orderId: 'ORD-001',
        cartonType: 'INVALID_BOX',
        weightKg: 2.5,
      });

      expect(result.valid).toBe(false);
    });

    it('rejects zero weight', () => {
      const result = FulfillmentService.validatePackingCompletion({
        orderId: 'ORD-001',
        cartonType: 'MEDIUM_BOX',
        weightKg: 0,
      });

      expect(result.valid).toBe(false);
    });

    it('accepts packing without dimensions', () => {
      const result = FulfillmentService.validatePackingCompletion({
        orderId: 'ORD-001',
        cartonType: 'SMALL_BOX',
        weightKg: 1.0,
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('canStartQC', () => {
    it('allows QC for PACKED order', () => {
      const result = FulfillmentService.canStartQC({ ...mockOrder, status: 'PACKED' });
      expect(result.canStart).toBe(true);
    });

    it('disallows QC for PACKING order', () => {
      const result = FulfillmentService.canStartQC({ ...mockOrder, status: 'PACKING' });
      expect(result.canStart).toBe(false);
    });
  });

  describe('validateQCResult', () => {
    it('validates correct PASS result', () => {
      const result = FulfillmentService.validateQCResult({
        orderId: 'ORD-001',
        status: 'PASS',
        passedItems: 3,
        failedItems: 0,
        totalItems: 3,
      });

      expect(result.valid).toBe(true);
    });

    it('validates correct FAIL result', () => {
      const result = FulfillmentService.validateQCResult({
        orderId: 'ORD-001',
        status: 'FAIL',
        passedItems: 2,
        failedItems: 1,
        totalItems: 3,
        issues: ['Item 1 damaged'],
      });

      expect(result.valid).toBe(true);
    });

    it('rejects FAIL with no failed items', () => {
      const result = FulfillmentService.validateQCResult({
        orderId: 'ORD-001',
        status: 'FAIL',
        passedItems: 3,
        failedItems: 0,
        totalItems: 3,
      });

      expect(result.valid).toBe(false);
    });

    it('rejects PASS with failed items', () => {
      const result = FulfillmentService.validateQCResult({
        orderId: 'ORD-001',
        status: 'PASS',
        passedItems: 2,
        failedItems: 1,
        totalItems: 3,
      });

      expect(result.valid).toBe(false);
    });

    it('rejects mismatched item counts', () => {
      const result = FulfillmentService.validateQCResult({
        orderId: 'ORD-001',
        status: 'PASS',
        passedItems: 2,
        failedItems: 0,
        totalItems: 3,
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('canDispatch', () => {
    it('allows dispatch for READY_FOR_DISPATCH order', () => {
      const result = FulfillmentService.canDispatch({ ...mockOrder, status: 'READY_FOR_DISPATCH' });
      expect(result.canDispatch).toBe(true);
    });

    it('disallows dispatch for PACKED order', () => {
      const result = FulfillmentService.canDispatch({ ...mockOrder, status: 'PACKED' });
      expect(result.canDispatch).toBe(false);
    });
  });

  describe('validateDispatchInfo', () => {
    it('validates correct dispatch information', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const result = FulfillmentService.validateDispatchInfo({
        orderId: 'ORD-001',
        carrier: 'FEDEX',
        trackingNumber: 'FDX123456789',
        estimatedDeliveryDate: futureDate.toISOString(),
      });

      expect(result.valid).toBe(true);
    });

    it('rejects past delivery date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const result = FulfillmentService.validateDispatchInfo({
        orderId: 'ORD-001',
        carrier: 'FEDEX',
        trackingNumber: 'FDX123456789',
        estimatedDeliveryDate: pastDate.toISOString(),
      });

      expect(result.valid).toBe(false);
    });

    it('rejects missing tracking number', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const result = FulfillmentService.validateDispatchInfo({
        orderId: 'ORD-001',
        carrier: 'FEDEX',
        trackingNumber: '',
        estimatedDeliveryDate: futureDate.toISOString(),
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('calculateFulfillmentTime', () => {
    it('calculates elapsed time correctly', () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 2); // 2 hours ago

      const result = FulfillmentService.calculateFulfillmentTime(pastTime.toISOString(), 'PICKING');

      expect(result.elapsedHours).toBeGreaterThanOrEqual(1);
      expect(result.stageName).toBe('Picking');
    });
  });

  describe('checkSLACompliance', () => {
    it('checks SLA compliance when time remaining', () => {
      const result = FulfillmentService.checkSLACompliance({ ...mockOrder, slaMinutesRemaining: 60 });

      expect(result.compliant).toBe(true);
      expect(result.hoursRemaining).toBe(1);
    });

    it('detects SLA breach', () => {
      const result = FulfillmentService.checkSLACompliance({ ...mockOrder, slaMinutesRemaining: -30 });

      expect(result.compliant).toBe(false);
      expect(result.hoursRemaining).toBeLessThan(0);
    });

    it('handles missing SLA', () => {
      const result = FulfillmentService.checkSLACompliance({ ...mockOrder, slaMinutesRemaining: 0 });

      expect(result.compliant).toBe(true);
    });
  });

  describe('identifyBottlenecks', () => {
    it('identifies stages with high average time', () => {
      const orders: Order[] = [
        { ...mockOrder, status: 'PICKING', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { ...mockOrder, status: 'PICKING', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
        { ...mockOrder, status: 'PACKING', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      ];

      const bottlenecks = FulfillmentService.identifyBottlenecks(orders);

      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks[0].stage).toBeDefined();
      expect(bottlenecks[0].avgTimeHours).toBeGreaterThan(0);
    });

    it('returns empty array for no orders', () => {
      const bottlenecks = FulfillmentService.identifyBottlenecks([]);
      expect(bottlenecks).toHaveLength(0);
    });
  });
});
