/**
 * FinanceService
 * Handles financial calculations, reconciliation, and reporting
 */

import { Order, RefundRecord } from '../types';

export interface FinancialSummary {
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  cogs: number;
  grossProfit: number;
  netMarginPercent: number;
  pendingRefunds: number;
}

export interface PayoutState {
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  failedAmount: number;
  nextPayoutDate: string;
}

export class FinanceService {
  /**
   * Calculate gross sales from orders
   */
  static calculateGrossSales(orders: Order[]): number {
    return orders
      .filter((o) => ['DELIVERED', 'COMPLETED', 'RETURNED', 'REFUND_PROCESSED'].includes(o.status))
      .reduce((sum, order) => sum + order.totalAmount, 0);
  }

  /**
   * Calculate total discounts applied
   */
  static calculateDiscounts(orders: Order[]): number {
    return orders
      .filter((o) => ['DELIVERED', 'COMPLETED', 'RETURNED', 'REFUND_PROCESSED'].includes(o.status))
      .reduce((sum, order) => sum + (order.discountAmount || order.discountApplied || 0), 0);
  }

  /**
   * Calculate total refunds processed
   */
  static calculateRefunds(refunds: RefundRecord[]): number {
    return refunds
      .filter((r) => r.status === 'COMPLETED')
      .reduce((sum, refund) => sum + refund.amount, 0);
  }

  /**
   * Calculate net sales
   */
  static calculateNetSales(grossSales: number, discounts: number, refunds: number): number {
    return grossSales - discounts - refunds;
  }

  /**
   * Calculate COGS (Cost of Goods Sold)
   */
  static calculateCOGS(orders: Order[]): number {
    return orders
      .filter((o) => ['DELIVERED', 'COMPLETED', 'RETURNED', 'REFUND_PROCESSED'].includes(o.status))
      .reduce((sum, order) => {
        const cogs = order.items.reduce((itemSum, item) => {
          const pricePerUnit = item.pricePerUnit ?? item.price;
          const costPerUnit = pricePerUnit * 0.4; // Assume 40% of retail is cost
          return itemSum + costPerUnit * item.quantity;
        }, 0);
        return sum + cogs;
      }, 0);
  }

  /**
   * Calculate gross profit
   */
  static calculateGrossProfit(netSales: number, cogs: number): number {
    return netSales - cogs;
  }

  /**
   * Calculate net margin percentage
   */
  static calculateNetMarginPercent(netSales: number, grossProfit: number): number {
    if (netSales === 0) return 0;
    return Math.round((grossProfit / netSales) * 100 * 100) / 100; // 2 decimal places
  }

  /**
   * Generate financial summary
   */
  static generateSummary(orders: Order[], refunds: RefundRecord[]): FinancialSummary {
    const grossSales = this.calculateGrossSales(orders);
    const discounts = this.calculateDiscounts(orders);
    const processedRefunds = this.calculateRefunds(refunds);
    const netSales = this.calculateNetSales(grossSales, discounts, processedRefunds);
    const cogs = this.calculateCOGS(orders);
    const grossProfit = this.calculateGrossProfit(netSales, cogs);
    const netMarginPercent = this.calculateNetMarginPercent(netSales, grossProfit);

    // Calculate pending refunds
    const pendingRefunds = refunds
      .filter((r) => ['INITIATED', 'APPROVED', 'PROCESSING'].includes(r.status))
      .reduce((sum, refund) => sum + refund.amount, 0);

    return {
      grossSales,
      discounts,
      refunds: processedRefunds,
      netSales,
      cogs,
      grossProfit,
      netMarginPercent,
      pendingRefunds,
    };
  }

  /**
   * Calculate payout state
   */
  static calculatePayoutState(orders: Order[], completedPayouts: any[] = []): PayoutState {
    const totalAmount = this.calculateGrossSales(orders);

    // Calculate completed payouts
    const completedAmount = completedPayouts
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, payout) => sum + payout.amount, 0);

    // Calculate pending payouts
    const pendingAmount = totalAmount - completedAmount;

    // Assume failed payouts is 0 for now
    const failedAmount = 0;

    // Next payout is typically weekly, so 7 days from now
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(nextPayoutDate.getDate() + 7);

    return {
      totalAmount,
      pendingAmount,
      completedAmount,
      failedAmount,
      nextPayoutDate: nextPayoutDate.toISOString(),
    };
  }

  /**
   * Validate financial transaction
   */
  static validateTransaction(params: {
    amount: number;
    type: 'SALE' | 'REFUND' | 'DISCOUNT' | 'ADJUSTMENT';
    reference: string;
  }): { valid: boolean; error?: string } {
    if (params.amount <= 0) {
      return { valid: false, error: 'Amount must be positive' };
    }

    if (!params.reference || params.reference.trim() === '') {
      return { valid: false, error: 'Transaction reference is required' };
    }

    return { valid: true };
  }

  /**
   * Detect financial anomalies
   */
  static detectAnomalies(orders: Order[]): Array<{ type: string; message: string; severity: 'WARNING' | 'CRITICAL' }> {
    const anomalies: Array<{ type: string; message: string; severity: 'WARNING' | 'CRITICAL' }> = [];

    // Check for unusually high refund rates
    const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
    const refundedOrders = orders.filter((o) => ['RETURNED', 'REFUND_PROCESSED'].includes(o.status)).length;

    if (deliveredOrders > 0 && refundedOrders / deliveredOrders > 0.2) {
      anomalies.push({
        type: 'HIGH_REFUND_RATE',
        message: `Refund rate is ${((refundedOrders / deliveredOrders) * 100).toFixed(1)}%, exceeds 20% threshold`,
        severity: 'WARNING',
      });
    }

    // Check for negative margin
    const summary = this.generateSummary(orders, []);
    if (summary.netMarginPercent < 0) {
      anomalies.push({
        type: 'NEGATIVE_MARGIN',
        message: `Net margin is negative (${summary.netMarginPercent}%), indicating losses`,
        severity: 'CRITICAL',
      });
    }

    // Check for large single transactions
    const largeOrder = orders.find((o) => o.totalAmount > 500000);
    if (largeOrder) {
      anomalies.push({
        type: 'LARGE_TRANSACTION',
        message: `Order ${largeOrder.id} is unusually large (₹${largeOrder.totalAmount}), verify legitimacy`,
        severity: 'WARNING',
      });
    }

    return anomalies;
  }

  /**
   * Calculate refund impact on financials
   */
  static calculateRefundImpact(
    refundAmount: number,
    currentNetSales: number,
    currentGrossProfit: number,
  ): {
    newNetSales: number;
    newGrossProfit: number;
    impactPercent: number;
  } {
    const newNetSales = currentNetSales - refundAmount;
    const newGrossProfit = currentGrossProfit - refundAmount;
    const impactPercent = Math.round((refundAmount / currentNetSales) * 100 * 100) / 100;

    return {
      newNetSales,
      newGrossProfit,
      impactPercent,
    };
  }
}
