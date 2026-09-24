import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { notificationService } from '../services/notificationService.js';
import { parseListQuery, buildMeta } from '../utils/pagination.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { skip, limit, page } = parseListQuery(req.query);
  const { items, total, unreadCount } = await notificationService.listForUser(req.user._id, { skip, limit });
  success(res, 200, items, { ...buildMeta(total, page, limit), unreadCount });
});
export const markNotificationRead = asyncHandler(async (req, res) =>
  success(res, 200, await notificationService.markRead(req.params.id, req.user._id)));
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  success(res, 200, { message: 'All notifications marked as read' });
});
