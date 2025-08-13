// types/admin.js
// Admin system type definitions and constants

export const ADMIN_ROLES = {
  PRINCIPAL: 'principal',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

export const ADMIN_PERMISSIONS = {
  USER_MANAGEMENT: 'user_management',
  PRODUCT_MODERATION: 'product_moderation',
  CATEGORY_MANAGEMENT: 'category_management',
  DELIVERY_MANAGEMENT: 'delivery_management',
  ANALYTICS_VIEW: 'analytics_view',
  PLATFORM_SETTINGS: 'platform_settings',
  ADMIN_MANAGEMENT: 'admin_management',
  AUDIT_LOGS: 'audit_logs'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
};

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  REMOVED: 'removed'
};

export const AUDIT_ACTION_TYPES = {
  USER_SUSPENDED: 'user_suspended',
  USER_ACTIVATED: 'user_activated',
  USER_BANNED: 'user_banned',
  PRODUCT_BLOCKED: 'product_blocked',
  PRODUCT_REMOVED: 'product_removed',
  PRODUCT_RESTORED: 'product_restored',
  CATEGORY_CREATED: 'category_created',
  CATEGORY_UPDATED: 'category_updated',
  CATEGORY_DELETED: 'category_deleted',
  ADMIN_CREATED: 'admin_created',
  ADMIN_UPDATED: 'admin_updated',
  ADMIN_REMOVED: 'admin_removed',
  SETTINGS_UPDATED: 'settings_updated'
};

/**
 * Admin user data structure
 * @typedef {Object} AdminUser
 * @property {string} email - Admin email address
 * @property {string} role - Admin role (principal, admin, moderator)
 * @property {string[]} permissions - Array of permissions
 * @property {Date} createdAt - Creation timestamp
 * @property {string} createdBy - Email of admin who created this account
 * @property {boolean} isActive - Whether admin account is active
 * @property {Date|null} lastLogin - Last login timestamp
 * @property {Date|null} suspendedAt - Suspension timestamp
 * @property {string|null} suspendedBy - Email of admin who suspended this account
 * @property {string|null} suspensionReason - Reason for suspension
 */

/**
 * Audit log entry structure
 * @typedef {Object} AuditLog
 * @property {string} id - Unique log entry ID
 * @property {string} adminId - Email of admin who performed the action
 * @property {string} adminEmail - Email of admin (for readability)
 * @property {string} action - Action type from AUDIT_ACTION_TYPES
 * @property {string} targetType - Type of target (user, product, category, etc.)
 * @property {string} targetId - ID of the target entity
 * @property {Object} details - Additional action details
 * @property {Date} timestamp - When the action occurred
 * @property {string} ipAddress - IP address of the admin
 */

/**
 * Extended user data structure for admin management
 * @typedef {Object} ExtendedUser
 * @property {string} uid - User ID
 * @property {string} email - User email
 * @property {string} displayName - User display name
 * @property {string} status - User status (active, suspended, banned)
 * @property {string|null} suspensionReason - Reason for suspension/ban
 * @property {string|null} suspendedBy - Admin who suspended the user
 * @property {Date|null} suspendedAt - Suspension timestamp
 * @property {Date} registrationDate - User registration date
 * @property {Date|null} lastLogin - Last login timestamp
 * @property {number} listingsCount - Number of listings created
 * @property {number} purchasesCount - Number of purchases made
 * @property {number} reportCount - Number of times reported
 */

/**
 * Platform setting structure
 * @typedef {Object} PlatformSetting
 * @property {string} id - Setting ID
 * @property {string} category - Setting category
 * @property {string} key - Setting key
 * @property {any} value - Setting value
 * @property {string} type - Value type (string, number, boolean, object)
 * @property {string} description - Setting description
 * @property {string} updatedBy - Admin who last updated this setting
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Analytics metrics structure
 * @typedef {Object} AnalyticsMetrics
 * @property {number} totalUsers - Total registered users
 * @property {number} activeUsers - Active users in last 30 days
 * @property {number} totalProducts - Total products listed
 * @property {number} activeProducts - Currently active products
 * @property {number} totalTransactions - Total completed transactions
 * @property {number} totalRevenue - Total platform revenue
 * @property {Object} userGrowth - User growth data over time
 * @property {Object} productGrowth - Product listing growth data
 * @property {Object} categoryDistribution - Product distribution by category
 */

// Validation functions
export const validateAdminRole = (role) => {
  return Object.values(ADMIN_ROLES).includes(role);
};

export const validateAdminPermission = (permission) => {
  return Object.values(ADMIN_PERMISSIONS).includes(permission);
};

export const validateUserStatus = (status) => {
  return Object.values(USER_STATUS).includes(status);
};

export const validateProductStatus = (status) => {
  return Object.values(PRODUCT_STATUS).includes(status);
};

// Permission checking utilities
export const hasPermission = (adminData, permission) => {
  if (!adminData || !adminData.permissions) return false;
  return adminData.permissions.includes(permission);
};

export const hasAnyPermission = (adminData, permissions) => {
  if (!adminData || !adminData.permissions) return false;
  return permissions.some(permission => adminData.permissions.includes(permission));
};

export const isPrincipalAdmin = (adminData) => {
  return adminData && adminData.email === 'kaniobed28@gmail.com' && adminData.role === ADMIN_ROLES.PRINCIPAL;
};

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.PRINCIPAL]: Object.values(ADMIN_PERMISSIONS),
  [ADMIN_ROLES.ADMIN]: [
    ADMIN_PERMISSIONS.USER_MANAGEMENT,
    ADMIN_PERMISSIONS.PRODUCT_MODERATION,
    ADMIN_PERMISSIONS.CATEGORY_MANAGEMENT,
    ADMIN_PERMISSIONS.DELIVERY_MANAGEMENT,
    ADMIN_PERMISSIONS.ANALYTICS_VIEW,
    ADMIN_PERMISSIONS.AUDIT_LOGS
  ],
  [ADMIN_ROLES.MODERATOR]: [
    ADMIN_PERMISSIONS.PRODUCT_MODERATION,
    ADMIN_PERMISSIONS.ANALYTICS_VIEW
  ]
};