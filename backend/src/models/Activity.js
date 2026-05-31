const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// ===================================================
// Activity Schema (Event/Activity)
// Lưu trữ thông tin hoạt động giải trí trên nền tảng
// ===================================================
const ActivitySchema = new Schema(
  {
    // ---- Thông tin cơ bản ----
    title: {
      type: String,
      required: [true, 'Tên hoạt động là bắt buộc'],
      trim: true,
      maxlength: [150, 'Tên hoạt động không được quá 150 ký tự'],
    },
    description: {
      type: String,
      required: [true, 'Mô tả hoạt động là bắt buộc'],
      maxlength: [2000, 'Mô tả không được quá 2000 ký tự'],
    },
    coverImage: {
      type: String,
      default: 'default-activity.png',
    },
    images: [{ type: String }],

    // ---- Người tạo ----
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người tạo hoạt động là bắt buộc'],
      index: true,
    },

    // ---- Phân loại ----
    category: {
      type: String,
      required: [true, 'Thể loại là bắt buộc'],
      enum: [
        'gaming',
        'sports',
        'music',
        'movies',
        'reading',
        'travel',
        'food',
        'art',
        'photography',
        'dancing',
        'karaoke',
        'board_games',
        'outdoor',
        'fitness',
        'cooking',
        'technology',
        'other',
      ],
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // ---- Thời gian ----
    schedule: {
      startDate: {
        type: Date,
        required: [true, 'Ngày bắt đầu là bắt buộc'],
        index: true,
      },
      endDate: {
        type: Date,
        required: [true, 'Ngày kết thúc là bắt buộc'],
      },
      timezone: {
        type: String,
        default: 'Asia/Ho_Chi_Minh',
      },
      isRecurring: {
        type: Boolean,
        default: false,
      },
      recurringPattern: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly', null],
        default: null,
      },
    },

    // ---- Địa điểm ----
    location: {
      type: {
        type: String,
        enum: ['online', 'offline', 'hybrid'],
        required: [true, 'Loại địa điểm là bắt buộc'],
      },
      // Cho hoạt động offline/hybrid
      venue: {
        name: { type: String, trim: true },
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        district: { type: String, trim: true },
        coordinates: {
          type: { type: String, enum: ['Point'] },
          coordinates: { type: [Number] }, // [longitude, latitude]
        },
      },
      // Cho hoạt động online
      onlineUrl: { type: String, trim: true },
      platform: {
        type: String,
        enum: ['zoom', 'google_meet', 'discord', 'facebook', 'custom', null],
        default: null,
      },
    },

    // ---- Tham gia ----
    maxParticipants: {
      type: Number,
      required: [true, 'Số lượng người tham gia tối đa là bắt buộc'],
      min: [2, 'Cần ít nhất 2 người tham gia'],
      max: [10000, 'Không được quá 10000 người'],
    },
    minParticipants: {
      type: Number,
      default: 2,
      min: [1, 'Cần ít nhất 1 người'],
    },
    participants: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['confirmed', 'pending', 'waitlisted', 'cancelled'],
          default: 'pending',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ---- Chi phí ----
    pricing: {
      isFree: {
        type: Boolean,
        default: true,
      },
      price: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: 'VND',
      },
    },

    // ---- Yêu cầu ----
    requirements: {
      ageMin: { type: Number, min: 0 },
      ageMax: { type: Number, max: 150 },
      skillLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert', 'all'],
        default: 'all',
      },
      additionalRequirements: { type: String, maxlength: 500 },
    },

    // ---- Trạng thái ----
    status: {
      type: String,
      enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'friends_only'],
      default: 'public',
    },

    // ---- Đánh giá ----
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
      ratingAllowed: { type: Boolean, default: false }
    },

    // ---- Thống kê (Stats) ----
    stats: {
      viewCount: { type: Number, default: 0 },
      shareCount: { type: Number, default: 0 },
      bookmarkCount: { type: Number, default: 0 },
    },

    // ---- Theo dõi tương tác (Big Data Tracking) ----
    tracking: {
      impressions: { type: Number, default: 0 }, // Số lần xuất hiện trên news feed
      clickThroughRate: { type: Number, default: 0 }, // tỷ lệ click/impression
      averageViewDuration: { type: Number, default: 0 }, // Thời gian xem trung bình (giây)
      dropOffRate: { type: Number, default: 0 }, // tỷ lệ thoát mà ko đk tham gia
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ===================================================
// Indexes
// ===================================================

// Geospatial basic index
ActivitySchema.index({ 'location.venue.coordinates': '2dsphere' }, { sparse: true });

// Basic indexes
ActivitySchema.index({ tags: 1 });
ActivitySchema.index({ title: 'text', description: 'text' });

// ===================================================
// Big Data Optimization: Compound Geospatial Index
// Tối ưu hóa cực mạnh cho truy vấn: "Tìm sự kiện xung quanh tôi, thuộc category A, đang published và sắp diễn ra"
// ===================================================
ActivitySchema.index(
  {
    'location.venue.coordinates': '2dsphere',
    status: 1,
    category: 1,
    'schedule.startDate': 1
  },
  { 
    name: 'big_data_geo_compound_idx',
    sparse: true,
    background: true 
  }
);

// ===================================================
// Virtual: Số lượng người tham gia hiện tại (confirmed)
// ===================================================
ActivitySchema.virtual('currentParticipants').get(function () {
  if (!this.participants) return 0;
  return this.participants.filter((p) => p.status === 'confirmed').length;
});

// ===================================================
// Virtual: Còn slot hay không
// ===================================================
ActivitySchema.virtual('hasAvailableSlots').get(function () {
  return this.currentParticipants < this.maxParticipants;
});

// ===================================================
// Virtual: Hoạt động đã kết thúc chưa
// ===================================================
ActivitySchema.virtual('isExpired').get(function () {
  return new Date() > new Date(this.schedule.endDate);
});

// ===================================================
// Pre-save validation: endDate phải sau startDate
// ===================================================
ActivitySchema.pre('save', function (next) {
  if (this.schedule.endDate <= this.schedule.startDate) {
    return next(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
  }
  if (this.minParticipants > this.maxParticipants) {
    return next(new Error('Số người tối thiểu không được lớn hơn số người tối đa'));
  }
  next();
});

// ===================================================
// Static: Tìm hoạt động theo thể loại và trạng thái
// ===================================================
ActivitySchema.statics.findByCategory = function (category, status = 'published') {
  return this.find({ category, status })
    .populate('creator', 'username profile.fullName profile.avatar')
    .sort({ 'schedule.startDate': 1 });
};

// ===================================================
// Static: Tìm hoạt động sắp diễn ra
// ===================================================
ActivitySchema.statics.findUpcoming = function (limit = 10) {
  return this.find({
    status: 'published',
    'schedule.startDate': { $gte: new Date() },
  })
    .populate('creator', 'username profile.fullName profile.avatar')
    .sort({ 'schedule.startDate': 1 })
    .limit(limit);
};

// ===================================================
// Static: Tìm hoạt động gần vị trí (geospatial)
// ===================================================
ActivitySchema.statics.findNearby = function (longitude, latitude, maxDistanceKm = 10) {
  return this.find({
    'location.venue.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistanceKm * 1000, // Convert km → m
      },
    },
    status: 'published',
  }).populate('creator', 'username profile.fullName profile.avatar');
};

module.exports = mongoose.model('Activity', ActivitySchema);
