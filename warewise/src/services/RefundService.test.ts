/**
 * RefundService Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { RefundService, RefundStatus } from '../services/RefundService';
import { RefundRecord } from '../types';

describe('RefundService', () => {
  describe('validateRefund', () => {
    it('validates correct refund request', () => {
      const result = RefundService.validateRefund({
        orderId: 'ORD-001',
        amount: 1000,
        reason: 'DAMAGED',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects missing order ID', () => {
      const result = RefundService.validateRefund({
        orderId: '',
        amount: 1000,
        reason: 'DAMAGED',
      });

      expect(result.valid).toBe(false);
    });

    it('rejects zero amount', () => {
      const result = RefundService.validateRefund({
        orderId: 'ORD-001',
        amount: 0,
        reason: 'DAMAGED',
      });

      expect(result.valid).toBe(false);
    });

    it('rejects invalid reason', () => {
      const result = RefundService.validateRefund({
        orderId: 'ORD-001',
        amount: 1000,
        reason: 'INVALID_REASON',
      });

      expect(result.valid).toBe(false);
    });

    it('accepts all valid reasons', () => {
      const validReasons = ['DAMAGED', 'DEFECTIVE', 'NOT_AS_DESCRIBED', 'WRONG_ITEM', 'CHANGED_MIND', 'RETURN_ACCEPTED'];

      validReasons.forEach((reason) => {
        const result = RefundService.validateRefund({
          orderId: 'ORD-001',
          amount: 1000,
          reason,
        });

        expect(result.valid).toBe(true);
      });
    });
  });

  describe('checkDuplicateRefund', () => {
    it('detects duplicate refund within time window', () => {
      const existingRefund: RefundRecord = {
        id: 'REF-001',
        orderId: 'ORD-001',
        amount: 1000,
        status: 'PROCESSING',
        reason: 'DAMAGED',
        initiatedAt: new Date().toISOString(),
        approvedAt: '',
        completedAt: '',
        paymentMethod: 'CARD',
      };

      const result = RefundService.checkDuplicateRefund('ORD-001', [existingRefund], 5);

      expect(result.isDuplicate).toBe(true);
    });

    it('returns no duplicate if different order', () => {
      const existingRefund: RefundRecord = {
        id: 'REF-001',
        orderId: 'ORD-001',
        amount: 1000,
        status: 'COMPLETED',
        reason: 'DAMAGED',
        initiatedAt: new Date().toISOString(),
        approvedAt: '',
        completedAt: '',
        paymentMethod: 'CARD',
      };

      const result = RefundService.checkDuplicateRefund('ORD-002', [existingRefund], 5);

      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('validatePartialRefund', () => {
    it('validates partial refund within bounds', () => {
      const result = RefundService.validatePartialRefund({
        fullOrderAmount: 1000,
        refundAmount: 500,
        reason: 'DAMAGED',
      });

      expect(result.valid).toBe(true);
    });

    it('rejects refund exceeding order total', () => {
      const result = RefundService.validatePartialRefund({
        fullOrderAmount: 1000,
        refundAmount: 1500,
        reason: 'DAMAGED',
      });

      expect(result.valid).toBe(false);
    });

    it('rejects zero refund', () => {
      const result = RefundService.validatePartialRefund({
        fullOrderAmount: 1000,
        refundAmount: 0,
        reason: 'DAMAGED',
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('canTransition', () => {
    it('allows INITIATED to APPROVED', () => {
      expect(RefundService.canTransition('INITIATED', 'APPROVED')).toBe(true);
    });

    it('allows APPROVED to PROCESSING', () => {
      expect(RefundService.canTransition('APPROVED', 'PROCESSING')).toBe(true);
    });

    it('allows PROCESSING to COMPLETED', () => {
      expect(RefundService.canTransition('PROCESSING', 'COMPLETED')).toBe(true);
    });

    it('allows FAILED to PROCESSING (retry)', () => {
      expect(RefundService.canTransition('FAILED', 'PROCESSING')).toBe(true);
    });

    it('disallows COMPLETED to other states', () => {
      expect(RefundService.canTransition('COMPLETED', 'INITIATED')).toBe(false);
    });

    it('disallows REJECTED to other states', () => {
      expect(RefundService.canTransition('REJECTED', 'PROCESSING')).toBe(false);
    });
  });

  describe('isWithinRefundWindow', () => {
    it('detects refund within 30-day window', () => {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() - 10); // 10 days ago
      const result = RefundService.isWithinRefundWindow(deliveryDate.toISOString(), 30);

      expect(result.withinWindow).toBe(true);
      expect(result.daysRemaining).toBeGreaterThan(0);
    });

    it('detects refund outside 30-day window', () => {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() - 35); // 35 days ago
      const result = RefundService.isWithinRefundWindow(deliveryDate.toISOString(), 30);

      expect(result.withinWindow).toBe(false);
    });
  });

  describe('calculateRestockingFee', () => {
    it('charges restocking fee for normal reason', () => {
      const result = RefundService.calculateRestockingFee(1000, 'CHANGED_MIND', 10);

      expect(result.requiresFee).toBe(true);
      expect(result.feeAmount).toBe(100);
      expect(result.netRefund).toBe(900);
    });

    it('waives fee for defective items', () => {
      const result = RefundService.calculateRestockingFee(1000, 'DEFECTIVE', 10);

      expect(result.requiresFee).toBe(false);
      expect(result.feeAmount).toBe(0);
      expect(result.netRefund).toBe(1000);
    });

    it('waives fee for damaged items', () => {
      const result = RefundService.calculateRestockingFee(1000, 'DAMAGED', 10);

      expect(result.requiresFee).toBe(false);
      expect(result.netRefund).toBe(1000);
    });

    it('waives fee for wrong item', () => {
      const result = RefundService.calculateRestockingFee(1000, 'WRONG_ITEM', 10);

      expect(result.requiresFee).toBe(false);
      expect(result.netRefund).toBe(1000);
    });
  });

  describe('canRequestReturn', () => {
    it('allows return for DELIVERED order', () => {
      const result = RefundService.canRequestReturn('DELIVERED');
      expect(result.eligible).toBe(true);
    });

    it('allows return for COMPLETED order', () => {
      const result = RefundService.canRequestReturn('COMPLETED');
      expect(result.eligible).toBe(true);
    });

    it('disallows return for CREATED order', () => {
      const result = RefundService.canRequestReturn('CREATED');
      expect(result.eligible).toBe(false);
    });

    it('disallows return for PICKING order', () => {
      const result = RefundService.canRequestReturn('PICKING');
      expect(result.eligible).toBe(false);
    });
  });

  describe('generateRefundId', () => {
    it('generates unique refund IDs', () => {
      const id1 = RefundService.generateRefundId();
      const id2 = RefundService.generateRefundId();

      expect(id1).not.toBe(id2);
      expect(id1.startsWith('REF-')).toBe(true);
    });
  });
});
