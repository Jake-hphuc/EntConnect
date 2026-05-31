const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const activityRoutes = require('./activity.routes');
const connectionRoutes = require('./connection.routes');
const recommendationRoutes = require('./recommendation.routes');
const bookingRoutes = require('./booking.routes');
const reviewRoutes = require('./reviewRoutes');
const aiRoutes = require('./aiRoutes');

// ===================================================
// Mount Routes
// ===================================================

// Auth & User routes → /api/users/*
router.use('/users', authRoutes);
router.use('/users', userRoutes);

// Event/Activity routes → /api/events/*
router.use('/events', activityRoutes);

// Connection routes → /api/connections/*
router.use('/connections', connectionRoutes);

// Recommendation routes → /api/recommendations/*
router.use('/recommendations', recommendationRoutes);

// Booking routes → /api/bookings/*
router.use('/bookings', bookingRoutes);

// Review routes → /api/reviews/*
router.use('/reviews', reviewRoutes);

// AI routes → /api/ai/*
router.use('/ai', aiRoutes);

// Health check → /api/health
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    endpoints: {
      auth: '/api/users/register, /api/users/login',
      events: '/api/events/create, /api/events',
      recommendations: '/api/recommendations/:userId',
    },
  });
});

module.exports = router;
