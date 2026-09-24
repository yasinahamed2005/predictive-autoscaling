import { validate, rules } from '../middleware/validate.js';

export const createProductValidation = validate({
  name: rules.required('Name'),
  description: rules.required('Description'),
  price: (v) => rules.required('Price')(v) || rules.isNumber()(v),
  category: rules.required('Category'),
  stock: rules.isNumber(),
});

export const createReviewValidation = validate({
  rating: (v) => rules.required('Rating')(v) || rules.isNumber()(v),
});
