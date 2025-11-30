const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/auth'); 

const router = express.Router();


router.get('/me', authenticateToken, userController.getMe);
router.put('/me', authenticateToken, userController.updateMe);


module.exports = router;