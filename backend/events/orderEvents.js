import { EventEmitter } from 'events';

// In-process event bus for order lifecycle events. Swap for a real
// message queue (BullMQ/RabbitMQ/SQS) if this needs to survive restarts
// or scale across multiple server instances.
export const orderEvents = new EventEmitter();

export const ORDER_EVENTS = Object.freeze({
  PLACED: 'order:placed',
  STATUS_CHANGED: 'order:status_changed',
  CANCELLED: 'order:cancelled',
});

// Example listener — wire real side effects (email receipt, seller
// notification, analytics ping) here instead of inline in the service.
orderEvents.on(ORDER_EVENTS.PLACED, (order) => {
  // e.g. mailer.sendOrderConfirmation(order)
});
