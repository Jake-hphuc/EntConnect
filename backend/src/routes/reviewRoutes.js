const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, reviewController.createReview);
router.get('/target/:targetId', reviewController.getTargetReviews);

module.exports = router;
