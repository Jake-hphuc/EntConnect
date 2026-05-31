const { Booking, User, Notification } = require('../models');
const { apiResponse } = require('../utils/helpers');
const { emitToUser } = require('../utils/socket');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Tạo yêu cầu thuê bạn mới
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { companionId, hours, notes } = req.body;
    const userId = req.user._id;

    // 1. Kiểm tra companion tồn tại và có phải là companion không
    const companion = await User.findById(companionId);
    if (!companion || !companion.companion?.isCompanion) {
      return next(new AppError('Không tìm thấy bạn đồng hành hợp lệ', 404));
    }

    // 2. Tính tổng tiền
    const totalPrice = companion.companion.pricePerHour * hours;

    // 3. Tạo booking
    const booking = await Booking.create({
      user: userId,
      companion: companionId,
      hours,
      totalPrice,
      notes,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    // 4. Notification cho Companion
    const notification = await Notification.create({
      userId: companionId,
      type: 'hire',
      title: 'Yêu cầu thuê mới!',
      message: `${req.user.username} vừa gửi yêu cầu thuê bạn trong ${hours} giờ.`,
      payload: { bookingId: booking._id, userId: userId }
    });
    emitToUser(companionId.toString(), 'new_notification', notification);

    // 5. Trả về kết quả
    return apiResponse.created(res, { booking }, 'Gửi yêu cầu thuê bạn thành công');
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách yêu cầu thuê của user hiện tại
// @route   GET /api/bookings/my-requests
// @access  Private
const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('companion', 'username profile.fullName profile.avatar companion.pricePerHour')
      .sort({ createdAt: -1 });

    return apiResponse.success(res, { bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách yêu cầu thuê mà user hiện tại nhận được (nếu là companion)
// @route   GET /api/bookings/my-jobs
// @access  Private
const getCompanionBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ companion: req.user._id })
      .populate('user', 'username profile.fullName profile.avatar')
      .sort({ createdAt: -1 });

    return apiResponse.success(res, { bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật trạng thái booking
// @route   PATCH /api/bookings/:id
// @access  Private
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(id);
    if (!booking) {
      return next(new AppError('Không tìm thấy thông tin thuê bạn', 404));
    }

    // Chỉ người thuê hoặc người được thuê mới có quyền cập nhật
    const isUser = booking.user.toString() === userId.toString();
    const isCompanion = booking.companion.toString() === userId.toString();

    if (!isUser && !isCompanion) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này', 403));
    }

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();

    // Gửi thông báo khi cập nhật
    let notifyUserId = isCompanion ? booking.user : booking.companion;
    let actorName = req.user.username;
    
    let notifTitle = 'Cập nhật yêu cầu thuê';
    let notifMessage = `${actorName} đã cập nhật trạng thái yêu cầu thuê thành: ${status || booking.status}.`;
    
    if (status === 'accepted') notifMessage = `${actorName} đã chấp nhận yêu cầu thuê của bạn.`;
    if (status === 'rejected') notifMessage = `${actorName} đã từ chối yêu cầu thuê của bạn.`;
    
    const notification = await Notification.create({
      userId: notifyUserId,
      type: 'hire',
      title: notifTitle,
      message: notifMessage,
      payload: { bookingId: booking._id }
    });
    emitToUser(notifyUserId.toString(), 'new_notification', notification);

    return apiResponse.success(res, { booking }, 'Cập nhật trạng thái thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getCompanionBookings,
  updateBookingStatus
};
