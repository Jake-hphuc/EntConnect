/**
 * Script Test Big Data / Analytics Pipeline
 * Chạy: node src/test-bigdata.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Activity = require('./models/Activity');
const User = require('./models/User');
const AnalyticsService = require('./services/analytics.service');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/entertainment_connect_db';

async function generateMockData() {
  console.log('🔄 Đang dọn dẹp dữ liệu cũ (Xóa Database)...');
  await mongoose.connection.db.dropDatabase();

  console.log('👤 Tạo 1 User mẫu...');
  const user = await User.create({
    username: 'bigdatatest',
    email: 'bigdata@test.com',
    password: 'securepassword123'
  });

  console.log('🎉 Bắt đầu sinh hàng loạt Activity giả lập (Mock Data) xung quanh TP.HCM...');

  const TPHCM_LNG = 106.6297;
  const TPHCM_LAT = 10.8231;
  const categories = ['gaming', 'sports', 'music', 'movies', 'photography', 'food'];

  const activitiesData = [];

  for (let i = 0; i < 50; i++) {
    // Generate Random coordinates around HCM
    // Độ dời khoảng +/- 0.1 độ (~10km)
    const lng = TPHCM_LNG + (Math.random() - 0.5) * 0.2;
    const lat = TPHCM_LAT + (Math.random() - 0.5) * 0.2;

    const cat = categories[Math.floor(Math.random() * categories.length)];

    activitiesData.push({
      title: `Sự kiện mock data #${i+1} - ${cat}`,
      description: 'Mô tả test tự động cho analytics engine.',
      creator: user._id,
      category: cat,
      status: 'published',
      schedule: {
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 86400000), // + 1 ngày
      },
      location: {
        type: 'offline',
        venue: {
          name: `Địa điểm giả lập ${i+1}`,
          coordinates: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        }
      },
      maxParticipants: 100,
      tracking: {
        impressions: Math.floor(Math.random() * 1000),
        clickThroughRate: Math.random() * 0.5, // 0 - 50%
      },
      stats: {
        viewCount: Math.floor(Math.random() * 500)
      },
      participants: Array(Math.floor(Math.random() * 20)).fill({ status: 'confirmed', user: user._id })
    });
  }

  // Insert bulk cho nhanh
  await Activity.insertMany(activitiesData);
  console.log('✅ Đã insert 50 Activities thành công.');

  // Đảm bảo tạo Index
  console.log('⚙️ Đang đảm bảo chạy đồng bộ các Indexes...');
  await Activity.syncIndexes();
  const indexes = await await Activity.collection.getIndexes();
  console.log('📋 Danh sách Indexes hiện tại trên Activity:', Object.keys(indexes));
}

async function runAnalyticPipeline() {
  console.log('\n=============================================');
  console.log('🔍 THỰC THI BIG DATA ANALYTICS PIPELINE');
  console.log('=============================================');
  const TPHCM_LNG = 106.6297;
  const TPHCM_LAT = 10.8231;

  // Gọi service vừa tạo (Bán kính 50km, query trong 30 ngày)
  const results = await AnalyticsService.getTrendingCategories(TPHCM_LNG, TPHCM_LAT, 50, 30);

  console.log('\n📊 KẾT QUẢ TOP THỂ LOẠI THỊNH HÀNH NHẤT (Sắp xếp theo Popularity Score):\n');
  console.table(results);
}

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Đã kết nối DB.');

    await generateMockData();
    await runAnalyticPipeline();

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Đóng kết nối DB.');
    process.exit(0);
  }
}

main();
