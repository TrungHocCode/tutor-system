const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.get('/me', studentController.getStudentProfile);

router.post('/sessions/me/:sessionId/register', studentController.registerSession);          // POST đăng ký session
router.delete('/sessions/me/:sessionId', studentController.cancelSession);
router.get('/sessions/me', studentController.viewSchedule);
