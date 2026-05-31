const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

// ===================================================
// User Schema
// Lưu trữ thông tin người dùng, sở thích giải trí,
// và lịch sử hoạt động trên nền tảng
// ===================================================
const UserSchema = new Schema(
  {
    // ---- Thông tin tài khoản ----
    username: {
      type: String,
      required: [true, 'Username là bắt buộc'],
      unique: true,
      trim: true,
      minlength: [3, 'Username phải có ít nhất 3 ký tự'],
      maxlength: [30, 'Username không được quá 30 ký tự'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng cung cấp email hợp lệ',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password là bắt buộc'],
      minlength: [6, 'Password phải có ít nhất 6 ký tự'],
      select: false, // Không trả về password trong query mặc định
    },

    // ---- Thông tin cá nhân ----
    profile: {
      fullName: {
        type: String,
        trim: true,
        maxlength: [100, 'Họ tên không được quá 100 ký tự'],
      },
      avatar: {
        type: String,
        default: 'default-avatar.png',
      },
      bio: {
        type: String,
        maxlength: [500, 'Bio không được quá 500 ký tự'],
      },
      dateOfBirth: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      },
      phone: {
        type: String,
        trim: true,
      },
      location: {
        city: { type: String, trim: true },
        district: { type: String, trim: true },
        address: { type: String, trim: true },
        coordinates: {
          type: { type: String, enum: ['Point'] },
          coordinates: { type: [Number] }, // [longitude, latitude]
        },
      },
    },

    // ---- Sở thích giải trí ----
    entertainmentPreferences: {
      // Danh mục sở thích chính
      categories: [
        {
          type: String,
          enum: [
            'gaming',         // Chơi game
            'sports',         // Thể thao
            'music',          // Âm nhạc
            'movies',         // Phim ảnh
            'reading',        // Đọc sách
            'travel',         // Du lịch
            'food',           // Ẩm thực
            'art',            // Nghệ thuật
            'photography',    // Nhiếp ảnh
            'dancing',        // Khiêu vũ
            'karaoke',        // Karaoke
            'board_games',    // Board games
            'outdoor',        // Hoạt động ngoài trời
            'fitness',        // Thể hình
            'cooking',        // Nấu ăn
            'technology',     // Công nghệ
            'other',          // Khác
          ],
        },
      ],
      // Tags chi tiết hơn (ví dụ: "MOBA", "FPS", "Bóng đá", "Rock"...)
      tags: [{ type: String, trim: true }],
      // Mức độ quan tâm (1-5)
      skillLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'beginner',
      },
      // Thời gian rảnh ưa thích
      preferredTime: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night', 'weekend', 'flexible'],
        default: 'flexible',
      },
    },

    // ---- Lịch sử hoạt động ----
    activityHistory: [
      {
        activityId: {
          type: Schema.Types.ObjectId,
          ref: 'Activity',
        },
        role: {
          type: String,
          enum: ['creator', 'participant', 'viewer'],
          default: 'participant',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        feedback: {
          type: String,
          maxlength: 500,
        },
      },
    ],

    // ---- Theo dõi hành vi (Big Data Tracking) ----
    tracking: {
      recentClicks: [
        {
          activityId: { type: Schema.Types.ObjectId, ref: 'Activity' },
          clickedAt: { type: Date, default: Date.now },
        },
      ],
      // Thời gian xem app / sự kiện trung bình mỗi ngày (tính bằng giây)
      averageDailyViewTime: { type: Number, default: 0 },
    },

    // ---- Phân tích dữ liệu (Analytics) ----
    analytics: {
      totalEventsViewed: { type: Number, default: 0 },
      participationRate: { type: Number, default: 0 }, // Tham gia / Bấm xem
      cancellationRate: { type: Number, default: 0 }, // Hủy / Từng tham gia
    },

    // ---- Trạng thái & Quyền ----
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },

    // ---- Gamification (Thành tựu) ----
    achievements: [
      {
        badgeId: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        icon: { type: String },
        unlockedAt: { type: Date, default: Date.now }
      }
    ],

    // ---- Social ----
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ---- Thông báo ----
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },

    // ---- Companion Details (For Hiring) ----
    companion: {
      isCompanion: { type: Boolean, default: false },
      pricePerHour: { type: Number, default: 0 },
      rating: { type: Number, default: 5.0 },
      reviewCount: { type: Number, default: 0 },
      services: [{ type: String, trim: true }], // e.g. ["Chơi game", "Tâm sự", "Hát"]
      status: { type: String, enum: ['online', 'offline', 'busy'], default: 'offline' },
    }
  },
  {
    timestamps: true, // Tự động tạo createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===================================================
// Index cho tìm kiếm địa lý (geospatial)
// ===================================================
UserSchema.index(
  { 'profile.location.coordinates': '2dsphere' },
  { sparse: true }
);

// ===================================================
// Virtual: Tính tuổi từ ngày sinh
// ===================================================
UserSchema.virtual('profile.age').get(function () {
  if (!this.profile?.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.profile.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

// ===================================================
// Virtual: Số lượng hoạt động đã tham gia
// ===================================================
UserSchema.virtual('totalActivities').get(function () {
  return this.activityHistory ? this.activityHistory.length : 0;
});

// ===================================================
// Pre-save: Mã hoá password trước khi lưu
// ===================================================
UserSchema.pre('save', async function (next) {
  // Chỉ hash password khi nó bị thay đổi
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ===================================================
// Method: So sánh password
// ===================================================
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ===================================================
// Method: Thêm thành tựu (Huy hiệu)
// ===================================================
UserSchema.methods.addAchievement = async function (badgeData) {
  // Kiểm tra xem đã có huy hiệu này chưa
  const exists = this.achievements.find(a => a.badgeId === badgeData.badgeId);
  if (!exists) {
    this.achievements.push(badgeData);
    await this.save();
    return true; // Mới thêm
  }
  return false; // Đã có
};

// ===================================================
// Method: Lấy thông tin public (ẩn sensitive data)
// ===================================================
UserSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.blockedUsers;
  delete obj.notificationSettings;
  delete obj.__v;
  return obj;
};

// ===================================================
// Static: Tìm user theo email
// ===================================================
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// ===================================================
// Static: Tìm user theo sở thích
// ===================================================
UserSchema.statics.findByInterests = function (categories, limit = 10) {
  return this.find({
    'entertainmentPreferences.categories': { $in: categories },
    isActive: true,
  })
    .select('-password')
    .limit(limit);
};

module.exports = mongoose.model('User', UserSchema);
