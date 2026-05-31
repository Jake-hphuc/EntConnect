const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { activityValidation } = require('../middlewares/validators');
const { authenticate, optionalAuth } = require('../middlewares/auth');

// ===================================================
// Event/Activity Routes — Quản lý hoạt động giải trí
// ===================================================

// GET  /api/events           — Danh sách activities (public, có phân trang)
router.get('/', optionalAuth, activityController.getActivities);

// GET  /api/events/upcoming  — Hoạt động sắp diễn ra
router.get('/upcoming', activityController.getUpcomingActivities);

// POST /api/events/create    — Tạo hoạt động mới (cần đăng nhập)
router.post('/create', authenticate, activityValidation.create, activityController.createActivity);

// GET  /api/events/:id       — Chi tiết activity
router.get('/:id', optionalAuth, activityController.getActivityById);

// PUT  /api/events/:id       — Cập nhật activity (chỉ creator)
router.put('/:id', authenticate, activityController.updateActivity);

// DEL  /api/events/:id       — Xoá activity (creator hoặc admin)
router.delete('/:id', authenticate, activityController.deleteActivity);

// POST /api/events/:id/join  — Tham gia activity
router.post('/:id/join', authenticate, activityController.joinActivity);

// POST /api/events/:id/leave — Rời khỏi activity
router.post('/:id/leave', authenticate, activityController.leaveActivity);

// GET  /api/events/:id/participants — Danh sách participants
router.get('/:id/participants', activityController.getParticipants);

module.exports = router;
