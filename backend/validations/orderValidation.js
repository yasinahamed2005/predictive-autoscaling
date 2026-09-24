import { validate, rules } from '../middleware/validate.js';

export const createOrderValidation = validate({
  paymentMethod: (v) => rules.required('Payment method')(v) || rules.isOneOf(['cod', 'card', 'upi', 'netbanking'])(v),
});

export const addressValidation = validate({
  fullName: rules.required('Full name'),
  phone: (v) => rules.required('Phone')(v) || rules.isPhone()(v),
  line1: rules.required('Address line 1'),
  city: rules.required('City'),
  state: rules.required('State'),
  pincode: (v) => rules.required('Pincode')(v) || rules.isPincode()(v),
});
