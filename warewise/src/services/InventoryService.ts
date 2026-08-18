/**
 * InventoryService
 * Manages inventory operations including reservations, availability checks,
 * and stock movements with validation
 */

import { Product, StockHealthStatus } from '../types';

export interface InventoryReservation {
  orderId: string;
  productId: string;
  sku: string;
  quantity: number;
  timestamp: string;
  status: 'PENDING' | 'CONFIRMED' | 'RELEASED';
}

export interface StockMovementResult {
  success: boolean;
  previousStock: number;
  newStock: number;
  movementId?: string;
  error?: string;
}

export class InventoryService {
  /**
   * Check if product has sufficient available stock
   */
  static hasAvailableStock(product: Product, requiredQty: number): boolean {
    return product.availableStock >= requiredQty;
  }

  /**
   * Reserve stock for an order
   */
  static reserveStock(product: Product, quantity: number): StockMovementResult {
    // Validate inputs
    if (quantity <= 0) {
      return {
        success: false,
        previousStock: product.availableStock,
        newStock: product.availableStock,
        error: 'Reservation quantity must be greater than 0',
      };
    }

    if (quantity !== Math.floor(quantity)) {
      return {
        success: false,
        previousStock: product.availableStock,
        newStock: product.availableStock,
        error: 'Reservation quantity must be an integer',
      };
    }

    // Check if sufficient available stock
    if (!this.hasAvailableStock(product, quantity)) {
      return {
        success: false,
        previousStock: product.availableStock,
        newStock: product.availableStock,
        error: `Insufficient available stock. Available: ${product.availableStock}, Required: ${quantity}`,
      };
    }

    const previousStock = product.availableStock;
    const newStock = previousStock - quantity;

    return {
      success: true,
      previousStock,
      newStock,
      movementId: `RES-${Date.now()}`,
    };
  }

  /**
   * Release reserved stock (e.g., for cancelled order)
   */
  static releaseStock(product: Product, quantity: number): StockMovementResult {
    if (quantity <= 0) {
      return {
        success: false,
        previousStock: product.availableStock,
        newStock: product.availableStock,
        error: 'Release quantity must be greater than 0',
      };
    }

    if (quantity > product.reservedStock) {
      return {
        success: false,
        previousStock: product.availableStock,
        newStock: product.availableStock,
        error: `Cannot release ${quantity} units. only ${product.reservedStock} units are reserved`,
      };
    }

    const previousStock = product.availableStock;
    const newStock = previousStock + quantity;

    return {
      success: true,
      previousStock,
      newStock,
      movementId: `REL-${Date.now()}`,
    };
  }

  /**
   * Record stock receipt (incoming inventory)
   */
  static recordReceipt(product: Product, quantity: number, condition: 'PRISTINE' | 'INSPECTED' | 'DAMAGED'): StockMovementResult {
    if (quantity <= 0) {
      return {
        success: false,
        previousStock: product.availableStock,
        newStock: product.availableStock,
        error: 'Receipt quantity must be greater than 0',
      };
    }

    const previousStock = product.availableStock;
    let newStock = previousStock;

    // Only add to available stock if condition is PRISTINE or INSPECTED
    if (condition === 'PRISTINE' || condition === 'INSPECTED') {
      newStock += quantity;
    }

    return {
      success: true,
      previousStock,
      newStock,
      movementId: `RCV-${Date.now()}`,
    };
  }

  /**
   * Check inventory health status
   */
  static getHealthStatus(product: Product): StockHealthStatus {
    const safetyStock = product.safetyStock;
    const available = product.availableStock;

    if (available <= 0) {
      return 'OUT_OF_STOCK';
    }

    if (available < safetyStock / 2) {
      return 'CRITICAL';
    }

    if (available < safetyStock) {
      return 'LOW_STOCK';
    }

    if (available > safetyStock * 3) {
      return 'OVERSTOCK';
    }

    const dailyDemand = product.dailyDemand || 1;
    const daysUntilStockout = available / dailyDemand;
    if (daysUntilStockout < 7 && available < safetyStock * 2) {
      return 'PROJECTED_STOCKOUT';
    }

    return 'HEALTHY';
  }

  /**
   * Check negative inventory condition
   */
  static wouldCauseNegativeInventory(product: Product, deductionQty: number): boolean {
    return product.availableStock - deductionQty < 0;
  }

  /**
   * Check overselling risk
   */
  static checkOversellingRisk(product: Product, reservationQty: number): {
    risk: boolean;
    reason?: string;
  } {
    const projectedAvailable = product.availableStock - reservationQty;

    if (projectedAvailable < 0) {
      return {
        risk: true,
        reason: `Reservation would result in negative inventory (${projectedAvailable} units)`,
      };
    }

    if (projectedAvailable < product.safetyStock) {
      return {
        risk: true,
        reason: `Reservation would reduce stock below safety threshold (${projectedAvailable} vs ${product.safetyStock})`,
      };
    }

    return { risk: false };
  }

  /**
   * Calculate replenishment needed
   */
  static calculateReplenishment(product: Product): {
    needed: boolean;
    quantity?: number;
    reason?: string;
  } {
    if (product.availableStock < product.reorderThreshold) {
      const requiredQty = product.safetyStock * 2 - product.availableStock;
      return {
        needed: true,
        quantity: Math.ceil(requiredQty),
        reason: `Current stock ${product.availableStock} below reorder threshold ${product.reorderThreshold}`,
      };
    }

    return { needed: false };
  }

  /**
   * Validate stock adjustment
   */
  static validateStockAdjustment(
    product: Product,
    adjustmentQty: number,
    reason: string,
  ): { valid: boolean; error?: string } {
    if (adjustmentQty === 0) {
      return { valid: false, error: 'Adjustment quantity cannot be zero' };
    }

    if (!Number.isInteger(adjustmentQty)) {
      return { valid: false, error: 'Adjustment quantity must be an integer' };
    }

    // For negative adjustments, ensure we don't go negative
    if (adjustmentQty < 0 && product.availableStock + adjustmentQty < 0) {
      return {
        valid: false,
        error: `Adjustment would result in negative inventory. Current: ${product.availableStock}, Adjustment: ${adjustmentQty}`,
      };
    }

    // Validate reason
    const validReasons = [
      'DAMAGED',
      'MISSING',
      'EXPIRED',
      'RETURNED',
      'COUNTING_CORRECTION',
      'WAREHOUSE_TRANSFER',
      'ADMINISTRATIVE_CORRECTION',
      'OTHER',
    ];

    if (!validReasons.includes(reason)) {
      return { valid: false, error: `Invalid adjustment reason: ${reason}` };
    }

    return { valid: true };
  }
}
