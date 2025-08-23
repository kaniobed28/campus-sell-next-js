/**
 * Joi validation schemas for delivery companies management
 */
import Joi from 'joi';

// Basic validation patterns
const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Common schemas
const geoPointSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

const addressSchema = Joi.object({
  street: Joi.string().min(1).max(200).required(),
  city: Joi.string().min(1).max(100).required(),
  state: Joi.string().min(1).max(100).required(),
  zipCode: Joi.string().min(3).max(20).required(),
  country: Joi.string().min(2).max(100).required(),
  coordinates: geoPointSchema.optional()
});

const timeRangeSchema = Joi.object({
  start: Joi.string().pattern(timePattern).required(),
  end: Joi.string().pattern(timePattern).required()
}).custom((value, helpers) => {
  const startTime = new Date(`1970-01-01T${value.start}:00`);
  const endTime = new Date(`1970-01-01T${value.end}:00`);
  
  if (startTime >= endTime) {
    return helpers.error('time.invalid');
  }
  
  return value;
}, 'Time range validation');

const operatingHoursSchema = Joi.object({
  monday: Joi.array().items(timeRangeSchema).default([]),
  tuesday: Joi.array().items(timeRangeSchema).default([]),
  wednesday: Joi.array().items(timeRangeSchema).default([]),
  thursday: Joi.array().items(timeRangeSchema).default([]),
  friday: Joi.array().items(timeRangeSchema).default([]),
  saturday: Joi.array().items(timeRangeSchema).default([]),
  sunday: Joi.array().items(timeRangeSchema).default([]),
  holidays: Joi.array().items(timeRangeSchema).default([])
});

// License schema
const licenseSchema = Joi.object({
  id: Joi.string().optional(),
  type: Joi.string().min(1).max(100).required(),
  number: Joi.string().min(1).max(100).required(),
  issuedBy: Joi.string().min(1).max(200).required(),
  issuedDate: Joi.date().max('now').required(),
  expiryDate: Joi.date().greater(Joi.ref('issuedDate')).required(),
  documentUrl: Joi.string().uri().optional(),
  isActive: Joi.boolean().default(true)
});

// Insurance schema
const insuranceSchema = Joi.object({
  provider: Joi.string().min(1).max(200).required(),
  policyNumber: Joi.string().min(1).max(100).required(),
  coverageAmount: Joi.number().positive().required(),
  expiryDate: Joi.date().greater('now').required(),
  documentUrl: Joi.string().uri().optional(),
  isActive: Joi.boolean().default(true)
});

// Banking details schema
const bankingDetailsSchema = Joi.object({
  accountHolderName: Joi.string().min(1).max(200).required(),
  bankName: Joi.string().min(1).max(200).required(),
  accountNumber: Joi.string().min(8).max(20).required(),
  routingNumber: Joi.string().min(9).max(9).required(),
  accountType: Joi.string().valid('checking', 'savings').required(),
  isVerified: Joi.boolean().default(false)
});

// Vehicle schema
const vehicleSchema = Joi.object({
  id: Joi.string().optional(),
  type: Joi.string().valid('bicycle', 'motorcycle', 'car', 'van', 'truck').required(),
  make: Joi.string().min(1).max(100).required(),
  model: Joi.string().min(1).max(100).required(),
  year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1).required(),
  licensePlate: Joi.string().min(1).max(20).required(),
  capacity: Joi.object({
    weight: Joi.number().positive().required(),
    volume: Joi.number().positive().required(),
    items: Joi.number().integer().positive().required()
  }).required(),
  isActive: Joi.boolean().default(true),
  registrationExpiry: Joi.date().greater('now').required(),
  insuranceExpiry: Joi.date().greater('now').required()
});

// Pricing schemas
const distanceRateSchema = Joi.object({
  minDistance: Joi.number().min(0).required(),
  maxDistance: Joi.number().greater(Joi.ref('minDistance')).required(),
  rate: Joi.number().positive().required()
});

const timeRateSchema = Joi.object({
  timeSlot: timeRangeSchema.required(),
  multiplier: Joi.number().positive().required(),
  dayOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).optional()
});

const promotionalRateSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(500).required(),
  discountType: Joi.string().valid('percentage', 'fixed').required(),
  discountValue: Joi.number().positive().required(),
  validFrom: Joi.date().required(),
  validTo: Joi.date().greater(Joi.ref('validFrom')).required(),
  conditions: Joi.object({
    minOrderValue: Joi.number().positive().optional(),
    maxUses: Joi.number().integer().positive().optional(),
    applicableAreas: Joi.array().items(Joi.string()).optional(),
    applicableDeliveryTypes: Joi.array().items(
      Joi.string().valid('standard', 'express', 'same-day', 'scheduled')
    ).optional()
  }).default({}),
  isActive: Joi.boolean().default(true)
});

const taxRateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  rate: Joi.number().positive().required(),
  type: Joi.string().valid('percentage', 'fixed').required(),
  applicableAreas: Joi.array().items(Joi.string()).optional()
});

const pricingStructureSchema = Joi.object({
  companyId: Joi.string().required(),
  baseRates: Joi.object({
    standard: Joi.number().positive().required(),
    express: Joi.number().positive().required(),
    sameDay: Joi.number().positive().required(),
    scheduled: Joi.number().positive().default(0)
  }).required(),
  distanceRates: Joi.array().items(distanceRateSchema).default([]),
  timeBasedRates: Joi.array().items(timeRateSchema).default([]),
  promotionalRates: Joi.array().items(promotionalRateSchema).default([]),
  fees: Joi.object({
    serviceFee: Joi.number().min(0).default(0),
    platformFee: Joi.number().min(0).default(0),
    taxes: Joi.array().items(taxRateSchema).default([])
  }).default({}),
  minimumOrder: Joi.number().min(0).default(0),
  freeDeliveryThreshold: Joi.number().min(0).default(0),
  currency: Joi.string().length(3).default('USD'),
  lastUpdated: Joi.date().default(() => new Date())
});

// Service area schema
const areaRestrictionSchema = Joi.object({
  type: Joi.string().valid('time', 'vehicle', 'weight', 'custom').required(),
  description: Joi.string().max(500).required(),
  conditions: Joi.object().required(),
  isActive: Joi.boolean().default(true)
});

const serviceAreaSchema = Joi.object({
  id: Joi.string().optional(),
  companyId: Joi.string().required(),
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(500).optional(),
  type: Joi.string().valid('campus', 'dormitory', 'off-campus', 'custom').required(),
  boundaries: Joi.object({
    coordinates: Joi.array().items(geoPointSchema).min(3).required()
  }).required(),
  centerPoint: geoPointSchema.required(),
  radius: Joi.number().positive().optional(),
  campusZones: Joi.array().items(Joi.string()).default([]),
  restrictions: Joi.array().items(areaRestrictionSchema).default([]),
  deliveryTimeEstimate: Joi.object({
    standard: timeRangeSchema.required(),
    express: timeRangeSchema.required(),
    sameDay: timeRangeSchema.required()
  }).required(),
  isActive: Joi.boolean().default(true),
  priority: Joi.number().integer().min(1).max(10).default(5),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(() => new Date())
});

// Integration config schema
const integrationConfigSchema = Joi.object({
  companyId: Joi.string().required(),
  apiEndpoint: Joi.string().uri().optional(),
  apiKey: Joi.string().optional(),
  webhookUrl: Joi.string().uri().optional(),
  supportedFeatures: Joi.object({
    orderDispatch: Joi.boolean().default(false),
    realTimeTracking: Joi.boolean().default(false),
    statusUpdates: Joi.boolean().default(false),
    rateCalculation: Joi.boolean().default(false)
  }).default({}),
  rateLimits: Joi.object({
    requestsPerMinute: Joi.number().integer().positive().default(60),
    requestsPerHour: Joi.number().integer().positive().default(1000),
    requestsPerDay: Joi.number().integer().positive().default(10000)
  }).default({}),
  isActive: Joi.boolean().default(false),
  lastSync: Joi.date().optional(),
  errorCount: Joi.number().integer().min(0).default(0),
  lastError: Joi.string().optional()
});

// Main delivery company schema
export const deliveryCompanySchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().min(1).max(200).required(),
  slug: Joi.string().min(1).max(200).optional(),
  contactInfo: Joi.object({
    email: Joi.string().pattern(emailPattern).required(),
    phone: Joi.string().pattern(phonePattern).required(),
    address: addressSchema.required(),
    contactPerson: Joi.string().min(1).max(200).required(),
    website: Joi.string().uri().optional()
  }).required(),
  businessInfo: Joi.object({
    registrationNumber: Joi.string().min(1).max(100).required(),
    taxId: Joi.string().min(1).max(100).required(),
    insuranceInfo: insuranceSchema.required(),
    licenses: Joi.array().items(licenseSchema).min(1).required(),
    bankingInfo: bankingDetailsSchema.required()
  }).required(),
  operationalInfo: Joi.object({
    vehicleFleet: Joi.array().items(vehicleSchema).min(1).required(),
    driverCount: Joi.number().integer().positive().required(),
    operatingHours: operatingHoursSchema.required(),
    maxDailyCapacity: Joi.number().integer().positive().required(),
    currentCapacity: Joi.number().integer().min(0).default(0)
  }).required(),
  capabilities: Joi.object({
    vehicleTypes: Joi.array().items(
      Joi.string().valid('bicycle', 'motorcycle', 'car', 'van', 'truck')
    ).min(1).required(),
    maxCapacity: Joi.number().positive().required(),
    deliveryTypes: Joi.array().items(
      Joi.string().valid('standard', 'express', 'same-day', 'scheduled')
    ).min(1).required(),
    specialServices: Joi.array().items(Joi.string()).default([])
  }).required(),
  serviceAreas: Joi.array().items(Joi.string()).default([]),
  pricing: pricingStructureSchema.required(),
  integrationConfig: integrationConfigSchema.optional(),
  status: Joi.string().valid('pending', 'active', 'suspended', 'terminated').default('pending'),
  metadata: Joi.object({
    createdAt: Joi.date().default(() => new Date()),
    updatedAt: Joi.date().default(() => new Date()),
    createdBy: Joi.string().required(),
    lastModifiedBy: Joi.string().optional(),
    version: Joi.number().integer().positive().default(1)
  }).default({})
});

// Form validation schema (simplified for admin forms)
export const deliveryCompanyFormSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  email: Joi.string().pattern(emailPattern).required(),
  phone: Joi.string().pattern(phonePattern).required(),
  contactPerson: Joi.string().min(1).max(200).required(),
  website: Joi.string().uri().optional().allow(''),
  address: Joi.object({
    street: Joi.string().min(1).max(200).required(),
    city: Joi.string().min(1).max(100).required(),
    state: Joi.string().min(1).max(100).required(),
    zipCode: Joi.string().min(3).max(20).required(),
    country: Joi.string().min(2).max(100).default('USA')
  }).required(),
  registrationNumber: Joi.string().min(1).max(100).required(),
  taxId: Joi.string().min(1).max(100).required(),
  operatingHours: operatingHoursSchema.optional(),
  maxDailyCapacity: Joi.number().integer().positive().required(),
  vehicleTypes: Joi.array().items(
    Joi.string().valid('bicycle', 'motorcycle', 'car', 'van', 'truck')
  ).min(1).required(),
  deliveryTypes: Joi.array().items(
    Joi.string().valid('standard', 'express', 'same-day', 'scheduled')
  ).min(1).required(),
  baseRates: Joi.object({
    standard: Joi.number().positive().required(),
    express: Joi.number().positive().required(),
    sameDay: Joi.number().positive().required()
  }).required()
});

// Filter validation schema
export const deliveryCompanyFiltersSchema = Joi.object({
  status: Joi.string().valid('pending', 'active', 'suspended', 'terminated').optional(),
  search: Joi.string().max(200).optional(),
  serviceArea: Joi.string().optional(),
  deliveryType: Joi.string().valid('standard', 'express', 'same-day', 'scheduled').optional(),
  vehicleType: Joi.string().valid('bicycle', 'motorcycle', 'car', 'van', 'truck').optional(),
  minRating: Joi.number().min(1).max(5).optional(),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
  sortBy: Joi.string().valid('name', 'createdAt', 'rating', 'deliveries').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Order assignment schema
export const orderAssignmentSchema = Joi.object({
  id: Joi.string().optional(),
  orderId: Joi.string().required(),
  companyId: Joi.string().required(),
  assignmentMethod: Joi.string().valid('automatic', 'manual', 'priority', 'load-balanced').required(),
  assignmentReason: Joi.string().max(500).required(),
  assignmentScore: Joi.number().min(0).max(100).required(),
  estimatedDeliveryTime: Joi.date().greater('now').required(),
  cost: Joi.number().positive().required(),
  alternativeOptions: Joi.array().items(Joi.object({
    companyId: Joi.string().required(),
    estimatedDeliveryTime: Joi.date().required(),
    cost: Joi.number().positive().required(),
    score: Joi.number().min(0).max(100).required(),
    reason: Joi.string().required()
  })).default([]),
  status: Joi.string().valid('pending', 'assigned', 'in-transit', 'delivered', 'failed', 'cancelled').default('pending'),
  createdAt: Joi.date().default(() => new Date()),
  assignedBy: Joi.string().required()
});

// Communication schema
export const communicationSchema = Joi.object({
  id: Joi.string().optional(),
  type: Joi.string().valid('message', 'notification', 'alert', 'ticket').required(),
  from: Joi.string().required(),
  to: Joi.array().items(Joi.string()).min(1).required(),
  subject: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).max(5000).required(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  attachments: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    type: Joi.string().required(),
    size: Joi.number().positive().required(),
    url: Joi.string().uri().required()
  })).default([]),
  threadId: Joi.string().optional(),
  parentId: Joi.string().optional(),
  createdAt: Joi.date().default(() => new Date())
});

// Export validation functions
export const validateDeliveryCompany = (data) => {
  return deliveryCompanySchema.validate(data, { abortEarly: false });
};

export const validateDeliveryCompanyForm = (data) => {
  return deliveryCompanyFormSchema.validate(data, { abortEarly: false });
};

export const validateDeliveryCompanyFilters = (data) => {
  return deliveryCompanyFiltersSchema.validate(data, { abortEarly: false });
};

export const validateServiceArea = (data) => {
  return serviceAreaSchema.validate(data, { abortEarly: false });
};

export const validatePricingStructure = (data) => {
  return pricingStructureSchema.validate(data, { abortEarly: false });
};

export const validateOrderAssignment = (data) => {
  return orderAssignmentSchema.validate(data, { abortEarly: false });
};

export const validateCommunication = (data) => {
  return communicationSchema.validate(data, { abortEarly: false });
};

export default {
  deliveryCompanySchema,
  deliveryCompanyFormSchema,
  deliveryCompanyFiltersSchema,
  serviceAreaSchema,
  pricingStructureSchema,
  orderAssignmentSchema,
  communicationSchema,
  validateDeliveryCompany,
  validateDeliveryCompanyForm,
  validateDeliveryCompanyFilters,
  validateServiceArea,
  validatePricingStructure,
  validateOrderAssignment,
  validateCommunication
};