/**
 * RefundService
 * Manages refund processing with comprehensive validation and state tracking
 */

import { RefundRecord } from '../types';

export type RefundStatus = 'INITIATED' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface RefundValidation {
  valid: boolean;
  errors: string[];
}

export interface RefundRequest {
  orderId: string;
  amount: number;
  reason: string;
  items?: Array<{ productId: string; quantity: number }>;
}

export class RefundService {
  /**
   * Validate refund request
   */
  static validateRefund(params: RefundRequest): RefundValidation {
    const errors: string[] = [];

    // Validate order ID
    if (!params.orderId || params.orderId.trim() === '') {
      errors.push('Order ID is required');
    }

    // Validate amount
    if (typeof params.amount !== 'number' || params.amount <= 0) {
      errors.push('Refund amount must be a positive number');
    }

    // Validate reason
    if (!params.reason || params.reason.trim() === '') {
      errors.push('Refund reason is required');
    }

    const validReasons = ['DAMAGED', 'DEFECTIVE', 'NOT_AS_DESCRIBED', 'WRONG_ITEM', 'CHANGED_MIND', 'RETURN_ACCEPTED'];
    if (!validReasons.includes(params.reason)) {
      errors.push(`Invalid refund reason: ${params.reason}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check duplicate refund protection
   */
  static checkDuplicateRefund(
    orderId: string,
    existingRefunds: RefundRecord[],
    minuteWindow: number = 5,
  ): { isDuplicate: boolean; existingRefund?: RefundRecord } {
    const now = new Date();
    const windowStart = new Date(now.getTime() - minuteWindow * 60 * 1000);

    const recentRefund = existingRefunds.find((r) => {
      const refundTime = new Date(r.initiatedAt);
      return r.orderId === orderId && (r.status === 'PROCESSING' || r.status === 'COMPLETED') && refundTime >= windowStart;
    });

    if (recentRefund) {
      return { isDuplicate: true, existingRefund: recentRefund };
    }

    return { isDuplicate: false };
  }

  /**
   * Validate partial refund
   */
  static validatePartialRefund(params: {
    fullOrderAmount: number;
    refundAmount: number;
    reason: string;
  }): RefundValidation {
    const errors: string[] = [];

    if (params.refundAmount > params.fullOrderAmount) {
      errors.push(`Refund amount (${params.refundAmount}) cannot exceed order total (${params.fullOrderAmount})`);
    }

    if (params.refundAmount <= 0) {
      errors.push('Refund amount must be greater than 0');
    }

    if (!params.reason || params.reason.trim() === '') {
      errors.push('Refund reason is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Can transition to next status
   */
  static canTransition(currentStatus: RefundStatus, newStatus: RefundStatus): boolean {
    const validTransitions: Record<RefundStatus, RefundStatus[]> = {
      INITIATED: ['APPROVED', 'REJECTED'],
      APPROVED: ['PROCESSING', 'REJECTED'],
      REJECTED: [],
      PROCESSING: ['COMPLETED', 'FAILED'],
      COMPLETED: [],
      FAILED: ['PROCESSING'], // Can retry
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  /**
   * Calculate refund timeline
   */
  static estimateRefundTimeline(paymentMethod: string): {
    estimatedDays: number;
    notes: string;
  } {
    const timelines: Record<string, { estimatedDays: number; notes: string }> = {
      CARD: { estimatedDays: 7, notes: 'Typically 5-7 business days via card issuer' },
      UPI: { estimatedDays: 1, notes: 'Usually processed within 24 hours' },
      WALLET: { estimatedDays: 0, notes: 'Instant refund to wallet' },
      NET_BANKING: { estimatedDays: 3, notes: 'Typically 2-3 business days' },
      EMI: { estimatedDays: 7, notes: 'Depends on EMI provider, usually 5-7 days' },
    };

    return timelines[paymentMethod] || { estimatedDays: 5, notes: 'Estimated 5 business days' };
  }

  /**
   * Generate refund ID
   */
  static generateRefundId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    return `REF-${timestamp}-${random}`;
  }

  /**
   * Can request return for refund
   */
  static canRequestReturn(orderStatus: string): { eligible: boolean; reason?: string } {
    const eligibleStatuses = ['DELIVERED', 'COMPLETED'];

    if (!eligibleStatuses.includes(orderStatus)) {
      return {
        eligible: false,
        reason: `Order status is ${orderStatus}. Returns are only allowed for DELIVERED or COMPLETED orders.`,
      };
    }

    return { eligible: true };
  }

  /**
   * Check refund window (e.g., 30 days from delivery)
   */
  static isWithinRefundWindow(deliveryDate: string, windowDays: number = 30): { withinWindow: boolean; daysRemaining: number } {
    const delivery = new Date(deliveryDate);
    const windowEnd = new Date(delivery.getTime() + windowDays * 24 * 60 * 60 * 1000);
    const now = new Date();

    const daysRemaining = Math.ceil((windowEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    return {
      withinWindow: now <= windowEnd,
      daysRemaining: Math.max(0, daysRemaining),
    };
  }

  /**
   * Validate restocking fee
   */
  static calculateRestockingFee(
    refundAmount: number,
    reason: string,
    chargePercentage: number = 10,
  ): { feeAmount: number; netRefund: number; requiresFee: boolean } {
    // Some reasons don't incur restocking fees
    const noFeeReasons = ['DEFECTIVE', 'DAMAGED', 'WRONG_ITEM'];

    const requiresFee = !noFeeReasons.includes(reason);
    const feeAmount = requiresFee ? Math.round(refundAmount * (chargePercentage / 100) * 100) / 100 : 0;
    const netRefund = refundAmount - feeAmount;

    return {
      feeAmount,
      netRefund,
      requiresFee,
    };
  }
}
