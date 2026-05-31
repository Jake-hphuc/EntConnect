const cron = require('node-cron');
const { Activity, Notification } = require('../models');
const { emitToUser } = require('../utils/socket');

const checkEventStatus = () => {
  // Chạy mỗi giờ (0 * * * *) hoặc mỗi phút (* * * * *) để test
  cron.schedule('*/5 * * * *', async () => {
    try {
      // Tìm các sự kiện đã kết thúc nhưng chưa chuyển status sang 'completed' hoặc chưa cho phép đánh giá
      const now = new Date();
      const endedActivities = await Activity.find({
        status: { $in: ['published', 'ongoing'] },
        'schedule.endDate': { $lt: now }
      });

      if (endedActivities.length > 0) {
        console.log(`🔄 [CRON] Đang cập nhật trạng thái cho ${endedActivities.length} sự kiện đã kết thúc...`);

        for (const activity of endedActivities) {
          activity.status = 'completed';
          activity.ratings.ratingAllowed = true;
          await activity.save();

          // Gửi thông báo cho người tham gia (tùy chọn)
          if (activity.participants && activity.participants.length > 0) {
            for (const participant of activity.participants) {
              if (participant.status === 'confirmed') {
                const notif = await Notification.create({
                  userId: participant.user,
                  type: 'badge', // Có thể dùng type khác nếu cần
                  title: 'Sự kiện đã kết thúc!',
                  message: `Sự kiện "${activity.title}" đã kết thúc. Hãy để lại đánh giá của bạn!`,
                  payload: { activityId: activity._id }
                });
                emitToUser(participant.user.toString(), 'new_notification', notif);
              }
            }
          }
        }
        console.log('✅ [CRON] Cập nhật thành công.');
      }
    } catch (error) {
      console.error('❌ [CRON] Lỗi cập nhật trạng thái sự kiện:', error);
    }
  });
};

module.exports = checkEventStatus;
