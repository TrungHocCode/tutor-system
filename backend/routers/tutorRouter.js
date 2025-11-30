const express = require('express');
const tutorController = require('../controllers/tutorController');
const authenticateToken = require('../middlewares/auth'); 
const authorize = require('../middlewares/authorize'); 

const router = express.Router();

// Middleware bảo vệ: Chỉ Tutor mới có thể truy cập các route này
router.use(authenticateToken, authorize(['tutor']));

// 1. Quản lý Hồ sơ
router.get('/me', tutorController.getTutorProfile);
router.put('/me', tutorController.updateTutorProfile);

// 2. Quản lý Lịch Trống
router.get('/me/availability', tutorController.getTutorMonthlyAvailability); // GET lịch trống theo tháng
router.post('/me/availability', tutorController.addAvailability);          // POST thêm lịch trống
router.put('/me/availability/:id', tutorController.updateAvailability);  // PUT cập nhật lịch
router.delete('/me/availability/:id', tutorController.deleteAvailability); // DELETE lịch

// 3. Quản lý Sessions
router.post('/sessions', tutorController.createSession);                 // POST tạo buổi học
router.get('/sessions/me', tutorController.viewMySessions);              // GET xem các buổi học đã tạo
router.put('/sessions/:id', tutorController.updateSession);            // PUT cập nhật buổi học
router.delete('/sessions/:id', tutorController.deleteSession);         // DELETE buổi học

module.exports = router;