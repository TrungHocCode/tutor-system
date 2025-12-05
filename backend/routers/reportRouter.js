const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
// const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); // Cần middleware check Admin
const authorize = require('../middlewares/authorize')
const authenticateToken = require('../middlewares/auth'); 
router.use(authenticateToken, authorize(['admin']));

router.get('/overview', reportController.getOverview);
router.get('/stats', reportController.getStats);
router.get('/types', reportController.getReportTypes);
router.get('/history', reportController.getHistory);
router.post('/generate', reportController.generateReport);

module.exports = router;