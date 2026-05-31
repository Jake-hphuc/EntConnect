const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Tạo JWT token cho user
 * @param {Object} user - User document
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

/**
 * Helper tạo response chuẩn cho API
 */
const apiResponse = {
  success: (res, data, message = 'Thành công', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  created: (res, data, message = 'Tạo thành công') => {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  },

  paginated: (res, data, pagination, message = 'Thành công') => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  },
};

/**
 * Helper tính pagination
 */
const getPagination = (page = 1, limit = 10, total) => {
  const currentPage = parseInt(page, 10) || 1;
  const perPage = Math.min(parseInt(limit, 10) || 10, config.pagination.maxLimit);
  const totalPages = Math.ceil(total / perPage);
  const skip = (currentPage - 1) * perPage;

  return {
    currentPage,
    perPage,
    total,
    totalPages,
    skip,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

module.exports = { generateToken, apiResponse, getPagination };
