/**
 * InventoryService Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryService } from '../services/InventoryService';
import { Product } from '../types';

describe('InventoryService', () => {
  let mockProduct: Product;

  beforeEach(() => {
    mockProduct = {
      id: 'prod-001',
      sku: 'SKU-001',
      name: 'Test Product',
      category: 'Test',
      price: 1000,
      rating: 4.5,
      reviewsCount: 10,
      image: 'https://example.com/image.jpg',
      description: 'Test product',
      specs: {},
      availableStock: 10,
      reservedStock: 5,
      damagedStock: 2,
      incomingStock: 20,
      safetyStock: 5,
      reorderThreshold: 8,
      dailyDemand: 2,
      leadTimeDays: 3,
      binLocation: 'A-01-1',
    };
  });

  describe('hasAvailableStock', () => {
    it('returns true when stock is sufficient', () => {
      const result = InventoryService.hasAvailableStock(mockProduct, 5);
      expect(result).toBe(true);
    });

    it('returns true when stock equals requirement', () => {
      const result = InventoryService.hasAvailableStock(mockProduct, 10);
      expect(result).toBe(true);
    });

    it('returns false when stock is insufficient', () => {
      const result = InventoryService.hasAvailableStock(mockProduct, 15);
      expect(result).toBe(false);
    });

    it('returns false when stock is zero', () => {
      const result = InventoryService.hasAvailableStock({ ...mockProduct, availableStock: 0 }, 1);
      expect(result).toBe(false);
    });
  });

  describe('reserveStock', () => {
    it('reserves stock successfully', () => {
      const result = InventoryService.reserveStock(mockProduct, 5);

      expect(result.success).toBe(true);
      expect(result.previousStock).toBe(10);
      expect(result.newStock).toBe(5);
      expect(result.movementId).toBeDefined();
    });

    it('rejects zero quantity', () => {
      const result = InventoryService.reserveStock(mockProduct, 0);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than 0');
    });

    it('rejects non-integer quantity', () => {
      const result = InventoryService.reserveStock(mockProduct, 2.5);

      expect(result.success).toBe(false);
      expect(result.error).toContain('must be an integer');
    });

    it('rejects reservation exceeding available stock', () => {
      const result = InventoryService.reserveStock(mockProduct, 15);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient available stock');
    });

    it('reserves maximum available stock', () => {
      const result = InventoryService.reserveStock(mockProduct, 10);

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(0);
    });
  });

  describe('releaseStock', () => {
    it('releases reserved stock successfully', () => {
      const result = InventoryService.releaseStock(mockProduct, 3);

      expect(result.success).toBe(true);
      expect(result.previousStock).toBe(10);
      expect(result.newStock).toBe(13);
    });

    it('rejects zero quantity', () => {
      const result = InventoryService.releaseStock(mockProduct, 0);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than 0');
    });

    it('rejects release exceeding reserved stock', () => {
      const result = InventoryService.releaseStock(mockProduct, 10);

      expect(result.success).toBe(false);
      expect(result.error).toContain('only 5 units are reserved');
    });

    it('releases maximum reserved stock', () => {
      const result = InventoryService.releaseStock(mockProduct, 5);

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(15);
    });
  });

  describe('recordReceipt', () => {
    it('increases available stock for PRISTINE condition', () => {
      const result = InventoryService.recordReceipt(mockProduct, 5, 'PRISTINE');

      expect(result.success).toBe(true);
      expect(result.previousStock).toBe(10);
      expect(result.newStock).toBe(15);
    });

    it('increases available stock for INSPECTED condition', () => {
      const result = InventoryService.recordReceipt(mockProduct, 3, 'INSPECTED');

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(13);
    });

    it('does not increase stock for DAMAGED condition', () => {
      const result = InventoryService.recordReceipt(mockProduct, 2, 'DAMAGED');

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(10); // No change
    });

    it('rejects negative quantity', () => {
      const result = InventoryService.recordReceipt(mockProduct, -1, 'PRISTINE');

      expect(result.success).toBe(false);
    });
  });

  describe('getHealthStatus', () => {
    it('returns HEALTHY for normal stock', () => {
      const status = InventoryService.getHealthStatus(mockProduct);
      expect(status).toBe('HEALTHY');
    });

    it('returns OUT_OF_STOCK when available is 0', () => {
      const status = InventoryService.getHealthStatus({ ...mockProduct, availableStock: 0 });
      expect(status).toBe('OUT_OF_STOCK');
    });

    it('returns CRITICAL when stock < safetyStock/2', () => {
      const status = InventoryService.getHealthStatus({ ...mockProduct, availableStock: 2, safetyStock: 5 });
      expect(status).toBe('CRITICAL');
    });

    it('returns LOW_STOCK when stock < safetyStock', () => {
      const status = InventoryService.getHealthStatus({ ...mockProduct, availableStock: 4, safetyStock: 5 });
      expect(status).toBe('LOW_STOCK');
    });

    it('returns OVERSTOCK when stock > safetyStock*3', () => {
      const status = InventoryService.getHealthStatus({ ...mockProduct, availableStock: 20, safetyStock: 5 });
      expect(status).toBe('OVERSTOCK');
    });

    it('returns PROJECTED_STOCKOUT when stock will run out within 7 days', () => {
      const status = InventoryService.getHealthStatus({ ...mockProduct, availableStock: 8, dailyDemand: 2, safetyStock: 5 });
      expect(status).toBe('PROJECTED_STOCKOUT');
    });
  });

  describe('checkOversellingRisk', () => {
    it('detects risk when reservation causes negative inventory', () => {
      const risk = InventoryService.checkOversellingRisk(mockProduct, 15);

      expect(risk.risk).toBe(true);
      expect(risk.reason).toContain('negative inventory');
    });

    it('detects risk when stock would fall below safety threshold', () => {
      const risk = InventoryService.checkOversellingRisk(mockProduct, 6);

      expect(risk.risk).toBe(true);
      expect(risk.reason).toContain('safety threshold');
    });

    it('returns no risk for safe reservation', () => {
      const risk = InventoryService.checkOversellingRisk(mockProduct, 4);

      expect(risk.risk).toBe(false);
    });
  });

  describe('calculateReplenishment', () => {
    it('identifies need for replenishment when below threshold', () => {
      const result = InventoryService.calculateReplenishment({ ...mockProduct, availableStock: 5, reorderThreshold: 8 });

      expect(result.needed).toBe(true);
      expect(result.quantity).toBeDefined();
      expect(result.reason).toBeDefined();
    });

    it('returns no replenishment needed when above threshold', () => {
      const result = InventoryService.calculateReplenishment({ ...mockProduct, availableStock: 10, reorderThreshold: 8 });

      expect(result.needed).toBe(false);
    });
  });

  describe('validateStockAdjustment', () => {
    it('validates positive adjustment with valid reason', () => {
      const result = InventoryService.validateStockAdjustment(mockProduct, 5, 'COUNTING_CORRECTION');

      expect(result.valid).toBe(true);
    });

    it('validates negative adjustment that doesn\'t go negative', () => {
      const result = InventoryService.validateStockAdjustment(mockProduct, -5, 'DAMAGED');

      expect(result.valid).toBe(true);
    });

    it('rejects zero adjustment', () => {
      const result = InventoryService.validateStockAdjustment(mockProduct, 0, 'OTHER');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be zero');
    });

    it('rejects non-integer adjustment', () => {
      const result = InventoryService.validateStockAdjustment(mockProduct, 2.5, 'COUNTING_CORRECTION');

      expect(result.valid).toBe(false);
    });

    it('rejects adjustment that would cause negative inventory', () => {
      const result = InventoryService.validateStockAdjustment(mockProduct, -15, 'DAMAGED');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('negative inventory');
    });

    it('rejects invalid reason', () => {
      const result = InventoryService.validateStockAdjustment(mockProduct, 5, 'INVALID_REASON');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid adjustment reason');
    });
  });

  describe('wouldCauseNegativeInventory', () => {
    it('detects negative inventory condition', () => {
      const result = InventoryService.wouldCauseNegativeInventory(mockProduct, 15);
      expect(result).toBe(true);
    });

    it('returns false for safe deduction', () => {
      const result = InventoryService.wouldCauseNegativeInventory(mockProduct, 5);
      expect(result).toBe(false);
    });
  });
});
