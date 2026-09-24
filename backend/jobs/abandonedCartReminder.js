import Cart from '../models/Cart.js';
import { notificationService } from '../services/notificationService.js';
import { logger } from '../utils/logger.js';

// Finds carts that have had items sitting untouched for 24h+ and nudges
// the user with a notification. Run on a schedule (see jobs/index.js).
export const abandonedCartReminder = async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const carts = await Cart.find({ 'items.0': { $exists: true }, updatedAt: { $lt: cutoff } });

    for (const cart of carts) {
      await notificationService.create(cart.user, {
        type: 'promotion',
        title: 'You left something in your cart',
        message: 'Your cart items are waiting — complete your order before they sell out.',
      });
    }
    if (carts.length) logger.info(`Sent ${carts.length} abandoned cart reminders`);
  } catch (err) {
    logger.error(`abandonedCartReminder failed: ${err.message}`);
  }
};
