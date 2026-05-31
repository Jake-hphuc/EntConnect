const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Kết nối tới MongoDB
 * Hỗ trợ retry tự động khi mất kết nối
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 8 mặc định sử dụng useNewUrlParser & useUnifiedTopology
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Xử lý sự kiện kết nối
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Thoát process nếu không thể kết nối DB
    process.exit(1);
  }
};

module.exports = connectDB;
