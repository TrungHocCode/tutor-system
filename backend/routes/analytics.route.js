const express = require('express');
const router = express.Router();
const Student = require('../models/Student.model');
const Tutor = require('../models/Tutor.model');
const Feedback = require('../models/Feedback.model');

// GET /api/v1/analytics/stats - Thống kê cho biểu đồ cột
router.get('/stats', async (req, res) => {
  try {
    // const year = parseInt(req.query.year) || new Date().getFullYear();
    const year = 2026;
    // Calculate quarterly stats
    const quarterlyStats = [];

    for (let quarter = 1; quarter <= 4; quarter++) {
      // Calculate start and end months for each quarter
      const startMonth = (quarter - 1) * 3; // 0, 3, 6, 9
      const endMonth = startMonth + 3; // 3, 6, 9, 12

      const startDate = new Date(year, startMonth, 1);
      const endDate = new Date(year, endMonth, 0, 23, 59, 59, 999);

      // Count students created in this quarter
      const studentCount = await Student.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      });

      // Count tutors created in this quarter
      const tutorCount = await Tutor.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      });

      quarterlyStats.push({
        quarter,
        students: studentCount,
        tutors: tutorCount
      });
    }

    res.json({
      success: true,
      year,
      quarterlyStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
});

// GET /api/v1/analytics/feedback-summary - Thống kê cho biểu đồ tròn
router.get('/feedback-summary', async (req, res) => {
  try {
    // const year = parseInt(req.query.year) || new Date().getFullYear();
    const year = 2026;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    // Count good and bad feedback in the year
    const [goodCount, badCount] = await Promise.all([
      Feedback.countDocuments({
        rating: 'good',
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }),
      Feedback.countDocuments({
        rating: 'bad',
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      })
    ]);

    const total = goodCount + badCount;

    res.json({
      success: true,
      year,
      total,
      good: goodCount,
      bad: badCount
    });
  } catch (error) {
    console.error('Error fetching feedback summary:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê phản hồi',
      error: error.message
    });
  }
});

// GET /api/v1/analytics/overview - Tổng quan toàn bộ hệ thống
router.get('/overview', async (req, res) => {
  try {
    const [totalStudents, totalTutors, totalFeedbacks, activeTutors] = await Promise.all([
      Student.countDocuments(),
      Tutor.countDocuments(),
      Feedback.countDocuments(),
      Tutor.countDocuments({ status: 'active' })
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTutors,
        totalFeedbacks,
        activeTutors
      }
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tổng quan',
      error: error.message
    });
  }
});

module.exports = router;