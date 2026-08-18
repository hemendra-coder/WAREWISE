/**
 * PaymentService Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentService, Payment } from '../services/PaymentService';

describe('PaymentService', () => {
  describe('validatePayment', () => {
    it('validates correct payment', () => {
      const result = PaymentService.validatePayment({
        orderId: 'ORD-001',
        amount: 1000,
        method: 'CARD',
        currency: 'INR',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects missing order ID', () => {
      const result = PaymentService.validatePayment({
        orderId: '',
        amount: 1000,
        method: 'CARD',
        currency: 'INR',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Order ID is required');
    });

    it('rejects zero amount', () => {
      const result = PaymentService.validatePayment({
        orderId: 'ORD-001',
        amount: 0,
        method: 'CARD',
        currency: 'INR',
      });

      expect(result.valid).toBe(false);
    });

    it('rejects negative amount', () => {
      const result = PaymentService.validatePayment({
        orderId: 'ORD-001',
        amount: -100,
        method: 'CARD',
        currency: 'INR',
      });

      expect(result.valid).toBe(false);
    });

    it('rejects invalid payment method', () => {
      const result = PaymentService.validatePayment({
        orderId: 'ORD-001',
        amount: 1000,
        method: 'INVALID',
        currency: 'INR',
      });

      expect(result.valid).toBe(false);
    });

    it('accepts all valid payment methods', () => {
      const methods = ['CARD', 'UPI', 'WALLET', 'NET_BANKING', 'EMI'];

      methods.forEach((method) => {
        const result = PaymentService.validatePayment({
          orderId: 'ORD-001',
          amount: 1000,
          method,
          currency: 'INR',
        });

        expect(result.valid).toBe(true);
      });
    });
  });

  describe('checkDuplicatePayment', () => {
    let mockPayment: Payment;

    beforeEach(() => {
      mockPayment = {
        id: 'PAY-001',
        orderId: 'ORD-001',
        amount: 1000,
        currency: 'INR',
        method: 'CARD',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };
    });

    it('detects duplicate payment within time window', () => {
      const result = PaymentService.checkDuplicatePayment('ORD-001', 1000, [mockPayment], 5);

      expect(result.isDuplicate).toBe(true);
    });

    it('returns no duplicate if no recent payments', () => {
      const result = PaymentService.checkDuplicatePayment('ORD-002', 1000, [mockPayment], 5);

      expect(result.isDuplicate).toBe(false);
    });

    it('returns no duplicate if amount differs', () => {
      const result = PaymentService.checkDuplicatePayment('ORD-001', 2000, [mockPayment], 5);

      expect(result.isDuplicate).toBe(false);
    });

    it('returns no duplicate if payment is old', () => {
      const oldPayment = {
        ...mockPayment,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      };

      const result = PaymentService.checkDuplicatePayment('ORD-001', 1000, [oldPayment], 5);

      expect(result.isDuplicate).toBe(false);
    });

    it('returns no duplicate if payment status is not SUCCESS', () => {
      const failedPayment = { ...mockPayment, status: 'FAILED' as const };

      const result = PaymentService.checkDuplicatePayment('ORD-001', 1000, [failedPayment], 5);

      expect(result.isDuplicate).toBe(false);
    });
  });

  describe('canRetry', () => {
    it('allows retry for failed payment below max retries', () => {
      const payment: Payment = {
        id: 'PAY-001',
        orderId: 'ORD-001',
        amount: 1000,
        currency: 'INR',
        method: 'CARD',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        retryCount: 1,
      };

      expect(PaymentService.canRetry(payment, 3)).toBe(true);
    });

    it('disallows retry after max retries', () => {
      const payment: Payment = {
        id: 'PAY-001',
        orderId: 'ORD-001',
        amount: 1000,
        currency: 'INR',
        method: 'CARD',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        retryCount: 3,
      };

      expect(PaymentService.canRetry(payment, 3)).toBe(false);
    });

    it('disallows retry for non-failed status', () => {
      const payment: Payment = {
        id: 'PAY-001',
        orderId: 'ORD-001',
        amount: 1000,
        currency: 'INR',
        method: 'CARD',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      expect(PaymentService.canRetry(payment, 3)).toBe(false);
    });
  });

  describe('canBeRefunded', () => {
    it('allows refund for successful payment', () => {
      const payment: Payment = {
        id: 'PAY-001',
        orderId: 'ORD-001',
        amount: 1000,
        currency: 'INR',
        method: 'CARD',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      const result = PaymentService.canBeRefunded(payment);

      expect(result.eligible).toBe(true);
    });

    it('disallows refund for failed payment', () => {
      const payment: Payment = {
        id: 'PAY-001',
        orderId: 'ORD-001',
        amount: 1000,
        currency: 'INR',
        method: 'CARD',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      const result = PaymentService.canBeRefunded(payment);

      expect(result.eligible).toBe(false);
    });

    it('disallows refund for already refunded payment', () => {
      const payment: Payment = {
        id: 'PAY-001',
        orderId: 'ORD-001',
        amount: 1000,
        currency: 'INR',
        method: 'CARD',
        status: 'REFUNDED',
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      const result = PaymentService.canBeRefunded(payment);

      expect(result.eligible).toBe(false);
    });
  });

  describe('maskSensitiveInfo', () => {
    it('masks credit card number', () => {
      const masked = PaymentService.maskSensitiveInfo('1234567890123456');

      expect(masked).toBe('12**************34');
    });

    it('masks short string', () => {
      const masked = PaymentService.maskSensitiveInfo('1234');

      expect(masked).toBe('****');
    });

    it('masks CVV', () => {
      const masked = PaymentService.maskSensitiveInfo('123');

      expect(masked).toBe('****');
    });
  });

  describe('generatePaymentId', () => {
    it('generates unique payment IDs', () => {
      const id1 = PaymentService.generatePaymentId();
      const id2 = PaymentService.generatePaymentId();

      expect(id1).not.toBe(id2);
      expect(id1.startsWith('PAY-')).toBe(true);
      expect(id2.startsWith('PAY-')).toBe(true);
    });
  });

  describe('generateTransactionId', () => {
    it('generates unique transaction IDs', () => {
      const id1 = PaymentService.generateTransactionId();
      const id2 = PaymentService.generateTransactionId();

      expect(id1).not.toBe(id2);
      expect(id1.startsWith('TXN-')).toBe(true);
    });
  });
});
