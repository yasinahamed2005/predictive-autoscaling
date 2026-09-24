import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Razorpay-shaped payment service. Swap for Stripe by changing the two
// methods below — the controller/route layer doesn't need to change.
// Requires: npm install razorpay
export const paymentService = {
  async createPaymentOrder(amountInRupees, receipt) {
    if (!env.RAZORPAY_KEY_ID) throw ApiError.internal('Payments are not configured on this server');

    const Razorpay = (await import('razorpay')).default;
    const instance = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });

    return instance.orders.create({
      amount: Math.round(amountInRupees * 100), // paise
      currency: 'INR',
      receipt,
    });
  },

  // Verifies the signature Razorpay's checkout returns client-side, proving
  // the payment response wasn't tampered with before we mark an order paid.
  verifyPaymentSignature({ orderId, paymentId, signature }) {
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expected === signature;
  },

  // Verifies the webhook Razorpay calls server-to-server on payment events.
  verifyWebhookSignature(rawBody, signatureHeader) {
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    return expected === signatureHeader;
  },
};
