/**
 * Validation schemas for delivery companies
 * Uses Joi for comprehensive data validation
 */

import Joi from 'joi';

/**
 * Base schemas for reusable components
 */

const addressSchema = Joi.object({
  street: Joi.string().required().min(1).max(200),
  city: Joi.string().required().min(1).max(100),
  state: Joi.string().required().min(2).max(50),
  zipCode: Joi.string().required().pattern(/^\d{5}(-\d{4})?$/),
  country: Joi.string().default('US').valid('US')
});

const contactInfoSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().required().pattern(/^\+?[\d\s\-\(\)]{10,}$/),
  address: addressSchema.required(),
  contactPerson: Joi.string().required().min(2).max(100),
  website: Joi.string().uri().optional().allow('')
});

const businessInfoSchema = Joi.object({
  registrationNumber: Joi.string().required().min(1).max(50),
  taxId: Joi.string().required().min(1).max(50),
  insurancePolicy: Joi.string().required().min(1).max(100),
  licenses: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    number: Joi.string().required(),
    expiryDate: Joi.date().greater('now').required(),
    issuingAuthority: Joi.string().required()
  })).default([]),
  bankingInfo: Joi.object({
    accountName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    routingNumber: Joi.string().required(),
    bankName: Joi.string().required()
  }).optional()
});

const operatingHoursSchema = Joi.object({
  monday: Joi.object({
    open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    closed: Joi.boolean().default(false)
  }),
  tuesday: Joi.object({
    open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    closed: Joi.boolean().default(false)
  }),
  wednesday: Joi.object({
    open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    closed: Joi.boolean().default(false)
  }),
  thursday: Joi.object({
    open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    closed: Joi.boolean().default(false)
  }),
  friday: Joi.object({
    open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    closed: Joi.boolean().default(false)
  }),
  saturday: Joi.object({
    open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    closed: Joi.boolean().default(false)
  }),
  sunday: Joi.object({
    open: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    close: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    closed: Joi.boolean().default(true)
  })
});

const operationalInfoSchema = Joi.object({
  vehicleFleet: Joi.array().items(Joi.object({
    type: Joi.string().valid('bike', 'scooter', 'car', 'van', 'truck').required(),
    count: Joi.number().integer().min(1).required(),
    capacity: Joi.number().min(1).required(),
    description: Joi.string().optional()
  })).min(1).required(),
  driverCount: Joi.number().integer().min(1).required(),
  operatingHours: operatingHoursSchema.required(),
  maxDailyCapacity: Joi.number().integer().min(1).required()
});

const capabilitiesSchema = Joi.object({
  vehicleTypes: Joi.array().items(
    Joi.string().valid('bike', 'scooter', 'car', 'van', 'truck')
  ).min(1).required(),
  maxCapacity: Joi.number().min(1).required(),
  deliveryTypes: Joi.array().items(
    Joi.string().valid('standard', 'express', 'sameDay', 'scheduled')
  ).min(1).required(),
  specialServices: Joi.array().items(
    Joi.string().valid('fragile', 'refrigerated', 'oversized', 'hazmat')
  ).default([])
});

const geoPointSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

const geoPolygonSchema = Joi.object({
  type: Joi.string().valid('Polygon').default('Polygon'),
  coordinates: Joi.array().items(
    Joi.array().items(
      Joi.array().items(Joi.number()).length(2)
    ).min(4) // Minimum 4 points for a polygon (first and last must be same)
  ).min(1).required()
});

/**
 * Main validation schemas
 */

export const deliveryCompanySchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  contactInfo: contactInfoSchema.required(),
  businessInfo: businessInfoSchema.required(),
  operationalInfo: operationalInfoSchema.required(),
  capabilities: capabilitiesSchema.required(),
  status: Joi.string().valid('pending', 'active', 'suspended', 'terminated').default('pending'),
  integrationConfig: Joi.object({
    hasAPI: Joi.boolean().default(false),
    apiEndpoint: Joi.string().uri().optional().allow(null),
    webhookUrl: Joi.string().uri().optional().allow(null),
    authMethod: Joi.string().valid('apiKey', 'oauth', 'basic').optional().allow(null),
    isActive: Joi.boolean().default(false)
  }).default({})
});

export const deliveryCompanyFormSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  contactInfo: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]{10,}$/).optional(),
    address: addressSchema.optional(),
    contactPerson: Joi.string().min(2).max(100).optional(),
    website: Joi.string().uri().optional().allow('')
  }).optional(),
  businessInfo: Joi.object({
    registrationNumber: Joi.string().min(1).max(50).optional(),
    taxId: Joi.string().min(1).max(50).optional(),
    insurancePolicy: Joi.string().min(1).max(100).optional(),
    licenses: Joi.array().items(Joi.object({
      type: Joi.string().required(),
      number: Joi.string().required(),
      expiryDate: Joi.date().greater('now').required(),
      issuingAuthority: Joi.string().required()
    })).optional(),
    bankingInfo: Joi.object({
      accountName: Joi.string().optional(),
      accountNumber: Joi.string().optional(),
      routingNumber: Joi.string().optional(),
      bankName: Joi.string().optional()
    }).optional()
  }).optional(),
  operationalInfo: operationalInfoSchema.optional(),
  capabilities: capabilitiesSchema.optional(),
  integrationConfig: Joi.object({
    hasAPI: Joi.boolean().optional(),
    apiEndpoint: Joi.string().uri().optional().allow(null, ''),
    webhookUrl: Joi.string().uri().optional().allow(null, ''),
    authMethod: Joi.string().valid('apiKey', 'oauth', 'basic').optional().allow(null),
    isActive: Joi.boolean().optional()
  }).optional()
});

export const serviceAreaSchema = Joi.object({
  companyId: Joi.string().required(),
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().max(500).default(''),
  type: Joi.string().valid('campus', 'dormitory', 'off-campus', 'custom').default('custom'),
  boundaries: geoPolygonSchema.optional(),
  centerPoint: geoPointSchema.optional(),
  radius: Joi.number().min(0).max(50).optional(), // Max 50km radius
  campusZones: Joi.array().items(Joi.string()).default([]),
  restrictions: Joi.array().items(Joi.object({
    type: Joi.string().valid('time', 'vehicle', 'weight', 'size').required(),
    description: Joi.string().required(),
    value: Joi.alternatives().try(Joi.string(), Joi.number()).optional()
  })).default([]),
  deliveryTimeEstimate: Joi.object({
    min: Joi.number().integer().min(1).required(),
    max: Joi.number().integer().min(1).required(),
    unit: Joi.string().valid('minutes', 'hours').default('minutes')
  }).required(),
  isActive: Joi.boolean().default(true),
  priority: Joi.number().integer().min(1).max(10).default(1)
});

export const pricingStructureSchema = Joi.object({
  companyId: Joi.string().required(),
  baseRates: Joi.object({
    standard: Joi.number().min(0).required(),
    express: Joi.number().min(0).required(),
    sameDay: Joi.number().min(0).required()
  }).required(),
  distanceRates: Joi.array().items(Joi.object({
    minDistance: Joi.number().min(0).required(),
    maxDistance: Joi.number().min(0).required(),
    rate: Joi.number().min(0).required()
  })).default([]),
  timeBasedRates: Joi.array().items(Joi.object({
    startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    multiplier: Joi.number().min(0.1).max(5).required()
  })).default([]),
  promotionalRates: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    discountType: Joi.string().valid('percentage', 'fixed').required(),
    discountValue: Joi.number().min(0).required(),
    minOrderValue: Joi.number().min(0).optional(),
    validFrom: Joi.date().required(),
    validTo: Joi.date().greater(Joi.ref('validFrom')).required(),
    isActive: Joi.boolean().default(true)
  })).default([]),
  fees: Joi.object({
    serviceFee: Joi.number().min(0).default(0),
    platformFee: Joi.number().min(0).default(0),
    taxes: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      type: Joi.string().valid('percentage', 'fixed').required(),
      value: Joi.number().min(0).required()
    })).default([])
  }).default({}),
  minimumOrder: Joi.number().min(0).default(0),
  freeDeliveryThreshold: Joi.number().min(0).default(0),
  currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD'),
  isActive: Joi.boolean().default(true),
  effectiveFrom: Joi.date().default(() => new Date()),
  effectiveTo: Joi.date().greater(Joi.ref('effectiveFrom')).optional().allow(null)
});

export const performanceMetricsSchema = Joi.object({
  companyId: Joi.string().required(),
  period: Joi.string().valid('day', 'week', 'month', 'quarter', 'year').default('month'),
  periodStart: Joi.date().required(),
  periodEnd: Joi.date().greater(Joi.ref('periodStart')).required(),
  deliveryStats: Joi.object({
    totalDeliveries: Joi.number().integer().min(0).required(),
    successfulDeliveries: Joi.number().integer().min(0).required(),
    failedDeliveries: Joi.number().integer().min(0).required(),
    cancelledDeliveries: Joi.number().integer().min(0).required(),
    successRate: Joi.number().min(0).max(100).required()
  }).required(),
  timeMetrics: Joi.object({
    averageDeliveryTime: Joi.number().min(0).required(),
    onTimeDeliveryRate: Joi.number().min(0).max(100).required(),
    fastestDelivery: Joi.number().min(0).required(),
    slowestDelivery: Joi.number().min(0).required()
  }).required(),
  customerSatisfaction: Joi.object({
    averageRating: Joi.number().min(0).max(5).required(),
    totalRatings: Joi.number().integer().min(0).required(),
    ratingDistribution: Joi.object({
      1: Joi.number().integer().min(0).required(),
      2: Joi.number().integer().min(0).required(),
      3: Joi.number().integer().min(0).required(),
      4: Joi.number().integer().min(0).required(),
      5: Joi.number().integer().min(0).required()
    }).required()
  }).required(),
  financialMetrics: Joi.object({
    totalEarnings: Joi.number().min(0).required(),
    totalOrders: Joi.number().integer().min(0).required(),
    averageOrderValue: Joi.number().min(0).required()
  }).optional(),
  alerts: Joi.array().items(Joi.object({
    type: Joi.string().valid('performance', 'rating', 'delivery_time', 'success_rate').required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    message: Joi.string().required(),
    threshold: Joi.number().optional(),
    actualValue: Joi.number().optional(),
    createdAt: Joi.date().default(() => new Date())
  })).default([])
});

export const filtersSchema = Joi.object({
  status: Joi.string().valid('pending', 'active', 'suspended', 'terminated').optional(),
  capabilities: Joi.array().items(
    Joi.string().valid('standard', 'express', 'sameDay', 'scheduled')
  ).optional(),
  search: Joi.string().min(2).max(100).optional(),
  orderBy: Joi.string().valid('name', 'createdAt', 'updatedAt', 'status').default('updatedAt'),
  orderDirection: Joi.string().valid('asc', 'desc').default('desc'),
  limit: Joi.number().integer().min(1).max(200).default(50),
  offset: Joi.number().integer().min(0).default(0),
  startAfter: Joi.any().optional()
});

/**
 * Validation functions
 */

export const validateDeliveryCompany = (data) => {
  const { error, value } = deliveryCompanySchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  return {
    isValid: !error,
    data: value,
    errors: error ? error.details : []
  };
};

export const validateDeliveryCompanyForm = (data) => {
  const { error, value } = deliveryCompanyFormSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  return {
    isValid: !error,
    data: value,
    errors: error ? error.details : []
  };
};

export const validateServiceArea = (data, isUpdate = false) => {
  let schema = serviceAreaSchema;
  
  if (isUpdate) {
    // Make all fields optional for updates
    schema = serviceAreaSchema.fork(
      ['companyId', 'name', 'deliveryTimeEstimate'],
      (schema) => schema.optional()
    );
  }

  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  return {
    isValid: !error,
    data: value,
    errors: error ? error.details : []
  };
};

export const validatePricingStructure = (data) => {
  const { error, value } = pricingStructureSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  return {
    isValid: !error,
    data: value,
    errors: error ? error.details : []
  };
};

export const validatePerformanceMetrics = (data) => {
  const { error, value } = performanceMetricsSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  return {
    isValid: !error,
    data: value,
    errors: error ? error.details : []
  };
};

export const validateFilters = (data) => {
  const { error, value } = filtersSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  return {
    isValid: !error,
    data: value,
    errors: error ? error.details : []
  };
};

/**
 * Custom validation helpers
 */

export const validateBusinessHours = (operatingHours) => {
  const errors = [];
  
  Object.entries(operatingHours).forEach(([day, hours]) => {
    if (!hours.closed && hours.open && hours.close) {
      const openTime = new Date(`1970-01-01T${hours.open}:00`);
      const closeTime = new Date(`1970-01-01T${hours.close}:00`);
      
      if (openTime >= closeTime) {
        errors.push(`${day}: Close time must be after open time`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateServiceAreaBoundaries = (boundaries) => {
  if (!boundaries || !boundaries.coordinates) {
    return { isValid: false, errors: ['Boundaries are required'] };
  }
  
  const errors = [];
  
  try {
    const coords = boundaries.coordinates[0];
    
    if (coords.length < 4) {
      errors.push('Polygon must have at least 4 points');
    }
    
    // Check if first and last points are the same (closed polygon)
    const first = coords[0];
    const last = coords[coords.length - 1];
    
    if (first[0] !== last[0] || first[1] !== last[1]) {
      errors.push('Polygon must be closed (first and last points must be the same)');
    }
    
    // Validate coordinate ranges
    coords.forEach((coord, index) => {
      if (coord.length !== 2) {
        errors.push(`Point ${index}: Must have exactly 2 coordinates`);
      } else {
        const [lng, lat] = coord;
        if (lng < -180 || lng > 180) {
          errors.push(`Point ${index}: Longitude must be between -180 and 180`);
        }
        if (lat < -90 || lat > 90) {
          errors.push(`Point ${index}: Latitude must be between -90 and 90`);
        }
      }
    });
    
  } catch (error) {
    errors.push('Invalid boundary format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePricingConsistency = (pricing) => {
  const errors = [];
  
  // Check that express rate is higher than standard
  if (pricing.baseRates.express <= pricing.baseRates.standard) {
    errors.push('Express rate should be higher than standard rate');
  }
  
  // Check that same-day rate is highest
  if (pricing.baseRates.sameDay <= pricing.baseRates.express) {
    errors.push('Same-day rate should be higher than express rate');
  }
  
  // Validate distance rates are in ascending order
  if (pricing.distanceRates && pricing.distanceRates.length > 1) {
    for (let i = 1; i < pricing.distanceRates.length; i++) {
      const prev = pricing.distanceRates[i - 1];
      const curr = pricing.distanceRates[i];
      
      if (curr.minDistance <= prev.maxDistance) {
        errors.push(`Distance rate ${i + 1}: Minimum distance should be greater than previous maximum`);
      }
    }
  }
  
  // Validate promotional rates
  if (pricing.promotionalRates) {
    pricing.promotionalRates.forEach((promo, index) => {
      if (promo.discountType === 'percentage' && promo.discountValue > 100) {
        errors.push(`Promotional rate ${index + 1}: Percentage discount cannot exceed 100%`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  deliveryCompanySchema,
  deliveryCompanyFormSchema,
  serviceAreaSchema,
  pricingStructureSchema,
  performanceMetricsSchema,
  filtersSchema,
  validateDeliveryCompany,
  validateDeliveryCompanyForm,
  validateServiceArea,
  validatePricingStructure,
  validatePerformanceMetrics,
  validateFilters,
  validateBusinessHours,
  validateServiceAreaBoundaries,
  validatePricingConsistency
};