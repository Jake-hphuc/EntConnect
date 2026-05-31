const mongoose = require('mongoose');
const Activity = require('../models/Activity');

/**
 * Lớp thiết kế chuyên biệt cho Big Data Analysis
 */
class AnalyticsService {
  /**
   * Pipeline Aggregation Phức Tạp: Lấy Top 5 thể loại giải trí thịnh hành nhất
   * trong vòng X ngày qua tại một tọa độ (VD: TP.HCM).
   * 
   * Tính điểm Popularity dựa trên: 50% số người tham gia + 30% view count + 20% lượng Event.
   * 
   * @param {Number} lng Longitude (Kinh độ)
   * @param {Number} lat Latitude (Vĩ độ)
   * @param {Number} maxDistanceKm Khoảng cách tối đa (Cơ bản là 50km cho 1 thành phố)
   * @param {Number} daysAgo Số ngày trước để lọc (tháng qua = 30)
   * @returns {Array} List categories với trending score
   */
  static async getTrendingCategories(lng, lat, maxDistanceKm = 50, daysAgo = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysAgo);

    // Mảng lưu pipeline các bước xử lý (Big Data Pipeline)
    const pipeline = [];

    // BƯỚC 1: $geoNear - LUÔN LUÔN PHẢI Ở ĐẦU PIPELINE.
    // Dùng để filter và sort events gần vị trí user nhất. (Sử dụng 2dsphere index).
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        key: 'location.venue.coordinates', // <== CHỈ ĐỊNH RÕ TRƯỜNG CẦN TÌM
        distanceField: 'dist.calculated', // Trường ảo lưu khoảng cách
        maxDistance: maxDistanceKm * 1000, // Đổi km sang hệ đơn vị mét
        includeLocs: 'dist.location',
        spherical: true,
        // Chỉ quét các Activity đã xuất bản và không bị huỷ. 
        // Phối hợp với Compound Index ta vừa thiết kế.
        query: { status: 'published' }
      }
    });

    // BƯỚC 2: $match - Bộ lọc theo chiều thời gian
    // Lấy các activities được đăng trong khoảng 'daysAgo' ngày gần đây
    pipeline.push({
      $match: {
        createdAt: { $gte: fromDate }
      }
    });

    // BƯỚC 3: $addFields - Trích xuất độ dài mảng participants
    // Để MongoDB không cần load toàn bộ user references khi group
    pipeline.push({
      $addFields: {
        participantCount: { $size: { $ifNull: ['$participants', []] } }
      }
    });

    // BƯỚC 4: $group - Nhóm dữ liệu theo Thể loại (category)
    pipeline.push({
      $group: {
        _id: '$category', // Nhóm theo category
        totalEvents: { $sum: 1 }, // Tổng số sự kiện trong category này
        totalViews: { $sum: { $ifNull: ['$stats.viewCount', 0] } },
        totalParticipants: { $sum: '$participantCount' },
        avgCTR: { $avg: { $ifNull: ['$tracking.clickThroughRate', 0] } },
      }
    });

    // BƯỚC 5: $addFields - Tính toán Popularity Score
    // Thuật toán: Weight(Participants) = 0.5, Weight(Views) = 0.3, Weight(Event Count) = 0.2
    // Ngoài ra cộng dồn với điểm CTR trung bình * 10 để tạo sự chênh lệch lớn hơn
    pipeline.push({
      $addFields: {
        popularityScore: {
          $add: [
            { $multiply: ['$totalParticipants', 0.5] },
            { $multiply: ['$totalViews', 0.3] },
            { $multiply: ['$totalEvents', 0.2] },
            { $multiply: ['$avgCTR', 10] }
          ]
        }
      }
    });

    // BƯỚC 6: $sort - Sắp xếp theo popularityScore giảm dần
    pipeline.push({
      $sort: { popularityScore: -1 }
    });

    // BƯỚC 7: $limit - Lấy Top 5
    pipeline.push({
      $limit: 5
    });

    // BƯỚC 8: $project - Format kết quả trả về clean n gọn
    pipeline.push({
      $project: {
        _id: 0,
        category: '$_id',
        score: { $round: ['$popularityScore', 2] },
        metrics: {
          events: '$totalEvents',
          participants: '$totalParticipants',
          views: '$totalViews'
        }
      }
    });

    // Thực thi Pipeline
    const trending = await Activity.aggregate(pipeline).exec();
    return trending;
  }
}

module.exports = AnalyticsService;
