/**
 * FinanceService Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FinanceService } from '../services/FinanceService';
import { Order, RefundRecord } from '../types';

describe('FinanceService', () => {
  let mockOrders: Order[];
  let mockRefunds: RefundRecord[];

  beforeEach(() => {
    mockOrders = [
      {
        id: 'ORD-001',
        customerId: 'cust-001',
        items: [
          { productId: 'prod-001', sku: 'SKU-001', quantity: 2, pricePerUnit: 500 },
          { productId: 'prod-002', sku: 'SKU-002', quantity: 1, pricePerUnit: 1000 },
        ],
        totalAmount: 2000,
        status: 'DELIVERED',
        shippingAddress: '123 Main St',
        createdAt: new Date().toISOString(),
        slaMinutesRemaining: 0,
        discountApplied: 200,
        customerTier: 'REGULAR',
        paymentStatus: 'COMPLETED',
        fulfillmentStatus: 'DELIVERED',
        allowPartialDelivery: true,
        allocatedItems: [],
        pickedItems: [],
        packedItems: [],
        notes: '',
      },
      {
        id: 'ORD-002',
        customerId: 'cust-002',
        items: [{ productId: 'prod-003', sku: 'SKU-003', quantity: 1, pricePerUnit: 500 }],
        totalAmount: 500,
        status: 'COMPLETED',
        shippingAddress: '456 Oak Ave',
        createdAt: new Date().toISOString(),
        slaMinutesRemaining: 0,
        discountApplied: 0,
        customerTier: 'REGULAR',
        paymentStatus: 'COMPLETED',
        fulfillmentStatus: 'DELIVERED',
        allowPartialDelivery: true,
        allocatedItems: [],
        pickedItems: [],
        packedItems: [],
        notes: '',
      },
    ];

    mockRefunds = [
      {
        id: 'REF-001',
        orderId: 'ORD-001',
        amount: 1000,
        status: 'COMPLETED',
        reason: 'DAMAGED',
        initiatedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        paymentMethod: 'CARD',
      },
    ];
  });

  describe('calculateGrossSales', () => {
    it('calculates gross sales from delivered orders', () => {
      const sales = FinanceService.calculateGrossSales(mockOrders);
      expect(sales).toBe(2500); // 2000 + 500
    });

    it('excludes undelivered orders', () => {
      const undeliveredOrder = {
        ...mockOrders[0],
        status: 'PICKING' as const,
      };

      const sales = FinanceService.calculateGrossSales([...mockOrders, undeliveredOrder]);
      expect(sales).toBe(2500); // Still excludes the PICKING order
    });

    it('returns 0 for no delivered orders', () => {
      const createdOrder = {
        ...mockOrders[0],
        status: 'CREATED' as const,
      };

      const sales = FinanceService.calculateGrossSales([createdOrder]);
      expect(sales).toBe(0);
    });
  });

  describe('calculateDiscounts', () => {
    it('calculates total discounts from delivered orders', () => {
      const discounts = FinanceService.calculateDiscounts(mockOrders);
      expect(discounts).toBe(200); // Only ORD-001 has discount
    });
  });

  describe('calculateRefunds', () => {
    it('calculates total completed refunds', () => {
      const refunds = FinanceService.calculateRefunds(mockRefunds);
      expect(refunds).toBe(1000);
    });

    it('excludes incomplete refunds', () => {
      const pendingRefund = {
        ...mockRefunds[0],
        status: 'PROCESSING' as const,
      };

      const refunds = FinanceService.calculateRefunds([...mockRefunds, pendingRefund]);
      expect(refunds).toBe(1000); // Still excludes PROCESSING refund
    });

    it('returns 0 for no refunds', () => {
      const refunds = FinanceService.calculateRefunds([]);
      expect(refunds).toBe(0);
    });
  });

  describe('calculateNetSales', () => {
    it('calculates net sales correctly', () => {
      const netSales = FinanceService.calculateNetSales(2500, 200, 1000);
      expect(netSales).toBe(1300); // 2500 - 200 - 1000
    });
  });

  describe('calculateCOGS', () => {
    it('calculates COGS as percentage of order value', () => {
      const cogs = FinanceService.calculateCOGS(mockOrders);
      // 2500 * 0.4 = 1000
      expect(cogs).toBe(1000);
    });
  });

  describe('calculateGrossProfit', () => {
    it('calculates gross profit correctly', () => {
      const profit = FinanceService.calculateGrossProfit(1300, 1000);
      expect(profit).toBe(300);
    });
  });

  describe('calculateNetMarginPercent', () => {
    it('calculates net margin percentage', () => {
      const margin = FinanceService.calculateNetMarginPercent(1000, 300);
      expect(margin).toBe(30);
    });

    it('returns 0 for zero sales', () => {
      const margin = FinanceService.calculateNetMarginPercent(0, 100);
      expect(margin).toBe(0);
    });
  });

  describe('generateSummary', () => {
    it('generates complete financial summary', () => {
      const summary = FinanceService.generateSummary(mockOrders, mockRefunds);

      expect(summary.grossSales).toBe(2500);
      expect(summary.discounts).toBe(200);
      expect(summary.refunds).toBe(1000);
      expect(summary.netSales).toBe(1300);
      expect(summary.cogs).toBe(1000);
      expect(summary.grossProfit).toBe(300);
      expect(summary.netMarginPercent).toBe(23.08);
    });
  });

  describe('calculatePayoutState', () => {
    it('calculates payout state', () => {
      const state = FinanceService.calculatePayoutState(mockOrders, []);

      expect(state.totalAmount).toBe(2500);
      expect(state.pendingAmount).toBe(2500);
      expect(state.completedAmount).toBe(0);
    });

    it('accounts for completed payouts', () => {
      const completedPayouts = [{ status: 'COMPLETED', amount: 1000 }];
      const state = FinanceService.calculatePayoutState(mockOrders, completedPayouts);

      expect(state.completedAmount).toBe(1000);
      expect(state.pendingAmount).toBe(1500);
    });
  });

  describe('validateTransaction', () => {
    it('validates correct transaction', () => {
      const result = FinanceService.validateTransaction({
        amount: 1000,
        type: 'SALE',
        reference: 'ORD-001',
      });

      expect(result.valid).toBe(true);
    });

    it('rejects zero amount', () => {
      const result = FinanceService.validateTransaction({
        amount: 0,
        type: 'SALE',
        reference: 'ORD-001',
      });

      expect(result.valid).toBe(false);
    });

    it('rejects negative amount', () => {
      const result = FinanceService.validateTransaction({
        amount: -100,
        type: 'SALE',
        reference: 'ORD-001',
      });

      expect(result.valid).toBe(false);
    });

    it('rejects missing reference', () => {
      const result = FinanceService.validateTransaction({
        amount: 1000,
        type: 'SALE',
        reference: '',
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('detectAnomalies', () => {
    it('detects high refund rate', () => {
      const ordersWithManyRefunds = [
        ...mockOrders,
        { ...mockOrders[0], status: 'RETURNED' as const },
        { ...mockOrders[1], status: 'RETURNED' as const },
      ];

      const anomalies = FinanceService.detectAnomalies(ordersWithManyRefunds);

      expect(anomalies.some((a) => a.type === 'HIGH_REFUND_RATE')).toBe(true);
    });

    it('detects large single transaction', () => {
      const largeOrder = {
        ...mockOrders[0],
        totalAmount: 600000,
      };

      const anomalies = FinanceService.detectAnomalies([largeOrder]);

      expect(anomalies.some((a) => a.type === 'LARGE_TRANSACTION')).toBe(true);
    });
  });

  describe('calculateRefundImpact', () => {
    it('calculates financial impact of refund', () => {
      const impact = FinanceService.calculateRefundImpact(1000, 5000, 2000);

      expect(impact.newNetSales).toBe(4000);
      expect(impact.newGrossProfit).toBe(1000);
      expect(impact.impactPercent).toBe(20);
    });
  });
});
