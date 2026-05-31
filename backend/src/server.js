const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const path = require('path');


// Load environment variables
require('dotenv').config();

// Import config & database
const config = require('./config');
const connectDB = require('./config/db');

// Import routes
const routes = require('./routes');

// Import middlewares
const { errorHandler, handleMongooseError } = require('./middlewares');

// Import socket utility
const { initSocket } = require('./utils/socket');

// ===================================================
// Khởi tạo Express App & HTTP Server
const app = express();
const server = http.createServer(app);

// Khởi tạo Socket.io
initSocket(server, config.clientUrl);

// Khởi tạo Cron Jobs
const initCronJobs = require('./cron/eventStatus');
initCronJobs();

// ===================================================
// Middlewares
// ===================================================

// CORS
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger (chỉ dùng trong development)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// ===================================================
// Routes & Static Serving
// ===================================================

// API Routes
app.use('/api', routes);

// Phục vụ các file tĩnh (CSS, JS, Images)
app.use(express.static(path.join(__dirname, '../../frontend')));

// Mapping các route chính sang file HTML tương ứng (Hỗ trợ F5 và friendly URL)
const pages = ['index', 'discover', 'dashboard', 'activity-detail', 'community', 'hire'];
pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, `../../frontend/${page}.html`));
  });
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Hỗ trợ tự động thêm .html nếu người dùng gõ URL thủ công
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('.') && !req.path.startsWith('/api')) {
    const htmlPath = path.join(__dirname, '../../frontend', `${req.path}.html`);
    res.sendFile(htmlPath, (err) => {
      if (err) next();
    });
  } else {
    next();
  }
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} không tồn tại`,
  });
});

// ===================================================
// Error Handling Middlewares
// ===================================================
app.use(handleMongooseError);
app.use(errorHandler);

// ===================================================
// Start Server
// ===================================================
const PORT = config.port;

const startServer = async () => {
  try {
    // Kết nối MongoDB
    await connectDB();

    // Khởi động server
    server.listen(PORT, () => {
      console.log(`\n🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
      console.log(`📋 API Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Không thể khởi động server:', error.message);
    process.exit(1);
  }
};

// Xử lý unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION:', err.message);
  server.close(() => process.exit(1));
});

// Xử lý uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

startServer();

module.exports = app;
