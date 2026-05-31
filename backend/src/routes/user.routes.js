const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth');

// ===================================================
// User Routes — Quản lý người dùng & kết nối
// ===================================================

// GET  /api/users               — Danh sách users (public)
router.get('/', userController.getUsers);

// GET  /api/users/search        — Tìm kiếm user nâng cao
router.get('/search', userController.searchUsers);

// GET /api/users/companions — Danh sách bạn đồng hành
router.get('/companions', userController.getCompanions);

// GET  /api/users/:id           — Chi tiết user
router.get('/:id', userController.getUserById);

// PUT  /api/users/:id           — Cập nhật profile (cần auth)
router.put('/:id', authenticate, userController.updateUser);

// GET  /api/users/:id/activities — Hoạt động của user
router.get('/:id/activities', userController.getUserActivities);

// POST /api/users/:id/verify — Xác thực người dùng (Tích xanh)
router.post('/:id/verify', authenticate, userController.verifyUser);

// GET /api/users/:id/achievements — Lấy danh sách huy hiệu
router.get('/:id/achievements', userController.getUserAchievements);

module.exports = router;
