import { validate, rules } from '../middleware/validate.js';

export const registerValidation = validate({
  name: rules.required('Name'),
  email: (v) => rules.required('Email')(v) || rules.isEmail()(v),
  password: (v) => rules.required('Password')(v) || rules.minLength(6)(v),
  phone: rules.isPhone(),
});

export const loginValidation = validate({
  email: (v) => rules.required('Email')(v) || rules.isEmail()(v),
  password: rules.required('Password'),
});

export const forgotPasswordValidation = validate({
  email: (v) => rules.required('Email')(v) || rules.isEmail()(v),
});

export const resetPasswordValidation = validate({
  token: rules.required('Token'),
  password: (v) => rules.required('Password')(v) || rules.minLength(6)(v),
});

export const sendOtpValidation = validate({
  phone: (v) => rules.required('Phone')(v) || rules.isPhone()(v),
});

export const verifyOtpValidation = validate({
  phone: (v) => rules.required('Phone')(v) || rules.isPhone()(v),
  code: rules.required('OTP code'),
});
