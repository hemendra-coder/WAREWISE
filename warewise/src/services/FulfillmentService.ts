/**
 * FulfillmentService
 * Manages order fulfillment workflow - picking, packing, QC, dispatch
 */

import { Order, OrderStatus } from '../types';

export type FulfillmentStage = 'PICKING' | 'PACKING' | 'QC' | 'DISPATCH';

export interface PickingTask {
  orderId: string;
  productId: string;
  sku: string;
  quantity: number;
  binLocation: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface QCResult {
  orderId: string;
  status: 'PASS' | 'FAIL';
  passedItems: number;
  failedItems: number;
  issues?: string[];
}

export class FulfillmentService {
  /**
   * Can start picking for order
   */
  static canStartPicking(order: Order): { canStart: boolean; reason?: string } {
    if (order.status !== 'ALLOCATED') {
      return {
        canStart: false,
        reason: `Order status is ${order.status}, must be ALLOCATED to start picking`,
      };
    }

    return { canStart: true };
  }

  /**
   * Validate picking completion
   */
  static validatePickingCompletion(params: {
    orderId: string;
    pickedItems: Array<{ productId: string; pickedQty: number; allocatedQty: number }>;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.orderId || params.orderId.trim() === '') {
      errors.push('Order ID is required');
    }

    if (!Array.isArray(params.pickedItems) || params.pickedItems.length === 0) {
      errors.push('Must have at least one picked item');
    }

    params.pickedItems.forEach((item, index) => {
      if (item.pickedQty <= 0) {
        errors.push(`Item ${index + 1}: Picked quantity must be greater than 0`);
      }

      if (item.pickedQty > item.allocatedQty) {
        errors.push(`Item ${index + 1}: Cannot pick ${item.pickedQty} when only ${item.allocatedQty} allocated`);
      }

      if (item.pickedQty !== Math.floor(item.pickedQty)) {
        errors.push(`Item ${index + 1}: Quantity must be an integer`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Can start packing
   */
  static canStartPacking(order: Order): { canStart: boolean; reason?: string } {
    if (order.status !== 'PICKED') {
      return {
        canStart: false,
        reason: `Order status is ${order.status}, must be PICKED to start packing`,
      };
    }

    return { canStart: true };
  }

  /**
   * Validate packing completion
   */
  static validatePackingCompletion(params: {
    orderId: string;
    cartonType: string;
    weightKg: number;
    dimensions?: { length: number; width: number; height: number };
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.orderId || params.orderId.trim() === '') {
      errors.push('Order ID is required');
    }

    if (!params.cartonType || params.cartonType.trim() === '') {
      errors.push('Carton type is required');
    }

    if (params.weightKg <= 0) {
      errors.push('Weight must be greater than 0');
    }

    const validCartonTypes = ['SMALL_BOX', 'MEDIUM_BOX', 'LARGE_BOX', 'EXTRA_LARGE_BOX', 'ENVELOPE', 'TUBE'];
    if (!validCartonTypes.includes(params.cartonType)) {
      errors.push(`Invalid carton type: ${params.cartonType}`);
    }

    if (params.dimensions) {
      if (params.dimensions.length <= 0 || params.dimensions.width <= 0 || params.dimensions.height <= 0) {
        errors.push('Dimensions must be positive numbers');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Can start QC
   */
  static canStartQC(order: Order): { canStart: boolean; reason?: string } {
    if (order.status !== 'PACKED') {
      return {
        canStart: false,
        reason: `Order status is ${order.status}, must be PACKED to start QC`,
      };
    }

    return { canStart: true };
  }

  /**
   * Validate QC completion
   */
  static validateQCResult(params: {
    orderId: string;
    status: 'PASS' | 'FAIL';
    passedItems: number;
    failedItems: number;
    totalItems: number;
    issues?: string[];
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.orderId || params.orderId.trim() === '') {
      errors.push('Order ID is required');
    }

    if (!['PASS', 'FAIL'].includes(params.status)) {
      errors.push('QC status must be PASS or FAIL');
    }

    if (params.passedItems < 0 || params.failedItems < 0) {
      errors.push('Item counts cannot be negative');
    }

    if (params.passedItems + params.failedItems !== params.totalItems) {
      errors.push(`Item counts (${params.passedItems} + ${params.failedItems}) don't match total (${params.totalItems})`);
    }

    if (params.status === 'FAIL' && params.failedItems === 0) {
      errors.push('QC marked as FAIL but no failed items reported');
    }

    if (params.status === 'PASS' && params.failedItems > 0) {
      errors.push('QC marked as PASS but failed items were reported');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Can dispatch order
   */
  static canDispatch(order: Order): { canDispatch: boolean; reason?: string } {
    if (order.status !== 'READY_FOR_DISPATCH') {
      return {
        canDispatch: false,
        reason: `Order status is ${order.status}, must be READY_FOR_DISPATCH to dispatch`,
      };
    }

    return { canDispatch: true };
  }

  /**
   * Validate dispatch information
   */
  static validateDispatchInfo(params: {
    orderId: string;
    carrier: string;
    trackingNumber: string;
    estimatedDeliveryDate: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.orderId || params.orderId.trim() === '') {
      errors.push('Order ID is required');
    }

    if (!params.carrier || params.carrier.trim() === '') {
      errors.push('Carrier is required');
    }

    if (!params.trackingNumber || params.trackingNumber.trim() === '') {
      errors.push('Tracking number is required');
    }

    if (!params.estimatedDeliveryDate) {
      errors.push('Estimated delivery date is required');
    } else {
      const deliveryDate = new Date(params.estimatedDeliveryDate);
      const now = new Date();
      if (deliveryDate < now) {
        errors.push('Estimated delivery date cannot be in the past');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate fulfillment time
   */
  static calculateFulfillmentTime(
    orderCreatedAt: string,
    currentStatus: OrderStatus,
  ): { elapsedHours: number; stageName: string } {
    const created = new Date(orderCreatedAt);
    const now = new Date();
    const elapsedHours = Math.round((now.getTime() - created.getTime()) / (60 * 60 * 1000));

    const stageNames: Record<OrderStatus, string> = {
      CREATED: 'Pending',
      PENDING_APPROVAL: 'Pending Approval',
      PENDING_REVIEW: 'Pending Review',
      APPROVED: 'Approved',
      PRIORITIZED: 'Prioritized',
      PAYMENT_PENDING: 'Payment Processing',
      PAYMENT_CONFIRMED: 'Payment Confirmed',
      PRIORITY_DETERMINED: 'Priority Determination',
      INVENTORY_CHECK: 'Inventory Check',
      SHORTAGE_FLAGGED: 'Shortage Flagged',
      STOCK_ALLOCATED: 'Stock Allocated',
      ALLOCATED: 'Allocated',
      RECEIVED: 'Received',
      PICKING: 'Picking',
      PICKED: 'Picked',
      PACKING: 'Packing',
      PACKED: 'Packed',
      QC: 'Quality Check',
      QC_CHECK: 'QC Check',
      QC_FAILED: 'QC Failed',
      READY_FOR_DISPATCH: 'Ready for Dispatch',
      DISPATCHED: 'Dispatched',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      IN_TRANSIT: 'In Transit',
      DELIVERED: 'Delivered',
      RETURN_REQUESTED: 'Return Requested',
      RETURN_APPROVED: 'Return Approved',
      RETURN_REJECTED: 'Return Rejected',
      RETURNED: 'Returned',
      REFUND_PROCESSED: 'Refund Processed',
      COMPLETED: 'Completed',
      EXCEPTION: 'Exception',
      CANCELLED: 'Cancelled',
    };

    return {
      elapsedHours,
      stageName: stageNames[currentStatus] || 'Unknown',
    };
  }

  /**
   * Check SLA compliance
   */
  static checkSLACompliance(order: Order): { compliant: boolean; hoursRemaining: number } {
    if (!order.slaMinutesRemaining) {
      return { compliant: true, hoursRemaining: Infinity };
    }

    const hoursRemaining = order.slaMinutesRemaining / 60;
    const compliant = hoursRemaining > 0;

    return { compliant, hoursRemaining };
  }

  /**
   * Identify bottleneck stages
   */
  static identifyBottlenecks(orders: Order[]): Array<{ stage: string; orderCount: number; avgTimeHours: number }> {
    const stageGroups: Record<string, { orders: Order[]; totalTime: number }> = {};

    orders.forEach((order) => {
      const stage = order.status;
      if (!stageGroups[stage]) {
        stageGroups[stage] = { orders: [], totalTime: 0 };
      }

      const { elapsedHours } = this.calculateFulfillmentTime(order.createdAt, order.status);
      stageGroups[stage].orders.push(order);
      stageGroups[stage].totalTime += elapsedHours;
    });

    return Object.entries(stageGroups)
      .map(([stage, data]) => ({
        stage,
        orderCount: data.orders.length,
        avgTimeHours: Math.round(data.totalTime / data.orders.length),
      }))
      .sort((a, b) => b.avgTimeHours - a.avgTimeHours)
      .slice(0, 5); // Top 5 bottlenecks
  }
}
