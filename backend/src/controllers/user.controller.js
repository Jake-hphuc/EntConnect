const { User, Activity } = require('../models');
const { apiResponse } = require('../utils/helpers');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Lấy danh sách người dùng (có thể lọc theo sở thích)
// @route   GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };
    
    if (category) {
      query['entertainmentPreferences.categories'] = category;
    }

    const users = await User.find(query)
      .select('username profile.fullName profile.avatar entertainmentPreferences')
      .limit(20);

    return apiResponse.success(res, { users });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết người dùng
// @route   GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -tracking -analytics');

    if (!user) {
      return next(new AppError('Không tìm thấy người dùng', 404));
    }

    return apiResponse.success(res, { user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật profile
// @route   PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return next(new AppError('Bạn không có quyền cập nhật hồ sơ này', 403));
    }

    const { fullName, bio, avatar, phone, categories } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return next(new AppError('User not found', 404));

    if (fullName) user.profile.fullName = fullName;
    if (bio) user.profile.bio = bio;
    if (avatar) user.profile.avatar = avatar;
    if (phone) user.profile.phone = phone;
    if (categories) user.entertainmentPreferences.categories = categories;

    await user.save();
    return apiResponse.success(res, { user: user.toPublicJSON() }, 'Cập nhật thành công');
  } catch (error) {
    next(error);
  }
};

// @desc    Tìm kiếm người dùng theo username hoặc sở thích
// @route   GET /api/users/search
const searchUsers = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    let query = { isActive: true };

    if (q) {
      query.$or = [
        { username: { $regex: q, $options: 'i' } },
        { 'profile.fullName': { $regex: q, $options: 'i' } }
      ];
    }

    if (category) {
      query['entertainmentPreferences.categories'] = category;
    }

    const users = await User.find(query)
      .select('username profile.fullName profile.avatar entertainmentPreferences')
      .limit(20);

    return apiResponse.success(res, { users });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy hoạt động của user
// @route   GET /api/users/:id/activities
const getUserActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({
      $or: [
        { creator: req.params.id },
        { 'participants.user': req.params.id }
      ]
    }).populate('creator', 'username profile.fullName profile.avatar');

    return apiResponse.success(res, { activities });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách Companions (để thuê)
// @route   GET /api/users/companions
const getCompanions = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = { 
      isActive: true, 
      'companion.isCompanion': true 
    };

    if (category) {
      query['entertainmentPreferences.categories'] = category;
    }

    const companions = await User.find(query)
      .select('username profile.fullName profile.avatar profile.bio entertainmentPreferences companion')
      .sort({ 'companion.rating': -1 });

    return apiResponse.success(res, { users: companions });
  } catch (error) {
    next(error);
  }
};

// @desc    Xác thực người dùng (cấp Tích xanh)
// @route   POST /api/users/:id/verify
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('Không tìm thấy người dùng', 404));

    // // Admin verify
    // if (req.user.role !== 'admin') {
    //   return next(new AppError('Chỉ admin mới có quyền xác thực', 403));
    // }

    user.isVerified = true;
    await user.save();

    return apiResponse.success(res, { isVerified: user.isVerified }, 'Xác thực người dùng thành công');
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách huy hiệu
// @route   GET /api/users/:id/achievements
const getUserAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('achievements');
    if (!user) return next(new AppError('Không tìm thấy người dùng', 404));

    return apiResponse.success(res, { achievements: user.achievements || [] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  searchUsers,
  getUserActivities,
  getCompanions,
  verifyUser,
  getUserAchievements,
};
