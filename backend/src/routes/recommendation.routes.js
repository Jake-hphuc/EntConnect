const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');

// ===================================================
// Recommendation Routes — Gợi ý hoạt động & người dùng
// ===================================================

// GET /api/recommendations/:userId
// Gợi ý activities và users phù hợp dựa trên sở thích
router.get('/:userId', recommendationController.getRecommendations);

module.exports = router;
