export const SETTINGS_TABS = {
  POLICIES: 'policies',
  AUTO_RESPONSES: 'autoresponses', 
  NOTIFICATIONS: 'notifications'
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const DEFAULT_SETTINGS = {
  policies: null,
  autoResponses: [],
  notifications: null
};

export const PAYMENT_METHODS = [
  { value: 'venmo', label: 'Venmo' },
  { value: 'cash', label: 'Cash' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'zelle', label: 'Zelle' }
];

export const SHIPPING_METHODS = [
  { value: 'campus_pickup', label: 'Campus Pickup' },
  { value: 'local_delivery', label: 'Local Delivery' },
  { value: 'mail', label: 'Mail/Shipping' }
];

export const RETURN_SHIPPING_OPTIONS = [
  { value: 'buyer_pays', label: 'Buyer Pays Return Shipping' },
  { value: 'seller_pays', label: 'Seller Pays Return Shipping' },
  { value: 'no_returns', label: 'No Returns Accepted' }
];