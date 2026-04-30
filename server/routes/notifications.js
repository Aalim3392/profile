import express from 'express';
import { listNotificationsForUser, markAllNotificationsAsRead, markNotificationAsRead } from '../db/queries.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', (req, res) => {
  res.json({ success: true, data: listNotificationsForUser(req.user) });
});

router.put('/:id/read', (req, res) => {
  const data = markNotificationAsRead(req.params.id, req.user);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  return res.json({ success: true, data });
});

router.put('/read-all', (req, res) => {
  return res.json({ success: true, data: markAllNotificationsAsRead(req.user) });
});

export default router;
