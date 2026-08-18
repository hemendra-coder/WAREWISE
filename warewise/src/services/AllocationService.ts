/**
 * AllocationService
 * Handles intelligent allocation of inventory to orders with conflict resolution,
 * priority-based distribution, and partial allocation support
 */

import { Order, Product, OrderStatus } from '../types';

export interface AllocationResult {
  orderId: string;
  productId: string;
  sku: string;
  requestedQty: number;
  allocatedQty: number;
  status: 'FULL' | 'PARTIAL' | 'NONE';
  reason?: string;
}

export interface AllocationPriority {
  orderId: string;
  priority: number; // Higher = more urgent
  slaMinutesRemaining: number;
  requestedQty: number;
}

export class AllocationService {
  /**
   * Calculate order priority based on SLA and other factors
   */
  static calculateOrderPriority(order: Order): number {
    let priority = 0;

    // Base priority from status
    const statusPriority: Record<string, number> = {
      INVENTORY_CHECK: 100,
      SHORTAGE_FLAGGED: 200, // Higher priority for shortage flagged
      ALLOCATED: 50,
    };

    priority += statusPriority[order.status] || 0;

    // SLA-based urgency
    if (order.slaMinutesRemaining && order.slaMinutesRemaining <= 60) {
      priority += 500; // Critical SLA
    } else if (order.slaMinutesRemaining && order.slaMinutesRemaining <= 180) {
      priority += 300; // Warning SLA
    }

    // Customer tier boost
    const tierBoost: Record<string, number> = {
      PREMIUM: 150,
      VIP: 200,
      REGULAR: 0,
    };
    priority += tierBoost[order.customerTier || 'REGULAR'] || 0;

    // Order value boost
    if (order.totalAmount && order.totalAmount > 100000) {
      priority += 100;
    }

    return priority;
  }

  /**
   * Allocate available stock to competing orders
   */
  static allocateCompetingOrders(
    orders: Order[],
    product: Product,
    availableQty: number,
  ): AllocationResult[] {
    // Filter orders that need this product
    const ordersNeedingProduct = orders.filter(
      (order) =>
        order.items.some((item) => item.productId === product.id) &&
        ['INVENTORY_CHECK', 'SHORTAGE_FLAGGED'].includes(order.status),
    );

    if (ordersNeedingProduct.length === 0) {
      return [];
    }

    // Calculate priorities
    const prioritizedOrders = ordersNeedingProduct
      .map((order) => ({
        order,
        priority: this.calculateOrderPriority(order),
      }))
      .sort((a, b) => b.priority - a.priority); // Highest priority first

    // Allocate stock
    const results: AllocationResult[] = [];
    let remainingStock = availableQty;

    for (const { order } of prioritizedOrders) {
      const item = order.items.find((i) => i.productId === product.id);
      if (!item) continue;

      const requestedQty = item.quantity;

      if (remainingStock >= requestedQty) {
        // Full allocation
        results.push({
          orderId: order.id,
          productId: product.id,
          sku: product.sku,
          requestedQty,
          allocatedQty: requestedQty,
          status: 'FULL',
        });
        remainingStock -= requestedQty;
      } else if (remainingStock > 0) {
        const shouldOfferPartial = remainingStock <= requestedQty / 2;

        if (shouldOfferPartial) {
          results.push({
            orderId: order.id,
            productId: product.id,
            sku: product.sku,
            requestedQty,
            allocatedQty: remainingStock,
            status: 'PARTIAL',
            reason: `Only ${remainingStock} of ${requestedQty} units available`,
          });
        } else {
          results.push({
            orderId: order.id,
            productId: product.id,
            sku: product.sku,
            requestedQty,
            allocatedQty: 0,
            status: 'NONE',
            reason: 'No stock available',
          });
        }
        remainingStock = 0;
      } else {
        results.push({
          orderId: order.id,
          productId: product.id,
          sku: product.sku,
          requestedQty,
          allocatedQty: 0,
          status: 'NONE',
          reason: 'No stock available',
        });
      }

      if (remainingStock === 0) break;
    }

    return results;
  }

  /**
   * Override allocation (admin action)
   */
  static overrideAllocation(params: {
    orderId: string;
    productId: string;
    newQty: number;
    reason: string;
    adminId: string;
  }): { valid: boolean; error?: string } {
    if (params.newQty < 0) {
      return { valid: false, error: 'Allocation quantity cannot be negative' };
    }

    if (!params.reason || params.reason.trim() === '') {
      return { valid: false, error: 'Reason for override is required' };
    }

    if (!params.adminId || params.adminId.trim() === '') {
      return { valid: false, error: 'Admin ID is required for audit trail' };
    }

    return { valid: true };
  }

  /**
   * Check if partial allocation is acceptable
   */
  static isPartialAllocationAcceptable(order: Order, productId: string, allocatedQty: number, requestedQty: number): boolean {
    // Check order-level acceptance
    if (order.allowPartialDelivery === false) {
      return false;
    }

    // Don't allocate zero units
    if (allocatedQty === 0) {
      return false;
    }

    // Require at least 50% allocation
    if (allocatedQty / requestedQty < 0.5) {
      return false;
    }

    return true;
  }

  /**
   * Suggest donor orders for reallocation
   */
  static suggestReallocations(
    targetOrder: Order,
    targetProduct: Product,
    shortageQty: number,
    allOrders: Order[],
  ): { donorOrderId: string; transferableQty: number }[] {
    const suggestions: { donorOrderId: string; transferableQty: number }[] = [];

    // Find orders that:
    // 1. Have allocated this product
    // 2. Have higher SLA window
    // 3. Can spare units
    const donorCandidates = allOrders.filter((order) => {
      // Must have the product
      if (!order.items.some((i) => i.productId === targetProduct.id)) return false;

      // Must be in a fulfillment stage
      if (!['ALLOCATED', 'PICKING', 'PICKED'].includes(order.status)) return false;

      // Donor must have longer SLA than target
      const donorSla = order.slaMinutesRemaining || Infinity;
      const targetSla = targetOrder.slaMinutesRemaining || 0;
      if (donorSla <= targetSla) return false;

      return true;
    });

    // Suggest reallocation from each donor
    for (const donor of donorCandidates.slice(0, 3)) {
      // Only suggest from top 3 candidates
      const donorItem = donor.items.find((i) => i.productId === targetProduct.id);
      if (!donorItem) continue;

      // Suggest minimum needed or 50% of donor's allocation, whichever is less
      const transferable = Math.min(shortageQty, Math.floor(donorItem.quantity * 0.5));

      if (transferable > 0) {
        suggestions.push({
          donorOrderId: donor.id,
          transferableQty: transferable,
        });

        shortageQty -= transferable;
        if (shortageQty <= 0) break;
      }
    }

    return suggestions;
  }

  /**
   * Calculate allocation efficiency
   */
  static calculateEfficiency(totalOrders: number, fullyAllocated: number, partiallyAllocated: number): number {
    if (totalOrders === 0) return 100;

    const fullyAllocatedScore = fullyAllocated * 100;
    const partialAllocatedScore = partiallyAllocated * 50;

    return Math.round((fullyAllocatedScore + partialAllocatedScore) / (totalOrders * 100) * 100);
  }
}
