const express = require('express');
const tutorController = require('../controllers/tutorController');
const authenticateToken = require('../middlewares/auth'); 
const authorize = require('../middlewares/authorize'); 

const router = express.Router();

// Middleware bảo vệ: Chỉ Tutor mới có thể truy cập các route này
router.use(authenticateToken);

// 1. Quản lý Hồ sơ
router.get('/me', authorize(['tutor']), tutorController.getTutorProfile);
router.put('/me', authorize(['tutor']), tutorController.updateTutorProfile);
router.put('/change-password', authorize(['tutor']), tutorController.changePassword); // <--- THÊM DÒNG NÀY
// 2. Quản lý Lịch Trống
router.get('/me/availability', authorize(['tutor']), tutorController.getTutorMonthlyAvailability); // GET lịch trống theo tháng
router.post('/me/availability', authorize(['tutor']), tutorController.addAvailability);          // POST thêm lịch trống
router.put('/me/availability/:id', authorize(['tutor']), tutorController.updateAvailability);  // PUT cập nhật lịch
router.delete('/me/availability/:id', authorize(['tutor']), tutorController.deleteAvailability); // DELETE lịch

// 3. Quản lý Sessions
router.post('/sessions', authorize(['tutor']), tutorController.createSession);                 // POST tạo buổi học
router.get('/sessions/me', authorize(['tutor']), tutorController.viewMySessions);              // GET xem các buổi học đã tạo
router.put('/sessions/:id', authorize(['tutor']), tutorController.updateSession);            // PUT cập nhật buổi học
router.delete('/sessions/:id', authorize(['tutor']), tutorController.deleteSession);         // DELETE buổi học
// 4. Cài đặt thông báo
router.get('/settings/notifications', authorize(['tutor']), tutorController.getNotificationSettings);
router.put('/settings/notifications', authorize(['tutor']), tutorController.updateNotificationSettings);

router.get('/list', authorize(['admin']), tutorController.getListTutors);
router.post('/create', authorize(['admin']), tutorController.createTutorAdmin);
router.delete('/delete/:id', authorize(['admin']), tutorController.deleteTutorAdmin);
module.exports = router;