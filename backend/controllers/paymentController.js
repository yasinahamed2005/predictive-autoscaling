import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { paymentService } from '../services/paymentService.js';
import { ApiError } from '../utils/ApiError.js';
import Order from '../models/Order.js';
import { PAYMENT_STATUS } from '../constants/index.js';

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, receipt } = req.body;
  const paymentOrder = await paymentService.createPaymentOrder(amount, receipt);
  success(res, 201, paymentOrder);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, dukaanOrderId } = req.body;
  const isValid = paymentService.verifyPaymentSignature({ orderId, paymentId, signature });
  if (!isValid) throw ApiError.badRequest('Payment verification failed');

  const order = await Order.findByIdAndUpdate(
    dukaanOrderId,
    { paymentStatus: PAYMENT_STATUS.PAID, paymentRef: paymentId },
    { new: true }
  );
  success(res, 200, order);
});

// Called server-to-server by the payment gateway — not by the browser.
export const paymentWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const isValid = paymentService.verifyWebhookSignature(req.rawBody, signature);
  if (!isValid) throw ApiError.unauthorized('Invalid webhook signature');

  // TODO: handle req.body.event (payment.captured, payment.failed, etc.)
  // and update the matching Order's paymentStatus accordingly.
  res.status(200).json({ received: true });
});
