/**
 * Middleware xử lý lỗi tập trung (Error Handler)
 */

// Lớp lỗi tuỳ chỉnh
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware xử lý lỗi
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  // Production: Chỉ trả về lỗi operational
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }

  // Lỗi không xác định
  console.error('💥 ERROR:', err);
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Đã xảy ra lỗi hệ thống',
  });
};

// Middleware xử lý lỗi Mongoose
const handleMongooseError = (err, req, res, next) => {
  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const error = new AppError(`${field} đã tồn tại trong hệ thống`, 409);
    return errorHandler(error, req, res, next);
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    const error = new AppError(messages.join('. '), 400);
    return errorHandler(error, req, res, next);
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    const error = new AppError(`Giá trị không hợp lệ: ${err.value}`, 400);
    return errorHandler(error, req, res, next);
  }

  next(err);
};

module.exports = { AppError, errorHandler, handleMongooseError };
