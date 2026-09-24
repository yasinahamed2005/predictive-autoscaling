import { logger } from '../utils/logger.js';

// Placeholder for releasing stock "soft holds" on orders whose payment
// never completed (e.g. an unpaid order older than 30 minutes). Wire this
// up once a stock-reservation step is added to checkout.
export const staleReservationCleanup = async () => {
  logger.debug('staleReservationCleanup: no-op (implement once stock reservations are added)');
};
