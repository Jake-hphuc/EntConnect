const { User, Activity, Connection } = require('../models');
const { apiResponse } = require('../utils/helpers');
const { AppError } = require('../middlewares/errorHandler');

// ===================================================
// THUẬT TOÁN GỢI Ý (RECOMMENDATION ENGINE)
// ===================================================
//
// Thuật toán sử dụng phương pháp "Content-Based Filtering"
// kết hợp "Collaborative Filtering" đơn giản:
//
// 1. Content-Based: So sánh tags/categories của user hiện tại
//    với tags/categories của activities và users khác.
//    → Tính "compatibility score" dựa trên số lượng tags trùng.
//
// 2. Collaborative: Xem các users đã tham gia cùng activity
//    → Gợi ý những users "tương tự" = những người hay xuất hiện
//    trong các activity cùng loại.
//
// Công thức tính điểm tương thích:
//   score = (số tags trùng / tổng tags unique) × 100
//   + bonus nếu cùng category chính
//   + bonus nếu cùng khu vực
//   + bonus nếu cùng skill level
// ===================================================

/**
 * Hàm tính điểm tương thích giữa 2 tập tags
 *
 * @param {string[]} tagsA - Tags của user A
 * @param {string[]} tagsB - Tags của user B (hoặc activity)
 * @returns {Object} { score, commonTags }
 *
 * Ví dụ:
 *   tagsA = ['bóng đá', 'MOBA', 'rock']
 *   tagsB = ['bóng đá', 'FPS', 'rock', 'EDM']
 *   → commonTags = ['bóng đá', 'rock']
 *   → score = 2/5 * 100 = 40
 */
const calculateTagScore = (tagsA, tagsB) => {
  // Chuẩn hoá: lowercase + loại bỏ khoảng trắng thừa
  const normalizedA = tagsA.map((t) => t.toLowerCase().trim());
  const normalizedB = tagsB.map((t) => t.toLowerCase().trim());

  // Tìm tags chung (intersection)
  const commonTags = normalizedA.filter((tag) => normalizedB.includes(tag));

  // Tổng tags unique (union) để tính tỷ lệ
  const allUniqueTags = new Set([...normalizedA, ...normalizedB]);
  const totalUnique = allUniqueTags.size;

  // Tránh chia cho 0
  if (totalUnique === 0) return { score: 0, commonTags: [] };

  // Score = tỷ lệ tags trùng (0-100)
  const score = Math.round((commonTags.length / totalUnique) * 100);

  return { score, commonTags };
};

/**
 * Hàm tính điểm tương thích giữa 2 tập categories
 *
 * @param {string[]} catsA - Categories của user A
 * @param {string[]} catsB - Categories của user B (hoặc activity)
 * @returns {number} Điểm bonus (0-30)
 */
const calculateCategoryScore = (catsA, catsB) => {
  if (!catsA.length || !catsB.length) return 0;

  // Đếm categories trùng
  const commonCategories = catsA.filter((cat) => catsB.includes(cat));

  // Mỗi category trùng = +10 điểm, tối đa 30
  return Math.min(commonCategories.length * 10, 30);
};

/**
 * Hàm tính điểm bonus dựa trên các yếu tố phụ
 */
const calculateBonusScore = (userA, userB) => {
  let bonus = 0;

  // Bonus +5 nếu cùng thành phố
  if (
    userA.profile?.location?.city &&
    userB.profile?.location?.city &&
    userA.profile.location.city.toLowerCase() === userB.profile.location.city.toLowerCase()
  ) {
    bonus += 5;
  }

  // Bonus +5 nếu cùng skill level
  if (
    userA.entertainmentPreferences?.skillLevel &&
    userB.entertainmentPreferences?.skillLevel &&
    userA.entertainmentPreferences.skillLevel === userB.entertainmentPreferences.skillLevel
  ) {
    bonus += 5;
  }

  // Bonus +5 nếu cùng preferred time
  if (
    userA.entertainmentPreferences?.preferredTime &&
    userB.entertainmentPreferences?.preferredTime &&
    userA.entertainmentPreferences.preferredTime === userB.entertainmentPreferences.preferredTime
  ) {
    bonus += 5;
  }

  return bonus;
};

// ===================================================
// @desc    Gợi ý hoạt động giải trí & người dùng phù hợp
// @route   GET /api/recommendations/:userId
// @access  Public
//
// === LUỒNG XỬ LÝ DỮ LIỆU CHI TIẾT ===
//
// BƯỚC 1: Lấy thông tin user hiện tại
//   → Lấy tags, categories, location, skill level
//
// BƯỚC 2: Gợi ý ACTIVITIES phù hợp
//   2a. Query activities có cùng category với user
//   2b. Với mỗi activity, tính compatibilityScore:
//       = tagScore + categoryScore (capped at 100)
//   2c. Sắp xếp theo score giảm dần
//   2d. Loại bỏ activities user đã tham gia
//
// BƯỚC 3: Gợi ý USERS có cùng sở thích
//   3a. Query users có ít nhất 1 category trùng
//   3b. Loại bỏ: chính mình, users đã kết bạn, users bị block
//   3c. Với mỗi user, tính compatibilityScore:
//       = tagScore + categoryScore + bonusScore (capped at 100)
//   3d. Sắp xếp theo score giảm dần
//
// BƯỚC 4: Trả về kết quả gợi ý
//   → { recommendedActivities, recommendedUsers }
//   → Mỗi item có compatibilityScore + commonTags
// ===================================================
const getRecommendations = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // ============================
    // BƯỚC 1: Lấy thông tin user
    // ============================
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return next(new AppError('Không tìm thấy người dùng', 404));
    }

    if (!currentUser.isActive) {
      return next(new AppError('Tài khoản đã bị vô hiệu hoá', 403));
    }

    // Trích xuất dữ liệu sở thích của user
    const userTags = currentUser.entertainmentPreferences?.tags || [];
    const userCategories = currentUser.entertainmentPreferences?.categories || [];

    // Nếu user chưa có sở thích → trả về danh sách popular
    if (userCategories.length === 0 && userTags.length === 0) {
      // Fallback: Trả về activities phổ biến nhất
      const popularActivities = await Activity.find({
        status: 'published',
        'schedule.startDate': { $gte: new Date() },
      })
        .populate('creator', 'username profile.fullName profile.avatar')
        .sort({ 'stats.viewCount': -1 })
        .limit(10);

      return apiResponse.success(res, {
        recommendedActivities: popularActivities.map((a) => ({
          activity: a,
          compatibilityScore: 0,
          commonTags: [],
          reason: 'Hoạt động phổ biến (bạn chưa cập nhật sở thích)',
        })),
        recommendedUsers: [],
        message: 'Hãy cập nhật sở thích để nhận gợi ý chính xác hơn!',
      });
    }

    // ============================
    // BƯỚC 2: Gợi ý ACTIVITIES
    // ============================

    // 2a. Lấy danh sách activities user đã tham gia (để loại bỏ)
    const joinedConnections = await Connection.find({
      connectionType: 'user_to_activity',
      requester: userId,
    }).select('activity');

    const joinedActivityIds = joinedConnections.map((c) => c.activity);

    // 2b. Query activities phù hợp:
    //     - Trạng thái "published"
    //     - Chưa hết hạn (startDate >= now)
    //     - Cùng ít nhất 1 category với user
    //     - Chưa tham gia
    const candidateActivities = await Activity.find({
      status: 'published',
      'schedule.startDate': { $gte: new Date() },
      category: { $in: userCategories },
      _id: { $nin: joinedActivityIds },
    })
      .populate('creator', 'username profile.fullName profile.avatar')
      .limit(50); // Lấy 50 candidates để scoring

    // 2c. Tính điểm tương thích cho mỗi activity
    const scoredActivities = candidateActivities.map((activity) => {
      // Tính tag score: so sánh tags của user với tags của activity
      const { score: tagScore, commonTags } = calculateTagScore(
        userTags,
        activity.tags || []
      );

      // Tính category score: activity có 1 category, user có nhiều
      const categoryScore = userCategories.includes(activity.category) ? 20 : 0;

      // Tổng điểm (capped at 100)
      const compatibilityScore = Math.min(tagScore + categoryScore, 100);

      return {
        activity,
        compatibilityScore,
        commonTags,
        reason: commonTags.length > 0
          ? `Cùng sở thích: ${commonTags.join(', ')}`
          : `Cùng thể loại: ${activity.category}`,
      };
    });

    // 2d. Sắp xếp theo điểm giảm dần, lấy top 10
    scoredActivities.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    const recommendedActivities = scoredActivities.slice(0, 10);

    // ============================
    // BƯỚC 3: Gợi ý USERS
    // ============================

    // 3a. Lấy danh sách users đã kết bạn/block (để loại bỏ)
    const existingConnections = await Connection.find({
      connectionType: 'user_to_user',
      $or: [{ requester: userId }, { recipient: userId }],
      status: { $in: ['accepted', 'pending', 'blocked'] },
    });

    // Collect tất cả user IDs đã có quan hệ
    const excludeUserIds = existingConnections.map((c) =>
      c.requester.toString() === userId.toString()
        ? c.recipient
        : c.requester
    );
    excludeUserIds.push(userId); // Loại bỏ chính mình

    // 3b. Query users có ít nhất 1 category trùng
    const candidateUsers = await User.find({
      _id: { $nin: excludeUserIds },
      isActive: true,
      'entertainmentPreferences.categories': { $in: userCategories },
    })
      .select('username profile entertainmentPreferences')
      .limit(50); // Lấy 50 candidates để scoring

    // 3c. Tính điểm tương thích cho mỗi user
    const scoredUsers = candidateUsers.map((candidateUser) => {
      const candidateTags = candidateUser.entertainmentPreferences?.tags || [];
      const candidateCategories = candidateUser.entertainmentPreferences?.categories || [];

      // Tính tag score (0-100)
      const { score: tagScore, commonTags } = calculateTagScore(
        userTags,
        candidateTags
      );

      // Tính category score (0-30)
      const categoryScore = calculateCategoryScore(userCategories, candidateCategories);

      // Tính bonus score (0-15)
      const bonusScore = calculateBonusScore(currentUser, candidateUser);

      // Tổng điểm (capped at 100)
      const compatibilityScore = Math.min(tagScore + categoryScore + bonusScore, 100);

      // Tìm common categories để hiển thị
      const commonCategories = userCategories.filter((cat) =>
        candidateCategories.includes(cat)
      );

      return {
        user: {
          _id: candidateUser._id,
          username: candidateUser.username,
          profile: candidateUser.profile,
          entertainmentPreferences: candidateUser.entertainmentPreferences,
        },
        compatibilityScore,
        commonTags,
        commonCategories,
        reason: commonTags.length > 0
          ? `Cùng sở thích: ${commonTags.join(', ')}`
          : `Cùng thể loại: ${commonCategories.join(', ')}`,
      };
    });

    // 3d. Sắp xếp theo điểm giảm dần, lấy top 10
    scoredUsers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    const recommendedUsers = scoredUsers.slice(0, 10);

    // ============================
    // BƯỚC 4: Trả về kết quả
    // ============================
    return apiResponse.success(res, {
      // Thông tin user hiện tại (để client hiểu basis của gợi ý)
      userProfile: {
        categories: userCategories,
        tags: userTags,
        skillLevel: currentUser.entertainmentPreferences?.skillLevel,
      },
      // Gợi ý activities
      recommendedActivities,
      totalActivitiesScored: scoredActivities.length,
      // Gợi ý users
      recommendedUsers,
      totalUsersScored: scoredUsers.length,
    }, 'Lấy gợi ý thành công');

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  // Export các hàm helper để có thể test riêng
  calculateTagScore,
  calculateCategoryScore,
  calculateBonusScore,
};
