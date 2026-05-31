const { validationResult } = require('express-validator');
const { Activity, Connection, Notification } = require('../models');
const { apiResponse, getPagination } = require('../utils/helpers');
const { AppError } = require('../middlewares/errorHandler');
const { emitToUser } = require('../utils/socket');

// ===================================================
// @desc    Tạo hoạt động giải trí mới
// @route   POST /api/events/create
// @access  Private (cần đăng nhập)
//
// Luồng xử lý:
// 1. Validate input từ request body
// 2. Gắn creator = user đang đăng nhập
// 3. Tạo Activity document mới
// 4. Tự động thêm creator vào danh sách participants
// 5. Trả về activity vừa tạo
// ===================================================
const createActivity = async (req, res, next) => {
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

    const {
      title,
      description,
      category,
      tags,
      schedule,
      location,
      maxParticipants,
      minParticipants,
      pricing,
      requirements,
      visibility,
      coverImage,
      images,
    } = req.body;

    // --- Bước 2: Tạo activity mới ---
    // creator được lấy từ req.user (đã xác thực qua JWT middleware)
    const activity = await Activity.create({
      title,
      description,
      category,
      tags: tags || [],
      schedule: {
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        timezone: schedule.timezone || 'Asia/Ho_Chi_Minh',
        isRecurring: schedule.isRecurring || false,
        recurringPattern: schedule.recurringPattern || null,
      },
      location: {
        type: location.type,
        venue: location.venue || {},
        onlineUrl: location.onlineUrl || null,
        platform: location.platform || null,
      },
      maxParticipants,
      minParticipants: minParticipants || 2,
      pricing: pricing || { isFree: true, price: 0, currency: 'VND' },
      requirements: requirements || {},
      visibility: visibility || 'public',
      coverImage: coverImage || 'default-activity.png',
      images: images || [],
      creator: req.user._id,
      // Tự động thêm người tạo vào danh sách participants với status 'confirmed'
      participants: [
        {
          user: req.user._id,
          status: 'confirmed',
          joinedAt: new Date(),
        },
      ],
      status: 'published', // Mặc định publish ngay
    });

    // --- Bước 3: Populate thông tin creator để trả về ---
    await activity.populate('creator', 'username profile.fullName profile.avatar');

    // --- Bước 4: Tạo Connection record (user_to_activity) cho creator ---
    await Connection.create({
      connectionType: 'user_to_activity',
      requester: req.user._id,
      activity: activity._id,
      status: 'accepted',
      participationDetails: {
        role: 'participant',
      },
    });

    return apiResponse.created(res, { activity }, 'Tạo hoạt động thành công');

  } catch (error) {
    next(error);
  }
};

// ===================================================
// @desc    Lấy danh sách tất cả activities (có phân trang)
// @route   GET /api/events
// @access  Public
// ===================================================
const getActivities = async (req, res, next) => {
  try {
    const { page, limit, category, status, search } = req.query;

    // Xây dựng filter query
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (status) filter.status = status;
    else filter.status = 'published'; // Mặc định chỉ lấy published

    // Tìm kiếm theo title
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Đếm tổng documents
    const total = await Activity.countDocuments(filter);
    const pagination = getPagination(page, limit, total);

    // Query với phân trang
    const activities = await Activity.find(filter)
      .populate('creator', 'username profile.fullName profile.avatar')
      .sort({ 'schedule.startDate': 1 })
      .skip(pagination.skip)
      .limit(pagination.perPage);

    return apiResponse.paginated(res, activities, pagination, 'Lấy danh sách hoạt động thành công');

  } catch (error) {
    next(error);
  }
};

// ===================================================
// @desc    Lấy chi tiết 1 activity
// @route   GET /api/events/:id
// @access  Public
// ===================================================
const getActivityById = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('creator', 'username profile.fullName profile.avatar')
      .populate('participants.user', 'username profile.fullName profile.avatar');

    if (!activity) {
      return next(new AppError('Không tìm thấy hoạt động', 404));
    }

    // Tăng view count
    activity.stats.viewCount += 1;
    await activity.save({ validateBeforeSave: false });

    return apiResponse.success(res, { activity });

  } catch (error) {
    next(error);
  }
};

// ===================================================
// @desc    Cập nhật activity
// @route   PUT /api/events/:id
// @access  Private (chỉ creator)
// ===================================================
const updateActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return next(new AppError('Không tìm thấy hoạt động', 404));
    }

    // Chỉ creator mới được sửa
    if (activity.creator.toString() !== req.user._id.toString()) {
      return next(new AppError('Bạn không có quyền chỉnh sửa hoạt động này', 403));
    }

    // Cập nhật các field được gửi lên
    const allowedUpdates = [
      'title', 'description', 'category', 'tags', 'schedule',
      'location', 'maxParticipants', 'minParticipants', 'pricing',
      'requirements', 'visibility', 'status', 'coverImage', 'images',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        activity[field] = req.body[field];
      }
    });

    await activity.save();
    await activity.populate('creator', 'username profile.fullName profile.avatar');

    return apiResponse.success(res, { activity }, 'Cập nhật hoạt động thành công');

  } catch (error) {
    next(error);
  }
};

// ===================================================
// @desc    Xoá activity
// @route   DELETE /api/events/:id
// @access  Private (creator hoặc admin)
// ===================================================
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return next(new AppError('Không tìm thấy hoạt động', 404));
    }

    // Chỉ creator hoặc admin mới được xoá
    if (
      activity.creator.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Bạn không có quyền xoá hoạt động này', 403));
    }

    await Activity.findByIdAndDelete(req.params.id);

    // Xoá cả các Connection liên quan
    await Connection.deleteMany({
      connectionType: 'user_to_activity',
      activity: req.params.id,
    });

    return apiResponse.success(res, null, 'Xoá hoạt động thành công');

  } catch (error) {
    next(error);
  }
};

// ===================================================
// @desc    Tham gia activity
// @route   POST /api/events/:id/join
// @access  Private
// ===================================================
const joinActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return next(new AppError('Không tìm thấy hoạt động', 404));
    }

    // Kiểm tra hoạt động còn mở không
    if (activity.status !== 'published') {
      return next(new AppError('Hoạt động này không còn mở đăng ký', 400));
    }

    // Kiểm tra đã tham gia chưa
    const alreadyJoined = activity.participants.find(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
      return next(new AppError('Bạn đã tham gia hoạt động này rồi', 400));
    }

    // Kiểm tra còn slot không
    const confirmedCount = activity.participants.filter(
      (p) => p.status === 'confirmed'
    ).length;

    if (confirmedCount >= activity.maxParticipants) {
      return next(new AppError('Hoạt động đã đủ người tham gia', 400));
    }

    // Thêm participant
    activity.participants.push({
      user: req.user._id,
      status: 'confirmed',
      joinedAt: new Date(),
    });

    await activity.save({ validateBeforeSave: false });

    // Tạo Connection record
    await Connection.create({
      connectionType: 'user_to_activity',
      requester: req.user._id,
      activity: activity._id,
      status: 'accepted',
      participationDetails: { role: 'participant' },
    });

    // --- NEW: Tạo và gửi Notification cho người tạo sự kiện ---
    if (activity.creator.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        userId: activity.creator,
        type: 'registration',
        title: 'Người tham gia mới!',
        message: `${req.user.username} vừa đăng ký tham gia hoạt động "${activity.title}".`,
        payload: {
          activityId: activity._id,
          participantId: req.user._id,
        }
      });
      
      // Emit realtime via Socket.io
      emitToUser(activity.creator.toString(), 'new_notification', notification);
    }

    return apiResponse.success(res, { activity }, 'Tham gia hoạt động thành công');

  } catch (error) {
    next(error);
  }
};

// ===================================================
// @desc    Rời khỏi activity
// @route   POST /api/events/:id/leave
// @access  Private
// ===================================================
const leaveActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return next(new AppError('Không tìm thấy hoạt động', 404));
    }

    // Creator không được rời
    if (activity.creator.toString() === req.user._id.toString()) {
      return next(new AppError('Người tạo không thể rời khỏi hoạt động. Hãy xoá hoạt động thay vì rời.', 400));
    }

    // Tìm và xoá participant
    const participantIndex = activity.participants.findIndex(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (participantIndex === -1) {
      return next(new AppError('Bạn chưa tham gia hoạt động này', 400));
    }

    activity.participants.splice(participantIndex, 1);
    await activity.save({ validateBeforeSave: false });

    // Xoá Connection record
    await Connection.findOneAndDelete({
      connectionType: 'user_to_activity',
      requester: req.user._id,
      activity: activity._id,
    });

    return apiResponse.success(res, null, 'Đã rời khỏi hoạt động');

  } catch (error) {
    next(error);
  }
};

// ===================================================
// @desc    Lấy hoạt động sắp diễn ra
// @route   GET /api/events/upcoming
// @access  Public
// ===================================================
const getUpcomingActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const activities = await Activity.findUpcoming(limit);

    return apiResponse.success(res, { activities }, 'Lấy hoạt động sắp diễn ra thành công');
  } catch (error) {
    next(error);
  }
};

// ===================================================
// @desc    Lấy danh sách participants của activity
// @route   GET /api/events/:id/participants
// @access  Public
// ===================================================
const getParticipants = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('participants.user', 'username profile.fullName profile.avatar entertainmentPreferences');

    if (!activity) {
      return next(new AppError('Không tìm thấy hoạt động', 404));
    }

    return apiResponse.success(res, {
      participants: activity.participants,
      total: activity.participants.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  joinActivity,
  leaveActivity,
  getUpcomingActivities,
  getParticipants,
};
