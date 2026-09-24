import Notification from '../models/Notification.js';

export const notificationService = {
  create(userId, { type, title, message, meta }) {
    return Notification.create({ user: userId, type, title, message, meta });
  },

  async listForUser(userId, { skip = 0, limit = 20 } = {}) {
    const filter = { user: userId };
    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort('-createdAt').skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false }),
    ]);
    return { items, total, unreadCount };
  },

  markRead(id, userId) {
    return Notification.findOneAndUpdate({ _id: id, user: userId }, { isRead: true }, { new: true });
  },

  markAllRead(userId) {
    return Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  },
};
