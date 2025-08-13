/**
 * Service layer for delivery companies management
 * Handles all business logic and database operations
 */

import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  serverTimestamp,
  increment
} from 'firebase/firestore';

import {
  deliveryCompaniesRef,
  serviceAreasRef,
  pricingStructuresRef,
  performanceMetricsRef,
  createDeliveryCompanyDocument,
  createServiceAreaDocument,
  createPricingStructureDocument,
  createPerformanceMetricsDocument,
  buildDeliveryCompanyQuery,
  buildServiceAreaQuery,
  getDeliveryCompanyStats,
  generateId,
  createSlug,
  createBatch,
  getServerTimestamp
} from '@/lib/firebase/deliveryCollections';

import {
  validateDeliveryCompany,
  validateDeliveryCompanyForm,
  validateServiceArea,
  validatePricingStructure,
  validateFilters
} from '@/lib/validation/deliverySchemas';

import { auditLogService } from './auditLogService';

class DeliveryCompanyService {
  /**
   * Get all delivery companies with filtering and pagination
   */
  async getAllCompanies(filters = {}) {
    try {
      // Validate filters
      const { isValid, data: validatedFilters, errors } = validateFilters(filters);
      if (!isValid) {
        throw new Error(`Invalid filters: ${errors.map(e => e.message).join(', ')}`);
      }

      const q = buildDeliveryCompanyQuery(validatedFilters);
      const snapshot = await getDocs(q);

      const companies = [];
      snapshot.forEach((doc) => {
        companies.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Get total count for pagination (this is expensive, consider caching)
      const totalSnapshot = await getDocs(query(deliveryCompaniesRef));
      const total = totalSnapshot.size;

      return {
        companies,
        total,
        page: Math.floor((validatedFilters.offset || 0) / (validatedFilters.limit || 50)) + 1,
        limit: validatedFilters.limit || 50,
        hasMore: companies.length === (validatedFilters.limit || 50)
      };
    } catch (error) {
      console.error('Error getting delivery companies:', error);
      throw error;
    }
  }

  /**
   * Get a single delivery company by ID
   */
  async getCompanyById(companyId) {
    try {
      const docRef = doc(deliveryCompaniesRef, companyId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Delivery company not found');
      }

      const companyData = {
        id: docSnap.id,
        ...docSnap.data()
      };

      // Load related data
      const [serviceAreas, pricing, performance] = await Promise.all([
        this.getCompanyServiceAreas(companyId),
        this.getCompanyPricing(companyId),
        this.getCompanyPerformance(companyId)
      ]);

      return {
        ...companyData,
        serviceAreasData: serviceAreas,
        pricingData: pricing,
        performanceData: performance
      };
    } catch (error) {
      console.error('Error getting delivery company:', error);
      throw error;
    }
  }

  /**
   * Create a new delivery company
   */
  async createCompany(companyData, adminEmail) {
    try {
      // Validate company data
      const { isValid, data: validatedData, errors } = validateDeliveryCompany(companyData);
      if (!isValid) {
        throw new Error(`Invalid company data: ${errors.map(e => e.message).join(', ')}`);
      }

      // Create slug from company name
      const slug = createSlug(validatedData.name);

      // Check if slug already exists
      const existingQuery = query(deliveryCompaniesRef, where('slug', '==', slug));
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        throw new Error('A company with this name already exists');
      }

      // Prepare company document
      const companyDoc = createDeliveryCompanyDocument({
        ...validatedData,
        slug,
        status: 'pending',
        createdBy: adminEmail,
        createdAt: getServerTimestamp(),
        updatedAt: getServerTimestamp()
      });

      // Create company
      const docRef = await addDoc(deliveryCompaniesRef, companyDoc);

      // Log audit event
      await auditLogService.logDeliveryCompanyAction(
        adminEmail,
        'company_created',
        docRef.id,
        { companyName: validatedData.name }
      );

      return {
        id: docRef.id,
        ...companyDoc
      };
    } catch (error) {
      console.error('Error creating delivery company:', error);
      throw error;
    }
  }

  /**
   * Update delivery company
   */
  async updateCompany(companyId, updateData, adminEmail) {
    try {
      // Validate update data
      const { isValid, data: validatedData, errors } = validateDeliveryCompanyForm(updateData);
      if (!isValid) {
        throw new Error(`Invalid update data: ${errors.map(e => e.message).join(', ')}`);
      }

      const docRef = doc(deliveryCompaniesRef, companyId);

      // Check if company exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Delivery company not found');
      }

      // If name is being updated, check slug uniqueness
      if (validatedData.name && validatedData.name !== docSnap.data().name) {
        const newSlug = createSlug(validatedData.name);
        const existingQuery = query(
          deliveryCompaniesRef,
          where('slug', '==', newSlug),
          where('__name__', '!=', companyId)
        );
        const existingSnapshot = await getDocs(existingQuery);

        if (!existingSnapshot.empty) {
          throw new Error('A company with this name already exists');
        }

        validatedData.slug = newSlug;
      }

      // Update company
      const updateDoc = {
        ...validatedData,
        updatedAt: getServerTimestamp(),
        lastModifiedBy: adminEmail
      };

      await updateDoc(docRef, updateDoc);

      // Log audit event
      await auditLogService.logDeliveryCompanyAction(
        adminEmail,
        'company_updated',
        companyId,
        { updatedFields: Object.keys(validatedData) }
      );

      return {
        id: companyId,
        ...docSnap.data(),
        ...updateDoc
      };
    } catch (error) {
      console.error('Error updating delivery company:', error);
      throw error;
    }
  }

  /**
   * Update company status
   */
  async updateCompanyStatus(companyId, status, reason, adminEmail) {
    try {
      const validStatuses = ['pending', 'active', 'suspended', 'terminated'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const docRef = doc(deliveryCompaniesRef, companyId);

      // Check if company exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Delivery company not found');
      }

      const currentData = docSnap.data();
      const previousStatus = currentData.status;

      // Update status
      const updateData = {
        status,
        statusReason: reason || null,
        statusChangedAt: getServerTimestamp(),
        statusChangedBy: adminEmail,
        updatedAt: getServerTimestamp(),
        lastModifiedBy: adminEmail
      };

      await updateDoc(docRef, updateData);

      // Log audit event
      await auditLogService.logDeliveryCompanyAction(
        adminEmail,
        'status_changed',
        companyId,
        {
          previousStatus,
          newStatus: status,
          reason,
          companyName: currentData.name
        }
      );

      return {
        id: companyId,
        ...currentData,
        ...updateData
      };
    } catch (error) {
      console.error('Error updating company status:', error);
      throw error;
    }
  }

  /**
   * Delete delivery company
   */
  async deleteCompany(companyId, adminEmail) {
    try {
      const docRef = doc(deliveryCompaniesRef, companyId);

      // Check if company exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Delivery company not found');
      }

      const companyData = docSnap.data();

      // Check if company has active orders (this would need order service integration)
      // For now, we'll just check if status allows deletion
      if (companyData.status === 'active') {
        throw new Error('Cannot delete active company. Please suspend first.');
      }

      // Use batch to delete company and related data
      const batch = createBatch();

      // Delete company document
      batch.delete(docRef);

      // Delete related service areas
      const serviceAreasQuery = query(serviceAreasRef, where('companyId', '==', companyId));
      const serviceAreasSnapshot = await getDocs(serviceAreasQuery);
      serviceAreasSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete pricing structure
      const pricingRef = doc(pricingStructuresRef, companyId);
      batch.delete(pricingRef);

      // Commit batch
      await batch.commit();

      // Log audit event
      await auditLogService.logDeliveryCompanyAction(
        adminEmail,
        'company_deleted',
        companyId,
        { companyName: companyData.name }
      );

      return { success: true };
    } catch (error) {
      console.error('Error deleting delivery company:', error);
      throw error;
    }
  }

  /**
   * Search delivery companies
   */
  async searchCompanies(searchTerm, limit = 50) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error('Search term must be at least 2 characters');
      }

      const searchLower = searchTerm.toLowerCase();

      // Firebase doesn't support full-text search, so we'll do multiple queries
      // In production, consider using Algolia or Elasticsearch
      const queries = [
        query(
          deliveryCompaniesRef,
          where('name', '>=', searchTerm),
          where('name', '<=', searchTerm + '\uf8ff'),
          limit(limit)
        ),
        query(
          deliveryCompaniesRef,
          where('contactInfo.email', '>=', searchLower),
          where('contactInfo.email', '<=', searchLower + '\uf8ff'),
          limit(limit)
        )
      ];

      const results = await Promise.all(queries.map(q => getDocs(q)));
      const companiesMap = new Map();

      // Combine results and remove duplicates
      results.forEach(snapshot => {
        snapshot.forEach(doc => {
          if (!companiesMap.has(doc.id)) {
            companiesMap.set(doc.id, {
              id: doc.id,
              ...doc.data()
            });
          }
        });
      });

      return Array.from(companiesMap.values()).slice(0, limit);
    } catch (error) {
      console.error('Error searching delivery companies:', error);
      throw error;
    }
  }

  /**
   * Get companies by status
   */
  async getCompaniesByStatus(status, limit = 50) {
    try {
      const q = query(
        deliveryCompaniesRef,
        where('status', '==', status),
        orderBy('updatedAt', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      const companies = [];

      snapshot.forEach((doc) => {
        companies.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return companies;
    } catch (error) {
      console.error('Error getting companies by status:', error);
      throw error;
    }
  }

  /**
   * Get delivery company statistics
   */
  async getCompanyStats() {
    try {
      const stats = await getDeliveryCompanyStats();
      return stats;
    } catch (error) {
      console.error('Error getting company stats:', error);
      throw error;
    }
  }

  /**
   * SERVICE AREA MANAGEMENT
   */

  /**
   * Get service areas for a company
   */
  async getCompanyServiceAreas(companyId) {
    try {
      const q = query(
        serviceAreasRef,
        where('companyId', '==', companyId),
        orderBy('priority', 'desc')
      );

      const snapshot = await getDocs(q);
      const serviceAreas = [];

      snapshot.forEach((doc) => {
        serviceAreas.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return serviceAreas;
    } catch (error) {
      console.error('Error getting service areas:', error);
      throw error;
    }
  }

  /**
   * Create service area
   */
  async createServiceArea(serviceAreaData, adminEmail) {
    try {
      // Validate service area data
      const { isValid, data: validatedData, errors } = validateServiceArea(serviceAreaData);
      if (!isValid) {
        throw new Error(`Invalid service area data: ${errors.map(e => e.message).join(', ')}`);
      }

      // Check if company exists
      const companyRef = doc(deliveryCompaniesRef, validatedData.companyId);
      const companySnap = await getDoc(companyRef);
      if (!companySnap.exists()) {
        throw new Error('Delivery company not found');
      }

      // Create service area document
      const serviceAreaDoc = createServiceAreaDocument({
        ...validatedData,
        createdBy: adminEmail,
        createdAt: getServerTimestamp(),
        updatedAt: getServerTimestamp()
      });

      const docRef = await addDoc(serviceAreasRef, serviceAreaDoc);

      // Log audit event
      await auditLogService.logDeliveryCompanyAction(
        adminEmail,
        'service_area_created',
        validatedData.companyId,
        {
          serviceAreaId: docRef.id,
          areaName: validatedData.name,
          companyName: companySnap.data().name
        }
      );

      return {
        id: docRef.id,
        ...serviceAreaDoc
      };
    } catch (error) {
      console.error('Error creating service area:', error);
      throw error;
    }
  }

  /**
   * Update service area
   */
  async updateServiceArea(serviceAreaId, updateData, adminEmail) {
    try {
      // Validate update data
      const { isValid, data: validatedData, errors } = validateServiceArea(updateData, true);
      if (!isValid) {
        throw new Error(`Invalid service area data: ${errors.map(e => e.message).join(', ')}`);
      }

      const docRef = doc(serviceAreasRef, serviceAreaId);

      // Check if service area exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Service area not found');
      }

      // Update service area
      const updateDoc = {
        ...validatedData,
        updatedAt: getServerTimestamp(),
        lastModifiedBy: adminEmail
      };

      await updateDoc(docRef, updateDoc);

      // Log audit event
      await auditLogService.logDeliveryCompanyAction(
        adminEmail,
        'service_area_updated',
        docSnap.data().companyId,
        {
          serviceAreaId,
          areaName: validatedData.name || docSnap.data().name,
          updatedFields: Object.keys(validatedData)
        }
      );

      return {
        id: serviceAreaId,
        ...docSnap.data(),
        ...updateDoc
      };
    } catch (error) {
      console.error('Error updating service area:', error);
      throw error;
    }
  }

  /**
   * Delete service area
   */
  async deleteServiceArea(serviceAreaId, adminEmail) {
    try {
      const docRef = doc(serviceAreasRef, serviceAreaId);

      // Check if service area exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Service area not found');
      }

      const serviceAreaData = docSnap.data();

      // Delete service area
      await deleteDoc(docRef);

      // Log audit event
      await auditLogService.logDeliveryCompanyAction(
        adminEmail,
        'service_area_deleted',
        serviceAreaData.companyId,
        {
          serviceAreaId,
          areaName: serviceAreaData.name
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error deleting service area:', error);
      throw error;
    }
  }

  /**
   * PRICING MANAGEMENT
   */

  /**
   * Get pricing structure for a company
   */
  async getCompanyPricing(companyId) {
    try {
      const docRef = doc(pricingStructuresRef, companyId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null; // No pricing structure set yet
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error getting company pricing:', error);
      throw error;
    }
  }

  /**
   * Update pricing structure
   */
  async updateCompanyPricing(companyId, pricingData, adminEmail) {
    try {
      // Validate pricing data
      const { isValid, data: validatedData, errors } = validatePricingStructure(pricingData);
      if (!isValid) {
        throw new Error(`Invalid pricing data: ${errors.map(e => e.message).join(', ')}`);
      }

      // Check if company exists
      const companyRef = doc(deliveryCompaniesRef, companyId);
      const companySnap = await getDoc(companyRef);
      if (!companySnap.exists()) {
        throw new Error('Delivery company not found');
      }

      const docRef = doc(pricingStructuresRef, companyId);

      // Create or update pricing structure
      const pricingDoc = createPricingStructureDocument({
        companyId,
        ...validatedData,
        updatedAt: getServerTimestamp(),
        lastModifiedBy: adminEmail
      });

      await updateDoc(docRef, pricingDoc);

      // Log audit event
      await auditLogService.logDeliveryCompanyAction(
        adminEmail,
        'pricing_updated',
        companyId,
        {
          companyName: companySnap.data().name,
          baseRate: validatedData.baseRates?.standard
        }
      );

      return {
        id: companyId,
        ...pricingDoc
      };
    } catch (error) {
      console.error('Error updating company pricing:', error);
      throw error;
    }
  }

  /**
   * PERFORMANCE MONITORING
   */

  /**
   * Get performance metrics for a company
   */
  async getCompanyPerformance(companyId, period = 'month') {
    try {
      const q = query(
        performanceMetricsRef,
        where('companyId', '==', companyId),
        where('period', '==', period),
        orderBy('periodStart', 'desc'),
        limit(12) // Last 12 periods
      );

      const snapshot = await getDocs(q);
      const metrics = [];

      snapshot.forEach((doc) => {
        metrics.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return metrics;
    } catch (error) {
      console.error('Error getting company performance:', error);
      throw error;
    }
  }

  /**
   * Update performance metrics
   */
  async updatePerformanceMetrics(companyId, metricsData, adminEmail) {
    try {
      const docRef = await addDoc(performanceMetricsRef, createPerformanceMetricsDocument({
        companyId,
        ...metricsData,
        recordedAt: getServerTimestamp(),
        recordedBy: adminEmail
      }));

      return {
        id: docRef.id,
        ...metricsData
      };
    } catch (error) {
      console.error('Error updating performance metrics:', error);
      throw error;
    }
  }

  /**
   * ORDER ASSIGNMENT UTILITIES
   */

  /**
   * Find available companies for delivery
   */
  async findAvailableCompanies(deliveryAddress, deliveryType = 'standard') {
    try {
      // Get all active companies
      const activeCompanies = await this.getCompaniesByStatus('active');

      const availableCompanies = [];

      for (const company of activeCompanies) {
        // Check if company serves the delivery area
        const serviceAreas = await this.getCompanyServiceAreas(company.id);
        const canDeliver = this.checkDeliveryArea(deliveryAddress, serviceAreas);

        if (canDeliver) {
          // Get pricing for this delivery type
          const pricing = await this.getCompanyPricing(company.id);
          const deliveryRate = this.calculateDeliveryRate(
            deliveryAddress,
            deliveryType,
            pricing
          );

          availableCompanies.push({
            ...company,
            deliveryRate,
            estimatedTime: this.estimateDeliveryTime(deliveryAddress, company, deliveryType)
          });
        }
      }

      // Sort by rate (cheapest first) or by performance
      return availableCompanies.sort((a, b) => a.deliveryRate - b.deliveryRate);
    } catch (error) {
      console.error('Error finding available companies:', error);
      throw error;
    }
  }

  /**
   * Check if address is within service area
   */
  checkDeliveryArea(address, serviceAreas) {
    // This would implement geospatial checking
    // For now, return true as placeholder
    return serviceAreas.some(area => area.isActive);
  }

  /**
   * Calculate delivery rate
   */
  calculateDeliveryRate(address, deliveryType, pricing) {
    if (!pricing) return 0;

    const baseRate = pricing.baseRates?.[deliveryType] || pricing.baseRates?.standard || 0;
    // Add distance-based calculation here
    return baseRate;
  }

  /**
   * Estimate delivery time
   */
  estimateDeliveryTime(address, company, deliveryType) {
    // This would implement time estimation logic
    const baseTime = deliveryType === 'express' ? 30 : deliveryType === 'sameDay' ? 60 : 120;
    return `${baseTime} minutes`;
  }

  /**
   * BULK OPERATIONS
   */

  /**
   * Bulk update company status
   */
  async bulkUpdateStatus(companyIds, status, reason, adminEmail) {
    try {
      if (!Array.isArray(companyIds) || companyIds.length === 0) {
        throw new Error('Company IDs array is required');
      }

      const batch = createBatch();
      const results = [];

      for (const companyId of companyIds) {
        const docRef = doc(deliveryCompaniesRef, companyId);
        const updateData = {
          status,
          statusReason: reason || null,
          statusChangedAt: getServerTimestamp(),
          statusChangedBy: adminEmail,
          updatedAt: getServerTimestamp(),
          lastModifiedBy: adminEmail
        };

        batch.update(docRef, updateData);
        results.push({ id: companyId, status });
      }

      await batch.commit();

      // Log bulk audit event
      await auditLogService.logDeliveryCompanyAction(
        adminEmail,
        'bulk_status_update',
        'multiple',
        {
          companyIds,
          newStatus: status,
          reason,
          count: companyIds.length
        }
      );

      return results;
    } catch (error) {
      console.error('Error bulk updating company status:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const deliveryCompanyService = new DeliveryCompanyService();
export default deliveryCompanyService;