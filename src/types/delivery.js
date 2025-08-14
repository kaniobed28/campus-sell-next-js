/**
 * Type definitions for delivery companies system
 */

// Company Status Types
export const COMPANY_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  TERMINATED: 'terminated'
};

// Vehicle Types
export const VEHICLE_TYPES = {
  BIKE: 'bike',
  SCOOTER: 'scooter',
  CAR: 'car',
  VAN: 'van',
  TRUCK: 'truck'
};

// Delivery Types
export const DELIVERY_TYPES = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  SAME_DAY: 'sameDay',
  SCHEDULED: 'scheduled'
};

// Service Area Types
export const SERVICE_AREA_TYPES = {
  CAMPUS: 'campus',
  DORMITORY: 'dormitory',
  OFF_CAMPUS: 'off-campus',
  CUSTOM: 'custom'
};

// Order Assignment Status
export const ASSIGNMENT_STATUS = {
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Assignment Methods
export const ASSIGNMENT_METHODS = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual',
  FALLBACK: 'fallback'
};

// Communication Types
export const COMMUNICATION_TYPES = {
  MESSAGE: 'message',
  NOTIFICATION: 'notification',
  ALERT: 'alert',
  TICKET: 'ticket'
};

// Communication Priority
export const COMMUNICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Performance Alert Types
export const ALERT_TYPES = {
  PERFORMANCE: 'performance',
  RATING: 'rating',
  DELIVERY_TIME: 'delivery_time',
  SUCCESS_RATE: 'success_rate'
};

// Alert Severity
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Integration Auth Methods
export const AUTH_METHODS = {
  API_KEY: 'apiKey',
  OAUTH: 'oauth',
  BASIC: 'basic'
};

// Pricing Discount Types
export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed'
};

// Performance Periods
export const PERFORMANCE_PERIODS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
};

// Restriction Types
export const RESTRICTION_TYPES = {
  TIME: 'time',
  VEHICLE: 'vehicle',
  WEIGHT: 'weight',
  SIZE: 'size'
};

// Special Services
export const SPECIAL_SERVICES = {
  FRAGILE: 'fragile',
  REFRIGERATED: 'refrigerated',
  OVERSIZED: 'oversized',
  HAZMAT: 'hazmat'
};

// Audit Action Types for Delivery Companies
export const DELIVERY_AUDIT_ACTIONS = {
  COMPANY_CREATED: 'company_created',
  COMPANY_UPDATED: 'company_updated',
  COMPANY_DELETED: 'company_deleted',
  STATUS_CHANGED: 'status_changed',
  SERVICE_AREA_CREATED: 'service_area_created',
  SERVICE_AREA_UPDATED: 'service_area_updated',
  SERVICE_AREA_DELETED: 'service_area_deleted',
  PRICING_UPDATED: 'pricing_updated',
  PERFORMANCE_RECORDED: 'performance_recorded',
  ORDER_ASSIGNED: 'order_assigned',
  ORDER_REASSIGNED: 'order_reassigned',
  INTEGRATION_CONFIGURED: 'integration_configured',
  BULK_STATUS_UPDATE: 'bulk_status_update',
  COMMUNICATION_SENT: 'communication_sent'
};

// Default Operating Hours
export const DEFAULT_OPERATING_HOURS = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '18:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { open: '10:00', close: '16:00', closed: true }
};

// Default Pricing Structure
export const DEFAULT_PRICING = {
  baseRates: {
    standard: 5.99,
    express: 9.99,
    sameDay: 14.99
  },
  distanceRates: [
    { minDistance: 0, maxDistance: 5, rate: 0 },
    { minDistance: 5, maxDistance: 10, rate: 2 },
    { minDistance: 10, maxDistance: 999, rate: 5 }
  ],
  timeBasedRates: [
    { startTime: '09:00', endTime: '17:00', multiplier: 1.0 },
    { startTime: '17:00', endTime: '21:00', multiplier: 1.2 },
    { startTime: '21:00', endTime: '09:00', multiplier: 1.5 }
  ],
  fees: {
    serviceFee: 0.99,
    platformFee: 0.50,
    taxes: []
  },
  minimumOrder: 0,
  freeDeliveryThreshold: 25.00,
  currency: 'USD'
};

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  SUCCESS_RATE: {
    EXCELLENT: 95,
    GOOD: 90,
    ACCEPTABLE: 85,
    POOR: 80
  },
  ON_TIME_RATE: {
    EXCELLENT: 95,
    GOOD: 90,
    ACCEPTABLE: 85,
    POOR: 80
  },
  AVERAGE_RATING: {
    EXCELLENT: 4.5,
    GOOD: 4.0,
    ACCEPTABLE: 3.5,
    POOR: 3.0
  }
};

// Campus Zones (example data)
export const CAMPUS_ZONES = [
  'North Campus',
  'South Campus',
  'East Campus',
  'West Campus',
  'Central Campus',
  'Athletic Complex',
  'Research Park',
  'Medical Center',
  'Student Housing',
  'Faculty Housing'
];

// Dormitory List (example data)
export const DORMITORIES = [
  'Adams Hall',
  'Baker House',
  'Clark Tower',
  'Davis Residence',
  'Evans Hall',
  'Franklin House',
  'Green Hall',
  'Harris Tower',
  'Johnson Residence',
  'King Hall'
];

// Error Messages
export const ERROR_MESSAGES = {
  COMPANY_NOT_FOUND: 'Delivery company not found',
  COMPANY_EXISTS: 'A company with this name already exists',
  INVALID_STATUS: 'Invalid company status',
  INVALID_SERVICE_AREA: 'Invalid service area configuration',
  INVALID_PRICING: 'Invalid pricing structure',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
  VALIDATION_FAILED: 'Data validation failed',
  OPERATION_FAILED: 'Operation failed to complete',
  NETWORK_ERROR: 'Network error occurred',
  UNAUTHORIZED: 'Unauthorized access'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  COMPANY_CREATED: 'Delivery company created successfully',
  COMPANY_UPDATED: 'Delivery company updated successfully',
  COMPANY_DELETED: 'Delivery company deleted successfully',
  STATUS_UPDATED: 'Company status updated successfully',
  SERVICE_AREA_CREATED: 'Service area created successfully',
  SERVICE_AREA_UPDATED: 'Service area updated successfully',
  SERVICE_AREA_DELETED: 'Service area deleted successfully',
  PRICING_UPDATED: 'Pricing structure updated successfully',
  BULK_UPDATE_COMPLETED: 'Bulk update completed successfully'
};

// Form Field Labels
export const FIELD_LABELS = {
  COMPANY_NAME: 'Company Name',
  CONTACT_EMAIL: 'Contact Email',
  CONTACT_PHONE: 'Contact Phone',
  CONTACT_PERSON: 'Contact Person',
  WEBSITE: 'Website',
  REGISTRATION_NUMBER: 'Registration Number',
  TAX_ID: 'Tax ID',
  INSURANCE_POLICY: 'Insurance Policy',
  VEHICLE_FLEET: 'Vehicle Fleet',
  DRIVER_COUNT: 'Number of Drivers',
  MAX_CAPACITY: 'Maximum Capacity',
  OPERATING_HOURS: 'Operating Hours',
  SERVICE_AREAS: 'Service Areas',
  BASE_RATES: 'Base Rates',
  DELIVERY_TYPES: 'Delivery Types'
};

// Validation Rules
export const VALIDATION_RULES = {
  COMPANY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100
  },
  PHONE: {
    PATTERN: /^\+?[\d\s\-\(\)]{10,}$/
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  ZIP_CODE: {
    PATTERN: /^\d{5}(-\d{4})?$/
  },
  TIME: {
    PATTERN: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  COORDINATES: {
    LATITUDE: { MIN: -90, MAX: 90 },
    LONGITUDE: { MIN: -180, MAX: 180 }
  },
  RATING: {
    MIN: 0,
    MAX: 5
  },
  PERCENTAGE: {
    MIN: 0,
    MAX: 100
  }
};

export default {
  COMPANY_STATUS,
  VEHICLE_TYPES,
  DELIVERY_TYPES,
  SERVICE_AREA_TYPES,
  ASSIGNMENT_STATUS,
  ASSIGNMENT_METHODS,
  COMMUNICATION_TYPES,
  COMMUNICATION_PRIORITY,
  ALERT_TYPES,
  ALERT_SEVERITY,
  AUTH_METHODS,
  DISCOUNT_TYPES,
  PERFORMANCE_PERIODS,
  RESTRICTION_TYPES,
  SPECIAL_SERVICES,
  DELIVERY_AUDIT_ACTIONS,
  DEFAULT_OPERATING_HOURS,
  DEFAULT_PRICING,
  PERFORMANCE_THRESHOLDS,
  CAMPUS_ZONES,
  DORMITORIES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FIELD_LABELS,
  VALIDATION_RULES
};