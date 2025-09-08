/**
 * Firebase collections and utilities for delivery companies
 */

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

import { db } from '../firebase';

// Collection references
export const deliveryCompaniesRef = collection(db, 'deliveryCompanies');
export const serviceAreasRef = collection(db, 'serviceAreas');
export const pricingStructuresRef = collection(db, 'pricingStructures');
export const performanceMetricsRef = collection(db, 'performanceMetrics');
export const orderAssignmentsRef = collection(db, 'orderAssignments');
export const communicationsRef = collection(db, 'communications');
export const integrationsRef = collection(db, 'integrations');
export const financialRecordsRef = collection(db, 'financialRecords');

/**
 * Document creation utilities
 */

export const createDeliveryCompanyDocument = (data) => ({
  name: data.name,
  slug: data.slug,
  contactInfo: {
    email: data.contactInfo?.email || '',
    phone: data.contactInfo?.phone || '',
    address: data.contactInfo?.address || {},
    contactPerson: data.contactInfo?.contactPerson || '',
    website: data.contactInfo?.website || ''
  },
  businessInfo: {
    registrationNumber: data.businessInfo?.registrationNumber || '',
    taxId: data.businessInfo?.taxId || '',
    insurancePolicy: data.businessInfo?.insurancePolicy || '',
    licenses: data.businessInfo?.licenses || [],
    bankingInfo: data.businessInfo?.bankingInfo || {}
  },
  operationalInfo: {
    vehicleFleet: data.operationalInfo?.vehicleFleet || [],
    driverCount: data.operationalInfo?.driverCount || 0,
    operatingHours: data.operationalInfo?.operatingHours || {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    maxDailyCapacity: data.operationalInfo?.maxDailyCapacity || 100
  },
  capabilities: {
    vehicleTypes: data.capabilities?.vehicleTypes || ['bike', 'car'],
    maxCapacity: data.capabilities?.maxCapacity || 50,
    deliveryTypes: data.capabilities?.deliveryTypes || ['standard'],
    specialServices: data.capabilities?.specialServices || []
  },
  status: data.status || 'pending',
  statusReason: data.statusReason || null,
  statusChangedAt: data.statusChangedAt || null,
  statusChangedBy: data.statusChangedBy || null,
  integrationConfig: data.integrationConfig || {
    hasAPI: false,
    apiEndpoint: null,
    webhookUrl: null,
    authMethod: null,
    isActive: false
  },
  createdAt: data.createdAt || serverTimestamp(),
  updatedAt: data.updatedAt || serverTimestamp(),
  createdBy: data.createdBy,
  lastModifiedBy: data.lastModifiedBy || data.createdBy
});

export const createServiceAreaDocument = (data) => ({
  companyId: data.companyId,
  name: data.name,
  description: data.description || '',
  type: data.type || 'custom', // 'campus', 'dormitory', 'off-campus', 'custom'
  boundaries: data.boundaries || {
    type: 'Polygon',
    coordinates: []
  },
  centerPoint: data.centerPoint || {
    latitude: 0,
    longitude: 0
  },
  radius: data.radius || 0, // in kilometers
  campusZones: data.campusZones || [],
  restrictions: data.restrictions || [],
  deliveryTimeEstimate: data.deliveryTimeEstimate || {
    min: 30,
    max: 60,
    unit: 'minutes'
  },
  isActive: data.isActive !== undefined ? data.isActive : true,
  priority: data.priority || 1,
  createdAt: data.createdAt || serverTimestamp(),
  updatedAt: data.updatedAt || serverTimestamp(),
  createdBy: data.createdBy,
  lastModifiedBy: data.lastModifiedBy || data.createdBy
});

export const createPricingStructureDocument = (data) => ({
  companyId: data.companyId,
  baseRates: {
    standard: data.baseRates?.standard || 0,
    express: data.baseRates?.express || 0,
    sameDay: data.baseRates?.sameDay || 0
  },
  distanceRates: data.distanceRates || [
    { minDistance: 0, maxDistance: 5, rate: 0 },
    { minDistance: 5, maxDistance: 10, rate: 2 },
    { minDistance: 10, maxDistance: 999, rate: 5 }
  ],
  timeBasedRates: data.timeBasedRates || [
    { startTime: '09:00', endTime: '17:00', multiplier: 1.0 },
    { startTime: '17:00', endTime: '21:00', multiplier: 1.2 },
    { startTime: '21:00', endTime: '09:00', multiplier: 1.5 }
  ],
  promotionalRates: data.promotionalRates || [],
  fees: {
    serviceFee: data.fees?.serviceFee || 0,
    platformFee: data.fees?.platformFee || 0,
    taxes: data.fees?.taxes || []
  },
  minimumOrder: data.minimumOrder || 0,
  freeDeliveryThreshold: data.freeDeliveryThreshold || 0,
  currency: data.currency || 'USD',
  isActive: data.isActive !== undefined ? data.isActive : true,
  effectiveFrom: data.effectiveFrom || serverTimestamp(),
  effectiveTo: data.effectiveTo || null,
  createdAt: data.createdAt || serverTimestamp(),
  updatedAt: data.updatedAt || serverTimestamp(),
  createdBy: data.createdBy,
  lastModifiedBy: data.lastModifiedBy || data.createdBy
});

export const createPerformanceMetricsDocument = (data) => ({
  companyId: data.companyId,
  period: data.period || 'month', // 'day', 'week', 'month', 'quarter', 'year'
  periodStart: data.periodStart || serverTimestamp(),
  periodEnd: data.periodEnd || serverTimestamp(),
  deliveryStats: {
    totalDeliveries: data.deliveryStats?.totalDeliveries || 0,
    successfulDeliveries: data.deliveryStats?.successfulDeliveries || 0,
    failedDeliveries: data.deliveryStats?.failedDeliveries || 0,
    cancelledDeliveries: data.deliveryStats?.cancelledDeliveries || 0,
    successRate: data.deliveryStats?.successRate || 0
  },
  timeMetrics: {
    averageDeliveryTime: data.timeMetrics?.averageDeliveryTime || 0,
    onTimeDeliveryRate: data.timeMetrics?.onTimeDeliveryRate || 0,
    fastestDelivery: data.timeMetrics?.fastestDelivery || 0,
    slowestDelivery: data.timeMetrics?.slowestDelivery || 0
  },
  customerSatisfaction: {
    averageRating: data.customerSatisfaction?.averageRating || 0,
    totalRatings: data.customerSatisfaction?.totalRatings || 0,
    ratingDistribution: data.customerSatisfaction?.ratingDistribution || {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
  },
  financialMetrics: {
    totalEarnings: data.financialMetrics?.totalEarnings || 0,
    totalOrders: data.financialMetrics?.totalOrders || 0,
    averageOrderValue: data.financialMetrics?.averageOrderValue || 0
  },
  alerts: data.alerts || [],
  recordedAt: data.recordedAt || serverTimestamp(),
  recordedBy: data.recordedBy
});

export const createOrderAssignmentDocument = (data) => ({
  orderId: data.orderId,
  companyId: data.companyId,
  assignmentMethod: data.assignmentMethod || 'automatic', // 'automatic', 'manual', 'fallback'
  assignmentScore: data.assignmentScore || 0,
  assignmentCriteria: data.assignmentCriteria || {},
  estimatedDeliveryTime: data.estimatedDeliveryTime,
  actualDeliveryTime: data.actualDeliveryTime || null,
  status: data.status || 'assigned', // 'assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'
  trackingInfo: data.trackingInfo || {
    trackingNumber: null,
    currentLocation: null,
    estimatedArrival: null,
    updates: []
  },
  performanceData: data.performanceData || {
    assignedAt: serverTimestamp(),
    acceptedAt: null,
    pickedUpAt: null,
    deliveredAt: null,
    totalTime: null
  },
  createdAt: data.createdAt || serverTimestamp(),
  updatedAt: data.updatedAt || serverTimestamp(),
  assignedBy: data.assignedBy
});

export const createCommunicationDocument = (data) => ({
  type: data.type || 'message', // 'message', 'notification', 'alert', 'ticket'
  from: data.from,
  to: data.to || [],
  subject: data.subject || '',
  content: data.content || '',
  priority: data.priority || 'normal', // 'low', 'normal', 'high', 'urgent'
  status: data.status || 'sent', // 'sent', 'delivered', 'read', 'responded'
  attachments: data.attachments || [],
  metadata: data.metadata || {},
  createdAt: data.createdAt || serverTimestamp(),
  readAt: data.readAt || null,
  respondedAt: data.respondedAt || null
});

/**
 * Query builders
 */

export const buildDeliveryCompanyQuery = (filters = {}) => {
  let q = query(deliveryCompaniesRef);

  // Add filters
  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }

  if (filters.capabilities) {
    q = query(q, where('capabilities.deliveryTypes', 'array-contains-any', filters.capabilities));
  }

  // Add ordering
  const orderField = filters.orderBy || 'updatedAt';
  const orderDirection = filters.orderDirection || 'desc';
  q = query(q, orderBy(orderField, orderDirection));

  // Add pagination
  if (filters.limit) {
    q = query(q, limit(filters.limit));
  }

  if (filters.startAfter) {
    q = query(q, startAfter(filters.startAfter));
  }

  return q;
};

export const buildServiceAreaQuery = (filters = {}) => {
  let q = query(serviceAreasRef);

  if (filters.companyId) {
    q = query(q, where('companyId', '==', filters.companyId));
  }

  if (filters.type) {
    q = query(q, where('type', '==', filters.type));
  }

  if (filters.isActive !== undefined) {
    q = query(q, where('isActive', '==', filters.isActive));
  }

  q = query(q, orderBy('priority', 'desc'));

  if (filters.limit) {
    q = query(q, limit(filters.limit));
  }

  return q;
};

/**
 * Statistics and aggregation utilities
 */

export const getDeliveryCompanyStats = async () => {
  try {
    const [
      totalSnapshot,
      activeSnapshot,
      pendingSnapshot,
      suspendedSnapshot
    ] = await Promise.all([
      getDocs(query(deliveryCompaniesRef)),
      getDocs(query(deliveryCompaniesRef, where('status', '==', 'active'))),
      getDocs(query(deliveryCompaniesRef, where('status', '==', 'pending'))),
      getDocs(query(deliveryCompaniesRef, where('status', '==', 'suspended')))
    ]);

    return {
      totalCompanies: totalSnapshot.size,
      activeCompanies: activeSnapshot.size,
      pendingCompanies: pendingSnapshot.size,
      suspendedCompanies: suspendedSnapshot.size,
      terminatedCompanies: totalSnapshot.size - activeSnapshot.size - pendingSnapshot.size - suspendedSnapshot.size
    };
  } catch (error) {
    console.error('Error getting delivery company stats:', error);
    throw error;
  }
};

/**
 * Utility functions
 */

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const createBatch = () => {
  return writeBatch(db);
};

export const getServerTimestamp = () => {
  return serverTimestamp();
};

/**
 * Geospatial utilities
 */

export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const isPointInPolygon = (point, polygon) => {
  // Ray casting algorithm for point-in-polygon test
  const x = point.longitude;
  const y = point.latitude;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
};

export const isPointInCircle = (point, center, radius) => {
  const distance = calculateDistance(point, center);
  return distance <= radius;
};

/**
 * Time utilities
 */

export const getCurrentPeriod = (type = 'month') => {
  const now = new Date();
  let start, end;

  switch (type) {
    case 'day':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 7);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), quarter * 3 + 3, 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  return {
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end)
  };
};

export default {
  deliveryCompaniesRef,
  serviceAreasRef,
  pricingStructuresRef,
  performanceMetricsRef,
  orderAssignmentsRef,
  communicationsRef,
  integrationsRef,
  financialRecordsRef,
  createDeliveryCompanyDocument,
  createServiceAreaDocument,
  createPricingStructureDocument,
  createPerformanceMetricsDocument,
  createOrderAssignmentDocument,
  createCommunicationDocument,
  buildDeliveryCompanyQuery,
  buildServiceAreaQuery,
  getDeliveryCompanyStats,
  generateId,
  createSlug,
  createBatch,
  getServerTimestamp,
  calculateDistance,
  isPointInPolygon,
  isPointInCircle,
  getCurrentPeriod
};