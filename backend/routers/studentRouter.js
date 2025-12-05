const express = require('express');
const studentController = require('../controllers/studentController');
const authorize = require('../middlewares/authorize');
const authenticateToken = require('../middlewares/auth'); 

const router = express.Router();

// 1. Middleware xác thực (Token) áp dụng cho tất cả
router.use(authenticateToken);

// --- NHÓM API DÀNH RIÊNG CHO SINH VIÊN (Role: student) ---
// Chỉ sinh viên mới được xem hồ sơ của mình, đăng ký môn...
router.get('/me', authorize(['student']), studentController.getStudentProfile);
router.post('/sessions/me/:sessionId/register', authorize(['student']), studentController.registerSession);
router.delete('/sessions/me/:sessionId', authorize(['student']), studentController.cancelSession);
router.get('/sessions/me', authorize(['student']), studentController.viewSchedule);
router.get('/sessions/available', authorize(['student']), studentController.getAllAvailableSessions);
router.put('/me', authorize(['student']), studentController.updateProfile);
router.put('/change-password', authorize(['student']), studentController.changePassword); 
router.get('/settings', authorize(['student']), studentController.getSettings);
router.put('/settings/notifications', authorize(['student']), studentController.updateNotifications);

// --- NHÓM API DÀNH CHO ADMIN (Role: admin) ---
// Admin mới được quyền xem danh sách, tạo, sửa, xóa sinh viên
router.get('/list', authorize(['admin']), studentController.getListStudents); 
router.post('/create', authorize(['admin']), studentController.createStudentAdmin);
router.get('/detail/:id', authorize(['admin']), studentController.getStudentDetailAdmin);
router.put('/update/:id', authorize(['admin']), studentController.updateStudentAdmin);
router.delete('/delete/:id', authorize(['admin']), studentController.deleteStudentAdmin)
module.exports = router;