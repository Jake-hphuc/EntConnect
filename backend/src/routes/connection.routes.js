const express = require('express');
const router = express.Router();

// TODO: Import connection controller
// const connectionController = require('../controllers/connection.controller');
// const { authenticate } = require('../middlewares');

// GET    /api/connections/friends         — Danh sách bạn bè
// GET    /api/connections/pending         — Lời mời đang chờ
// GET    /api/connections/suggestions     — Gợi ý kết bạn
// POST   /api/connections/request         — Gửi lời mời kết bạn
// PUT    /api/connections/:id/respond     — Chấp nhận/từ chối
// DEL    /api/connections/:id             — Huỷ kết nối
// GET    /api/connections/status/:userId  — Kiểm tra trạng thái kết nối

router.get('/friends', (req, res) => {
  res.status(501).json({ message: 'List friends - Coming soon' });
});

router.get('/pending', (req, res) => {
  res.status(501).json({ message: 'Pending requests - Coming soon' });
});

router.get('/suggestions', (req, res) => {
  res.status(501).json({ message: 'Connection suggestions - Coming soon' });
});

router.post('/request', (req, res) => {
  res.status(501).json({ message: 'Send friend request - Coming soon' });
});

router.put('/:id/respond', (req, res) => {
  res.status(501).json({ message: 'Respond to request - Coming soon' });
});

router.delete('/:id', (req, res) => {
  res.status(501).json({ message: 'Remove connection - Coming soon' });
});

router.get('/status/:userId', (req, res) => {
  res.status(501).json({ message: 'Check connection status - Coming soon' });
});

module.exports = router;
