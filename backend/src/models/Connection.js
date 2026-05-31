const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// ===================================================
// Connection Schema (Match/Connection)
// Lưu trữ trạng thái kết nối giữa User-User
// và User-Activity trên nền tảng
// ===================================================
const ConnectionSchema = new Schema(
  {
    // ---- Loại kết nối ----
    connectionType: {
      type: String,
      required: [true, 'Loại kết nối là bắt buộc'],
      enum: ['user_to_user', 'user_to_activity'],
      index: true,
    },

    // ===================================================
    // KẾT NỐI USER-USER (Friendship / Match)
    // ===================================================
    // Người gửi lời mời kết nối
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người gửi kết nối là bắt buộc'],
      index: true,
    },
    // Người nhận lời mời kết nối (cho user_to_user)
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    // ===================================================
    // KẾT NỐI USER-ACTIVITY (Tham gia hoạt động)
    // ===================================================
    activity: {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
      index: true,
    },

    // ---- Trạng thái ----
    status: {
      type: String,
      required: true,
      enum: [
        'pending',      // Đang chờ xử lý
        'accepted',     // Đã chấp nhận
        'rejected',     // Đã từ chối
        'blocked',      // Đã chặn
        'cancelled',    // Đã huỷ
        'expired',      // Đã hết hạn
      ],
      default: 'pending',
      index: true,
    },

    // ---- Chi tiết Match (cho user_to_user) ----
    matchDetails: {
      // Điểm tương thích (tính từ thuật toán matching)
      compatibilityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      // Sở thích chung
      commonInterests: [{ type: String }],
      // Nguồn gốc match
      matchSource: {
        type: String,
        enum: [
          'interest_based',   // Dựa trên sở thích
          'activity_based',   // Gặp nhau trong hoạt động
          'location_based',   // Dựa trên vị trí
          'manual',           // Tự tìm kiếm
          'suggested',        // Hệ thống gợi ý
        ],
      },
    },

    // ---- Chi tiết tham gia Activity (cho user_to_activity) ----
    participationDetails: {
      role: {
        type: String,
        enum: ['participant', 'co_organizer', 'volunteer', 'vip'],
        default: 'participant',
      },
      // Check-in
      checkedIn: {
        type: Boolean,
        default: false,
      },
      checkedInAt: {
        type: Date,
      },
      // Đánh giá sau hoạt động
      rating: {
        score: { type: Number, min: 1, max: 5 },
        review: { type: String, maxlength: 1000 },
        ratedAt: { type: Date },
      },
    },

    // ---- Lịch sử trạng thái ----
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected', 'blocked', 'cancelled', 'expired'],
        },
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
          maxlength: 300,
        },
      },
    ],

    // ---- Metadata ----
    message: {
      type: String,
      maxlength: [500, 'Tin nhắn không được quá 500 ký tự'],
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===================================================
// Compound Indexes – tránh kết nối trùng lặp
// ===================================================
// Đảm bảo 1 cặp user chỉ có 1 kết nối
ConnectionSchema.index(
  { requester: 1, recipient: 1, connectionType: 1 },
  {
    unique: true,
    partialFilterExpression: { connectionType: 'user_to_user' },
  }
);
// Đảm bảo 1 user chỉ tham gia 1 activity 1 lần
ConnectionSchema.index(
  { requester: 1, activity: 1, connectionType: 1 },
  {
    unique: true,
    partialFilterExpression: { connectionType: 'user_to_activity' },
  }
);
// Index cho TTL - tự động xóa kết nối hết hạn
ConnectionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ===================================================
// Pre-save validation
// ===================================================
ConnectionSchema.pre('save', function (next) {
  // Validation: user_to_user phải có recipient
  if (this.connectionType === 'user_to_user' && !this.recipient) {
    return next(new Error('Kết nối user-to-user cần có người nhận (recipient)'));
  }
  // Validation: user_to_activity phải có activity
  if (this.connectionType === 'user_to_activity' && !this.activity) {
    return next(new Error('Kết nối user-to-activity cần có hoạt động (activity)'));
  }
  // Validation: Không thể tự kết nối với chính mình
  if (
    this.connectionType === 'user_to_user' &&
    this.requester.toString() === this.recipient.toString()
  ) {
    return next(new Error('Không thể kết nối với chính mình'));
  }
  next();
});

// ===================================================
// Pre-save: Ghi lại status history
// ===================================================
ConnectionSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

// ===================================================
// Static: Lấy danh sách bạn bè của user
// ===================================================
ConnectionSchema.statics.getFriends = function (userId) {
  return this.find({
    connectionType: 'user_to_user',
    status: 'accepted',
    $or: [{ requester: userId }, { recipient: userId }],
  })
    .populate('requester', 'username profile.fullName profile.avatar')
    .populate('recipient', 'username profile.fullName profile.avatar');
};

// ===================================================
// Static: Lấy pending requests cho user
// ===================================================
ConnectionSchema.statics.getPendingRequests = function (userId) {
  return this.find({
    connectionType: 'user_to_user',
    recipient: userId,
    status: 'pending',
  }).populate('requester', 'username profile.fullName profile.avatar');
};

// ===================================================
// Static: Kiểm tra trạng thái kết nối giữa 2 user
// ===================================================
ConnectionSchema.statics.getConnectionStatus = function (userIdA, userIdB) {
  return this.findOne({
    connectionType: 'user_to_user',
    $or: [
      { requester: userIdA, recipient: userIdB },
      { requester: userIdB, recipient: userIdA },
    ],
  });
};

// ===================================================
// Static: Lấy danh sách activities user đã tham gia
// ===================================================
ConnectionSchema.statics.getUserActivities = function (userId, status = 'accepted') {
  return this.find({
    connectionType: 'user_to_activity',
    requester: userId,
    status,
  })
    .populate({
      path: 'activity',
      populate: { path: 'creator', select: 'username profile.fullName profile.avatar' },
    })
    .sort({ createdAt: -1 });
};

// ===================================================
// Static: Lấy danh sách user đã tham gia 1 activity
// ===================================================
ConnectionSchema.statics.getActivityParticipants = function (activityId, status = 'accepted') {
  return this.find({
    connectionType: 'user_to_activity',
    activity: activityId,
    status,
  }).populate('requester', 'username profile.fullName profile.avatar entertainmentPreferences');
};

// ===================================================
// Static: Tìm users có sở thích tương đồng
// ===================================================
ConnectionSchema.statics.findPotentialMatches = async function (userId, User) {
  // Lấy sở thích của user hiện tại
  const currentUser = await User.findById(userId);
  if (!currentUser) return [];

  const userCategories = currentUser.entertainmentPreferences?.categories || [];

  // Lấy danh sách user đã kết nối
  const existingConnections = await this.find({
    connectionType: 'user_to_user',
    $or: [{ requester: userId }, { recipient: userId }],
    status: { $in: ['pending', 'accepted', 'blocked'] },
  });

  const connectedUserIds = existingConnections.map((c) =>
    c.requester.toString() === userId.toString()
      ? c.recipient
      : c.requester
  );
  connectedUserIds.push(userId); // Loại bỏ chính mình

  // Tìm users có sở thích trùng, chưa kết nối
  return User.find({
    _id: { $nin: connectedUserIds },
    'entertainmentPreferences.categories': { $in: userCategories },
    isActive: true,
  })
    .select('username profile entertainmentPreferences')
    .limit(20);
};

module.exports = mongoose.model('Connection', ConnectionSchema);
