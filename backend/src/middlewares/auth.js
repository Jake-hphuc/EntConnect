const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('./errorHandler');
const config = require('../config');

/**
 * Middleware xác thực JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Kiểm tra user còn tồn tại không
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('Tài khoản không tồn tại hoặc đã bị xoá.', 401));
    }

    // Kiểm tra user còn active không
    if (!user.isActive) {
      return next(new AppError('Tài khoản đã bị vô hiệu hoá.', 403));
    }

    // Gắn user info vào request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token không hợp lệ.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token đã hết hạn. Vui lòng đăng nhập lại.', 401));
    }
    next(error);
  }
};

/**
 * Middleware phân quyền theo role
 * @param  {...string} roles - Các role được phép truy cập
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Vui lòng đăng nhập trước.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
    }

    next();
  };
};

/**
 * Middleware xác thực tuỳ chọn (optional auth)
 * Nếu có token thì gắn user, không có thì vẫn cho qua
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Silently fail - optional auth
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };
