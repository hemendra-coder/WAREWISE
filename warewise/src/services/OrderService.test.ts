/**
 * OrderService Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { OrderService } from '../services/OrderService';

describe('OrderService', () => {
  describe('createOrder', () => {
    it('creates order with valid parameters', () => {
      const result = OrderService.createOrder({
        customerId: 'cust-001',
        items: [{ productId: 'prod-001', sku: 'SKU-001', quantity: 2, pricePerUnit: 1000 }],
        shippingAddress: '123 Main St',
        totalAmount: 2000,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects order with no customer ID', () => {
      const result = OrderService.createOrder({
        customerId: '',
        items: [{ productId: 'prod-001', sku: 'SKU-001', quantity: 1, pricePerUnit: 1000 }],
        shippingAddress: '123 Main St',
        totalAmount: 1000,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Customer ID is required');
    });

    it('rejects order with no items', () => {
      const result = OrderService.createOrder({
        customerId: 'cust-001',
        items: [],
        shippingAddress: '123 Main St',
        totalAmount: 0,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Order must contain at least one item');
    });

    it('rejects order with negative quantity', () => {
      const result = OrderService.createOrder({
        customerId: 'cust-001',
        items: [{ productId: 'prod-001', sku: 'SKU-001', quantity: -1, pricePerUnit: 1000 }],
        shippingAddress: '123 Main St',
        totalAmount: 0,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Quantity must be greater than 0'))).toBe(true);
    });

    it('rejects order with non-integer quantity', () => {
      const result = OrderService.createOrder({
        customerId: 'cust-001',
        items: [{ productId: 'prod-001', sku: 'SKU-001', quantity: 2.5, pricePerUnit: 1000 }],
        shippingAddress: '123 Main St',
        totalAmount: 2500,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('must be an integer'))).toBe(true);
    });

    it('rejects order with negative price', () => {
      const result = OrderService.createOrder({
        customerId: 'cust-001',
        items: [{ productId: 'prod-001', sku: 'SKU-001', quantity: 1, pricePerUnit: -100 }],
        shippingAddress: '123 Main St',
        totalAmount: -100,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Price cannot be negative'))).toBe(true);
    });

    it('rejects order with mismatched total', () => {
      const result = OrderService.createOrder({
        customerId: 'cust-001',
        items: [{ productId: 'prod-001', sku: 'SKU-001', quantity: 2, pricePerUnit: 1000 }],
        shippingAddress: '123 Main St',
        totalAmount: 2500, // Should be 2000
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('total mismatch'))).toBe(true);
    });

    it('rejects order with no shipping address', () => {
      const result = OrderService.createOrder({
        customerId: 'cust-001',
        items: [{ productId: 'prod-001', sku: 'SKU-001', quantity: 1, pricePerUnit: 1000 }],
        shippingAddress: '',
        totalAmount: 1000,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Shipping address is required');
    });
  });

  describe('calculateOrderTotal', () => {
    it('calculates total correctly with single item', () => {
      const total = OrderService.calculateOrderTotal([{ productId: 'prod-001', sku: 'SKU-001', quantity: 2, pricePerUnit: 500 }]);

      expect(total).toBe(1000);
    });

    it('calculates total correctly with multiple items', () => {
      const total = OrderService.calculateOrderTotal([
        { productId: 'prod-001', sku: 'SKU-001', quantity: 2, pricePerUnit: 500 },
        { productId: 'prod-002', sku: 'SKU-002', quantity: 1, pricePerUnit: 1000 },
      ]);

      expect(total).toBe(2000);
    });

    it('returns 0 for empty items array', () => {
      const total = OrderService.calculateOrderTotal([]);

      expect(total).toBe(0);
    });
  });

  describe('canTransition', () => {
    it('allows CREATED to PAYMENT_PENDING', () => {
      expect(OrderService.canTransition('CREATED', 'PAYMENT_PENDING')).toBe(true);
    });

    it('allows PAYMENT_CONFIRMED to PRIORITY_DETERMINED', () => {
      expect(OrderService.canTransition('PAYMENT_CONFIRMED', 'PRIORITY_DETERMINED')).toBe(true);
    });

    it('allows ALLOCATED to PICKING', () => {
      expect(OrderService.canTransition('ALLOCATED', 'PICKING')).toBe(true);
    });

    it('allows DELIVERED to RETURN_REQUESTED', () => {
      expect(OrderService.canTransition('DELIVERED', 'RETURN_REQUESTED')).toBe(true);
    });

    it('disallows CREATED to COMPLETED', () => {
      expect(OrderService.canTransition('CREATED', 'COMPLETED')).toBe(false);
    });

    it('disallows CANCELLED to any state', () => {
      expect(OrderService.canTransition('CANCELLED', 'ALLOCATED')).toBe(false);
    });

    it('disallows PICKING to ALLOCATED', () => {
      expect(OrderService.canTransition('PICKING', 'ALLOCATED')).toBe(false);
    });
  });

  describe('canCancel', () => {
    it('allows cancellation of CREATED order', () => {
      expect(OrderService.canCancel('CREATED')).toBe(true);
    });

    it('allows cancellation of PAYMENT_PENDING order', () => {
      expect(OrderService.canCancel('PAYMENT_PENDING')).toBe(true);
    });

    it('allows cancellation of INVENTORY_CHECK order', () => {
      expect(OrderService.canCancel('INVENTORY_CHECK')).toBe(true);
    });

    it('disallows cancellation of PICKED order', () => {
      expect(OrderService.canCancel('PICKED')).toBe(false);
    });

    it('disallows cancellation of DELIVERED order', () => {
      expect(OrderService.canCancel('DELIVERED')).toBe(false);
    });

    it('disallows cancellation of COMPLETED order', () => {
      expect(OrderService.canCancel('COMPLETED')).toBe(false);
    });
  });

  describe('canReturn', () => {
    it('allows return only for DELIVERED orders', () => {
      expect(OrderService.canReturn('DELIVERED')).toBe(true);
    });

    it('disallows return for CREATED order', () => {
      expect(OrderService.canReturn('CREATED')).toBe(false);
    });

    it('disallows return for PICKING order', () => {
      expect(OrderService.canReturn('PICKING')).toBe(false);
    });

    it('disallows return for CANCELLED order', () => {
      expect(OrderService.canReturn('CANCELLED')).toBe(false);
    });
  });

  describe('generateOrderNumber', () => {
    it('generates unique order numbers', () => {
      const num1 = OrderService.generateOrderNumber();
      const num2 = OrderService.generateOrderNumber();

      expect(num1).not.toBe(num2);
      expect(num1.startsWith('ORD-WW-')).toBe(true);
      expect(num2.startsWith('ORD-WW-')).toBe(true);
    });
  });
});
