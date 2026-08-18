/**
 * OrderService
 * Handles all order-related business logic with state validation and transitions
 */

import { Order, OrderStatus, Product } from '../types';

export interface OrderValidationResult {
  valid: boolean;
  errors: string[];
}

export interface OrderItem {
  productId: string;
  sku: string;
  quantity: number;
  pricePerUnit: number;
}

export class OrderService {
  /**
   * Creates a new order with validation
   */
  static createOrder(params: {
    customerId: string;
    items: OrderItem[];
    shippingAddress: string;
    totalAmount: number;
  }): OrderValidationResult {
    const errors: string[] = [];

    // Validate customer
    if (!params.customerId || params.customerId.trim() === '') {
      errors.push('Customer ID is required');
    }

    // Validate items
    if (!Array.isArray(params.items) || params.items.length === 0) {
      errors.push('Order must contain at least one item');
    }

    // Validate each item
    params.items.forEach((item, index) => {
      if (!item.productId || item.productId.trim() === '') {
        errors.push(`Item ${index + 1}: Product ID is required`);
      }
      if (!item.sku || item.sku.trim() === '') {
        errors.push(`Item ${index + 1}: SKU is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.quantity !== Math.floor(item.quantity)) {
        errors.push(`Item ${index + 1}: Quantity must be an integer`);
      }
      if (item.pricePerUnit < 0) {
        errors.push(`Item ${index + 1}: Price cannot be negative`);
      }
    });

    // Validate shipping address
    if (!params.shippingAddress || params.shippingAddress.trim() === '') {
      errors.push('Shipping address is required');
    }

    // Validate total amount
    if (params.totalAmount <= 0) {
      errors.push('Order total must be greater than 0');
    }

    // Validate total calculation
    const calculatedTotal = this.calculateOrderTotal(params.items);
    if (Math.abs(calculatedTotal - params.totalAmount) > 0.01) {
      // Allow small floating point differences
      errors.push(`Order total mismatch: calculated ${calculatedTotal}, provided ${params.totalAmount}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate order total from items
   */
  static calculateOrderTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
  }

  /**
   * Validate state transition
   */
  static canTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      CREATED: ['PAYMENT_PENDING', 'CANCELLED'],
      PENDING_APPROVAL: ['APPROVED', 'CANCELLED'],
      PENDING_REVIEW: ['APPROVED', 'CANCELLED'],
      APPROVED: ['PRIORITIZED', 'CANCELLED'],
      PRIORITIZED: ['ALLOCATED', 'CANCELLED'],
      PAYMENT_PENDING: ['PAYMENT_CONFIRMED', 'CANCELLED'],
      PAYMENT_CONFIRMED: ['PRIORITY_DETERMINED', 'CANCELLED'],
      PRIORITY_DETERMINED: ['INVENTORY_CHECK', 'CANCELLED'],
      INVENTORY_CHECK: ['ALLOCATED', 'SHORTAGE_FLAGGED', 'CANCELLED'],
      SHORTAGE_FLAGGED: ['ALLOCATED', 'CANCELLED'],
      STOCK_ALLOCATED: ['ALLOCATED', 'PICKING', 'CANCELLED'],
      ALLOCATED: ['PICKING', 'CANCELLED'],
      RECEIVED: ['PICKING', 'ALLOCATED', 'CANCELLED'],
      PICKING: ['PICKED', 'EXCEPTION'],
      PICKED: ['PACKING', 'EXCEPTION'],
      PACKING: ['PACKED', 'EXCEPTION'],
      PACKED: ['QC', 'QC_CHECK', 'EXCEPTION'],
      QC: ['READY_FOR_DISPATCH', 'EXCEPTION'],
      QC_CHECK: ['READY_FOR_DISPATCH', 'EXCEPTION'],
      QC_FAILED: ['PACKING', 'CANCELLED'],
      READY_FOR_DISPATCH: ['DISPATCHED', 'CANCELLED'],
      DISPATCHED: ['OUT_FOR_DELIVERY', 'EXCEPTION'],
      OUT_FOR_DELIVERY: ['DELIVERED', 'EXCEPTION'],
      IN_TRANSIT: ['DELIVERED', 'EXCEPTION'],
      DELIVERED: ['RETURN_REQUESTED', 'COMPLETED'],
      RETURN_REQUESTED: ['RETURN_APPROVED', 'RETURN_REJECTED'],
      RETURN_APPROVED: ['RETURNED', 'RETURN_REJECTED'],
      RETURN_REJECTED: ['COMPLETED'],
      RETURNED: ['REFUND_PROCESSED', 'RETURN_REJECTED'],
      REFUND_PROCESSED: ['COMPLETED'],
      COMPLETED: [],
      EXCEPTION: ['ALLOCATED', 'CANCELLED'],
      CANCELLED: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  /**
   * Check if order can be cancelled
   */
  static canCancel(status: OrderStatus): boolean {
    const cancellableStatuses: OrderStatus[] = [
      'CREATED',
      'PENDING_APPROVAL',
      'APPROVED',
      'PAYMENT_PENDING',
      'PAYMENT_CONFIRMED',
      'PRIORITY_DETERMINED',
      'INVENTORY_CHECK',
      'SHORTAGE_FLAGGED',
    ];
    return cancellableStatuses.includes(status);
  }

  /**
   * Check if order can be returned
   */
  static canReturn(status: OrderStatus): boolean {
    return status === 'DELIVERED';
  }

  /**
   * Generate order number
   */
  static generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-WW-${timestamp}-${random}`;
  }
}
