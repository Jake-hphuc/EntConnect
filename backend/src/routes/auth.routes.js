const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { userValidation } = require('../middlewares/validators');
const { authenticate } = require('../middlewares/auth');

// ===================================================
// Auth Routes — Xác thực người dùng
// ===================================================

// POST /api/users/register — Đăng ký tài khoản mới
// Middleware: validate username, email, password
router.post('/register', userValidation.register, authController.register);

// POST /api/users/login — Đăng nhập
// Middleware: validate email, password
router.post('/login', userValidation.login, authController.login);

// POST /api/users/logout — Đăng xuất
// Middleware: authenticate (cần JWT token)
router.post('/logout', authenticate, authController.logout);

// GET /api/users/me — Lấy thông tin user hiện tại
// Middleware: authenticate (cần JWT token)
router.get('/me', authenticate, authController.getMe);

module.exports = router;
