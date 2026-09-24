import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { couponService } from './couponService.js';
import { notificationService } from './notificationService.js';
import { ApiError } from '../utils/ApiError.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/index.js';

const FREE_SHIPPING_THRESHOLD = 499;
const SHIPPING_FEE = 49;

const generateOrderNumber = () => `DKN-${Date.now().toString(36).toUpperCase()}-${uuid().slice(0, 4).toUpperCase()}`;

export const orderService = {
  // Places an order from the user's current cart inside a transaction so
  // stock decrements and order creation either both succeed or both roll back.
  async createFromCart(userId, { shippingAddress, paymentMethod, couponCode }) {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) throw ApiError.badRequest('Your cart is empty');

    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) throw ApiError.badRequest(`A product in your cart is no longer available`);
      if (item.product.stock < item.quantity) throw ApiError.badRequest(`Not enough stock for ${item.product.name}`);
    }

    const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    let discount = 0;
    if (couponCode) {
      const result = await couponService.validateAndCompute(couponCode, subtotal);
      discount = result.discount;
    }
    const shippingFee = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal - discount + shippingFee;

    const session = await mongoose.startSession();
    let order;
    try {
      await session.withTransaction(async () => {
        for (const item of cart.items) {
          const updated = await productRepository.decrementStock(item.product._id, item.quantity, session);
          if (!updated) throw ApiError.badRequest(`Not enough stock for ${item.product.name}`);
        }

        order = await orderRepository.create({
          orderNumber: generateOrderNumber(),
          user: userId,
          items: cart.items.map((i) => ({
            product: i.product._id,
            seller: i.product.seller,
            name: i.product.name,
            image: i.product.images?.[0]?.url,
            price: i.product.price,
            quantity: i.quantity,
          })),
          shippingAddress,
          subtotal,
          discount,
          shippingFee,
          total,
          couponCode,
          paymentMethod,
          paymentStatus: PAYMENT_STATUS.PENDING,
          status: ORDER_STATUS.CONFIRMED,
          statusHistory: [{ status: ORDER_STATUS.CONFIRMED, note: 'Order placed' }],
        });

        if (couponCode) await couponService.markUsed(couponCode);
        cart.items = [];
        cart.couponCode = undefined;
        await cart.save({ session });
      });
    } finally {
      session.endSession();
    }

    await notificationService.create(userId, {
      type: 'order',
      title: 'Order placed!',
      message: `Your order ${order.orderNumber} has been placed successfully.`,
      meta: { orderId: order._id },
    });

    return order;
  },

  getById(id) {
    return orderRepository.findById(id);
  },

  listForUser(userId, query) {
    return orderRepository.findForUser(userId, query);
  },

  listForSeller(sellerId, query) {
    return orderRepository.findForSeller(sellerId, query);
  },

  listAll(query) {
    return orderRepository.findAll({ filter: query.status ? { status: query.status } : {}, ...query });
  },

  async updateStatus(id, status, note) {
    const order = await orderRepository.updateStatus(id, status, note);
    if (!order) throw ApiError.notFound('Order not found');

    // Restore stock if an order is cancelled/returned after being confirmed.
    if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED].includes(status)) {
      await Promise.all(order.items.map((i) => productRepository.incrementStock(i.product, i.quantity)));
    }

    await notificationService.create(order.user, {
      type: 'order',
      title: `Order ${status.replace('_', ' ')}`,
      message: `Your order ${order.orderNumber} is now ${status.replace('_', ' ')}.`,
      meta: { orderId: order._id },
    });

    return order;
  },

  async cancel(id, userId, reason) {
    const order = await orderRepository.findById(id);
    if (!order) throw ApiError.notFound('Order not found');
    if (String(order.user._id || order.user) !== String(userId)) throw ApiError.forbidden('Not your order');
    if (![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(order.status)) {
      throw ApiError.badRequest('This order can no longer be cancelled');
    }
    order.cancelReason = reason;
    await order.save();
    return orderService.updateStatus(id, ORDER_STATUS.CANCELLED, reason);
  },
};
