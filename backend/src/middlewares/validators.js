const { body, param, query } = require('express-validator');

/**
 * Validation rules cho User
 */
const userValidation = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username phải từ 3-30 ký tự')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username chỉ được chứa chữ cái, số và dấu _'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password phải có ít nhất 6 ký tự'),
  ],

  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password là bắt buộc'),
  ],

  updateProfile: [
    body('profile.fullName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Họ tên không được quá 100 ký tự'),
    body('profile.bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio không được quá 500 ký tự'),
  ],
};

/**
 * Validation rules cho Activity
 */
const activityValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Tên hoạt động là bắt buộc')
      .isLength({ max: 150 })
      .withMessage('Tên hoạt động không được quá 150 ký tự'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Mô tả là bắt buộc')
      .isLength({ max: 2000 })
      .withMessage('Mô tả không được quá 2000 ký tự'),
    body('category')
      .notEmpty()
      .withMessage('Thể loại là bắt buộc'),
    body('schedule.startDate')
      .notEmpty()
      .withMessage('Ngày bắt đầu là bắt buộc')
      .isISO8601()
      .withMessage('Ngày không đúng định dạng'),
    body('schedule.endDate')
      .notEmpty()
      .withMessage('Ngày kết thúc là bắt buộc')
      .isISO8601()
      .withMessage('Ngày không đúng định dạng'),
    body('maxParticipants')
      .notEmpty()
      .withMessage('Số lượng người tham gia tối đa là bắt buộc')
      .isInt({ min: 2, max: 10000 })
      .withMessage('Số lượng phải từ 2-10000'),
    body('location.type')
      .notEmpty()
      .withMessage('Loại địa điểm là bắt buộc')
      .isIn(['online', 'offline', 'hybrid'])
      .withMessage('Loại địa điểm không hợp lệ'),
  ],
};

/**
 * Validation rules cho Connection
 */
const connectionValidation = {
  sendRequest: [
    body('recipientId')
      .notEmpty()
      .withMessage('ID người nhận là bắt buộc')
      .isMongoId()
      .withMessage('ID không hợp lệ'),
    body('message')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Tin nhắn không được quá 500 ký tự'),
  ],

  respondRequest: [
    param('connectionId')
      .isMongoId()
      .withMessage('ID kết nối không hợp lệ'),
    body('status')
      .isIn(['accepted', 'rejected'])
      .withMessage('Trạng thái phải là accepted hoặc rejected'),
  ],

  joinActivity: [
    param('activityId')
      .isMongoId()
      .withMessage('ID hoạt động không hợp lệ'),
  ],
};

/**
 * Validation cho pagination
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page phải là số nguyên dương'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit phải từ 1-100'),
];

module.exports = {
  userValidation,
  activityValidation,
  connectionValidation,
  paginationValidation,
};
