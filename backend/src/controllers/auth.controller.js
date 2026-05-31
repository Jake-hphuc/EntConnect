const { validationResult } = require('express-validator');
const { User } = require('../models');
const { generateToken, apiResponse } = require('../utils/helpers');
const { AppError } = require('../middlewares/errorHandler');

// ===================================================
// @desc    Đăng ký tài khoản mới
// @route   POST /api/users/register
// @access  Public
//
// Luồng xử lý:
// 1. Validate input (username, email, password)
// 2. Kiểm tra email/username đã tồn tại chưa
// 3. Tạo user mới (password tự động hash qua pre-save hook)
// 4. Tạo JWT token
// 5. Trả về user info + token
// ===================================================
const register = async (req, res, next) => {
  try {
    // --- Bước 1: Kiểm tra validation errors ---
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array(),
      });
    }

    const { username, email, password, profile, entertainmentPreferences } = req.body;

    // --- Bước 2: Kiểm tra email đã tồn tại chưa ---
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return next(new AppError('Email này đã được sử dụng', 409));
    }

    // --- Bước 3: Kiểm tra username đã tồn tại chưa ---
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return next(new AppError('Username này đã được sử dụng', 409));
    }

    // --- Bước 4: Tạo user mới ---
    // Password sẽ được tự động hash bởi pre-save hook trong User model
    // (sử dụng bcrypt với salt 12 rounds)
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      profile: profile || {},
      entertainmentPreferences: entertainmentPreferences || {},
    });

    // --- Bước 5: Tạo JWT token ---
    // Token chứa: { id, email, role } với thời hạn từ config (mặc định 7 ngày)
    const token = generateToken(newUser);

    // --- Bước 6: Cập nhật thông tin đăng nhập ---
    newUser.lastLogin = new Date();
    newUser.loginCount = 1;
    await newUser.save({ validateBeforeSave: false });

    // --- Bước 7: Trả về response (loại bỏ password) ---
    const userResponse = newUser.toPublicJSON();

    return apiResponse.created(res, {
      user: userResponse,
      token,
    }, 'Đăng ký tài khoản thành công');

  } catch (error) {
    next(error);
  }
};

// ===================================================
// @desc    Đăng nhập
// @route   POST /api/users/login
// @access  Public
//
// Luồng xử lý:
// 1. Validate input (email, password)
// 2. Tìm user theo email (bao gồm field password)
// 3. So sánh password bằng bcrypt
// 4. Tạo JWT token
// 5. Cập nhật lastLogin, loginCount
// 6. Trả về user info + token
// ===================================================
const login = async (req, res, next) => {
  try {
    // --- Bước 1: Kiểm tra validation errors ---
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // --- Bước 2: Tìm user theo email ---
    // Dùng .select('+password') vì password có select: false trong schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return next(new AppError('Email hoặc mật khẩu không đúng', 401));
    }

    // --- Bước 3: Kiểm tra tài khoản còn active không ---
    if (!user.isActive) {
      return next(new AppError('Tài khoản đã bị vô hiệu hoá. Vui lòng liên hệ admin.', 403));
    }

    // --- Bước 4: So sánh password ---
    // Sử dụng method comparePassword đã định nghĩa trong User model
    // (bcrypt.compare tự động xử lý salt)
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return next(new AppError('Email hoặc mật khẩu không đúng', 401));
    }

    // --- Bước 5: Tạo JWT token ---
    const token = generateToken(user);

    // --- Bước 6: Cập nhật thông tin đăng nhập ---
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });

    // --- Bước 7: Trả về response ---
    const userResponse = user.toPublicJSON();

    return apiResponse.success(res, {
      user: userResponse,
      token,
    }, 'Đăng nhập thành công');

  } catch (error) {
    next(error);
  }
};

// ===================================================
// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private (cần JWT token)
//
// Luồng: Lấy user từ req.user (đã gắn bởi auth middleware)
// ===================================================
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username profile.fullName profile.avatar')
      .populate('activityHistory.activityId', 'title category schedule.startDate');

    if (!user) {
      return next(new AppError('Không tìm thấy user', 404));
    }

    return apiResponse.success(res, { user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

// ===================================================
// @desc    Đăng xuất (phía client xoá token)
// @route   POST /api/auth/logout
// @access  Private
// ===================================================
const logout = async (req, res, next) => {
  try {
    // JWT là stateless, việc logout chủ yếu xử lý ở client (xoá token)
    // Server chỉ trả về response xác nhận
    return apiResponse.success(res, null, 'Đăng xuất thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, logout };
