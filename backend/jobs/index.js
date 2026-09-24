import { logger } from '../utils/logger.js';
import { abandonedCartReminder } from './abandonedCartReminder.js';
import { staleReservationCleanup } from './staleReservationCleanup.js';

// Minimal interval-based scheduler so the project has no extra dependency.
// Swap for node-cron or a proper job queue (BullMQ) once you need retries,
// concurrency control, or multi-instance coordination.
const HOUR = 60 * 60 * 1000;

export const startJobs = () => {
  setInterval(abandonedCartReminder, 6 * HOUR);
  setInterval(staleReservationCleanup, HOUR);
  logger.info('Background jobs scheduled');
};
