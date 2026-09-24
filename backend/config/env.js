import dotenv from 'dotenv';
dotenv.config();

const get = (key, fallback = undefined) => process.env[key] ?? fallback;

export const env = {
  NODE_ENV: get('NODE_ENV', 'development'),
  PORT: Number(get('PORT', 5000)),
  CLIENT_URL: get('CLIENT_URL', 'http://localhost:5173'),

  MONGODB_URI: get('MONGODB_URI'),

  JWT_ACCESS_SECRET: get('JWT_ACCESS_SECRET'),
  JWT_ACCESS_EXPIRES: get('JWT_ACCESS_EXPIRES', '15m'),
  JWT_REFRESH_SECRET: get('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES: get('JWT_REFRESH_EXPIRES', '30d'),

  GOOGLE_CLIENT_ID: get('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: get('GOOGLE_CLIENT_SECRET'),
  GOOGLE_CALLBACK_URL: get('GOOGLE_CALLBACK_URL'),

  FIREBASE_PROJECT_ID: get('FIREBASE_PROJECT_ID'),
  FIREBASE_CLIENT_EMAIL: get('FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: get('FIREBASE_PRIVATE_KEY'),

  SMTP_HOST: get('SMTP_HOST'),
  SMTP_PORT: Number(get('SMTP_PORT', 587)),
  SMTP_USER: get('SMTP_USER'),
  SMTP_PASS: get('SMTP_PASS'),
  EMAIL_FROM: get('EMAIL_FROM', 'Dukaan <no-reply@dukaan.example>'),

  RAZORPAY_KEY_ID: get('RAZORPAY_KEY_ID'),
  RAZORPAY_KEY_SECRET: get('RAZORPAY_KEY_SECRET'),
  RAZORPAY_WEBHOOK_SECRET: get('RAZORPAY_WEBHOOK_SECRET'),

  RATE_LIMIT_WINDOW_MS: Number(get('RATE_LIMIT_WINDOW_MS', 900000)),
  RATE_LIMIT_MAX: Number(get('RATE_LIMIT_MAX', 200)),
};

export const isProd = env.NODE_ENV === 'production';
