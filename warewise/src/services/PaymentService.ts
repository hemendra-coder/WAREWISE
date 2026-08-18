/**
 * PaymentService
 * Manages payment processing, validation, and state tracking
 */

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: 'CARD' | 'UPI' | 'WALLET' | 'NET_BANKING' | 'EMI';
  status: PaymentStatus;
  transactionId?: string;
  timestamp: string;
  retryCount: number;
  lastError?: string;
}

export interface PaymentValidation {
  valid: boolean;
  errors: string[];
}

export class PaymentService {
  /**
   * Validate payment details
   */
  static validatePayment(params: {
    orderId: string;
    amount: number;
    method: string;
    currency: string;
  }): PaymentValidation {
    const errors: string[] = [];

    // Validate order ID
    if (!params.orderId || params.orderId.trim() === '') {
      errors.push('Order ID is required');
    }

    // Validate amount
    if (typeof params.amount !== 'number' || params.amount <= 0) {
      errors.push('Amount must be a positive number');
    }

    // Validate currency
    if (!params.currency || params.currency.trim() === '') {
      errors.push('Currency is required');
    }

    // Validate method
    const validMethods = ['CARD', 'UPI', 'WALLET', 'NET_BANKING', 'EMI'];
    if (!validMethods.includes(params.method)) {
      errors.push(`Invalid payment method: ${params.method}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check duplicate payment protection
   */
  static checkDuplicatePayment(
    orderId: string,
    amount: number,
    existingPayments: Payment[],
    minuteWindow: number = 5,
  ): { isDuplicate: boolean; reason?: string } {
    const now = new Date();
    const windowStart = new Date(now.getTime() - minuteWindow * 60 * 1000);

    const recentPayments = existingPayments.filter((p) => {
      const paymentTime = new Date(p.timestamp);
      return p.orderId === orderId && p.status === 'SUCCESS' && paymentTime >= windowStart;
    });

    if (recentPayments.length === 0) {
      return { isDuplicate: false };
    }

    // Check if amount matches
    const matchingAmount = recentPayments.some((p) => Math.abs(p.amount - amount) < 0.01);

    if (matchingAmount) {
      return {
        isDuplicate: true,
        reason: `Payment of ${amount} already processed for order ${orderId} within the last ${minuteWindow} minutes`,
      };
    }

    return { isDuplicate: false };
  }

  /**
   * Process payment retry
   */
  static canRetry(payment: Payment, maxRetries: number = 3): boolean {
    return payment.status === 'FAILED' && payment.retryCount < maxRetries;
  }

  /**
   * Validate refund eligibility
   */
  static canBeRefunded(payment: Payment): { eligible: boolean; reason?: string } {
    if (payment.status !== 'SUCCESS') {
      return {
        eligible: false,
        reason: `Payment status is ${payment.status}, only SUCCESS payments can be refunded`,
      };
    }

    return { eligible: true };
  }

  /**
   * Generate transaction ID
   */
  static generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Generate payment ID
   */
  static generatePaymentId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    return `PAY-${timestamp}-${random}`;
  }

  /**
   * Mask sensitive payment info for logging/display
   */
  static maskSensitiveInfo(info: string): string {
    if (info.length <= 4) return '****';
    if (info.length === 16) {
      return info.substring(0, 2) + '*'.repeat(14) + info.substring(info.length - 4, info.length - 2);
    }
    return info.substring(0, 2) + '*'.repeat(Math.max(0, info.length - 4)) + info.substring(info.length - 2);
  }
}
