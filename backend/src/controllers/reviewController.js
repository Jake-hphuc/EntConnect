const Review = require('../models/Review');
const Booking = require('../models/Booking');

const reviewController = {
  // Tạo đánh giá mới
  createReview: async (req, res) => {
    try {
      const { targetId, targetType, rating, comment, bookingId } = req.body;
      const reviewer = req.user.id;

      // Kiểm tra tuỳ theo loại target
      if (targetType === 'Activity') {
        const Activity = require('../models/Activity');
        const activity = await Activity.findById(targetId);
        if (!activity) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
        
        if (!activity.ratings.ratingAllowed && activity.status !== 'completed') {
           return res.status(400).json({ success: false, message: 'Bạn chỉ được đánh giá sau khi sự kiện đã kết thúc.' });
        }
      }

      if (targetType === 'User') {
        if (!bookingId) {
           return res.status(400).json({ success: false, message: 'Đánh giá người dùng cần có mã đơn thuê (bookingId).' });
        }
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        
        // Chỉ cho phép đánh giá khi trạng thái là completed
        if (booking.status !== 'completed') {
          return res.status(400).json({ success: false, message: 'Bạn chỉ có thể đánh giá sau khi dịch vụ đã hoàn tất' });
        }
      }

      const review = new Review({
        targetId,
        targetType,
        reviewer,
        rating,
        comment,
        bookingId
      });

      await review.save();

      res.status(201).json({
        success: true,
        message: 'Cảm ơn bạn đã đánh giá!',
        data: review
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'Bạn đã đánh giá đơn hàng này rồi' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Lấy danh sách đánh giá của một mục tiêu (User/Activity)
  getTargetReviews: async (req, res) => {
    try {
      const { targetId } = req.params;
      const reviews = await Review.find({ targetId })
        .populate('reviewer', 'username profile.avatar')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = reviewController;
