const express = require('express');
const studentController = require('../controllers/studentController');
const authorize = require('../middlewares/authorize')
const authenticateToken = require('../middlewares/auth'); 

const router = express.Router();
router.use(authenticateToken, authorize(['student']));
router.get('/me', studentController.getStudentProfile);

router.post('/sessions/me/:sessionId/register', studentController.registerSession);          // POST đăng ký session
router.delete('/sessions/me/:sessionId', studentController.cancelSession);
router.get('/sessions/me', studentController.viewSchedule);
router.get('/sessions/available', studentController.getAllAvailableSessions); // Thêm route này
router.put('/me', studentController.updateProfile); // Cập nhật hồ sơ
router.put('/change-password', studentController.changePassword); // Đổi pass
router.get('/settings', studentController.getSettings); // Lấy setting
router.put('/settings/notifications', studentController.updateNotifications);

module.exports = router;