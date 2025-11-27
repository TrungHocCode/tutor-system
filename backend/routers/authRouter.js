// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Định nghĩa route POST cho việc đăng ký
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser)
module.exports = router;