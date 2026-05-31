const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth');

// Tất cả các route booking đều cần đăng nhập
router.use(authenticate);

// POST /api/bookings — Tạo yêu cầu thuê mới
router.post('/', bookingController.createBooking);

// GET /api/bookings/my-requests — Danh sách đã thuê
router.get('/my-requests', bookingController.getUserBookings);

// GET /api/bookings/my-jobs — Danh sách công việc (nếu là companion)
router.get('/my-jobs', bookingController.getCompanionBookings);

// PATCH /api/bookings/:id — Cập nhật trạng thái
router.patch('/:id', bookingController.updateBookingStatus);

module.exports = router;
