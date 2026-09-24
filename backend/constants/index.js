export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin',
});

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

export const PAYMENT_METHODS = Object.freeze({
  COD: 'cod',
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
});

export const COUPON_TYPE = Object.freeze({
  PERCENT: 'percent',
  FLAT: 'flat',
});

export const NOTIFICATION_TYPE = Object.freeze({
  ORDER: 'order',
  PROMOTION: 'promotion',
  SYSTEM: 'system',
});
