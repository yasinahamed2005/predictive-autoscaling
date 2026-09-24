import { ApiError } from '../utils/ApiError.js';

// Lightweight schema-less validator: pass a map of { field: (value) => errorString|null }.
// Kept dependency-free; swap for Zod/Joi if the validation surface grows.
export const validate = (rules) => (req, res, next) => {
  const errors = [];
  for (const [field, check] of Object.entries(rules)) {
    const error = check(req.body[field], req.body);
    if (error) errors.push(`${field}: ${error}`);
  }
  if (errors.length) return next(ApiError.badRequest('Validation failed', errors));
  next();
};

export const rules = {
  required: (label = 'This field') => (v) => (v === undefined || v === null || v === '' ? `${label} is required` : null),
  isEmail: () => (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'must be a valid email' : null),
  minLength: (n) => (v) => (v && String(v).length < n ? `must be at least ${n} characters` : null),
  isNumber: () => (v) => (v !== undefined && isNaN(Number(v)) ? 'must be a number' : null),
  isOneOf: (arr) => (v) => (v && !arr.includes(v) ? `must be one of: ${arr.join(', ')}` : null),
  isPincode: () => (v) => (v && !/^[0-9]{6}$/.test(v) ? 'must be a valid 6-digit pincode' : null),
  isPhone: () => (v) => (v && !/^[0-9]{10}$/.test(v) ? 'must be a valid 10-digit phone number' : null),
};
