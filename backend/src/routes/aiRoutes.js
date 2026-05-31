const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// @route   POST /api/ai/chat
// @desc    Send message to AI assistant
// @access  Public
router.post('/chat', aiController.chat);

module.exports = router;
