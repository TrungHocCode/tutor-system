const express = require('express');
const router = express.Router();
const Student = require('../models/Student.model');
const Tutor = require('../models/Tutor.model');
const Feedback = require('../models/Feedback.model');
const Report = require('../models/Report.model');

// GET /api/v1/reports/types - Lấy danh sách các loại báo cáo có thể phân tích
router.get('/types', async (req, res) => {
  try {
    const reportTypes = [
      {
        id: 'student_progress',
        name: 'Báo cáo tiến độ học tập',
        description: 'Phân tích tiến độ và thành tích học tập của sinh viên',
        icon: '📊',
        color: 'blue'
      },
      {
        id: 'course_completion',
        name: 'Tỷ lệ hoàn thành môn học',
        description: 'Thống kê tỷ lệ sinh viên hoàn thành các môn học',
        icon: '✅',
        color: 'green'
      },
      {
        id: 'activity_participation',
        name: 'Mức độ tham gia hoạt động',
        description: 'Đánh giá mức độ tích cực tham gia của sinh viên',
        icon: '🎯',
        color: 'purple'
      },
      {
        id: 'training_results',
        name: 'Kết quả rèn luyện',
        description: 'Tổng hợp kết quả rèn luyện và phát triển kỹ năng',
        icon: '🏆',
        color: 'yellow'
      },
      {
        id: 'feedback_analysis',
        name: 'Phân tích phản hồi',
        description: 'Phân tích chi tiết phản hồi từ sinh viên về giảng viên',
        icon: '💬',
        color: 'red'
      }
    ];

    res.json({
      success: true,
      data: reportTypes
    });
  } catch (error) {
    console.error('Error fetching report types:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách báo cáo'
    });
  }
});

// POST /api/v1/reports/generate - Tạo báo cáo phân tích
router.post('/generate', async (req, res) => {
  try {
    const { reportTypes, filters = {} } = req.body;

    if (!reportTypes || !Array.isArray(reportTypes) || reportTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một loại báo cáo'
      });
    }

    const results = [];

    for (const reportType of reportTypes) {
      let reportData = null;

      switch (reportType) {
        case 'student_progress':
          reportData = await generateStudentProgressReport(filters);
          break;
        case 'course_completion':
          reportData = await generateCourseCompletionReport(filters);
          break;
        case 'activity_participation':
          reportData = await generateActivityParticipationReport(filters);
          break;
        case 'training_results':
          reportData = await generateTrainingResultsReport(filters);
          break;
        case 'feedback_analysis':
          reportData = await generateFeedbackAnalysisReport(filters);
          break;
        default:
          continue;
      }

      if (reportData) {
        results.push({
          type: reportType,
          ...reportData
        });

        // Lưu báo cáo vào database
        await Report.create({
          type: reportType,
          title: reportData.title,
          description: reportData.description,
          filters,
          data: reportData.data
        });
      }
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chưa có dữ liệu để phân tích'
      });
    }

    res.json({
      success: true,
      message: 'Tạo báo cáo thành công',
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo báo cáo',
      error: error.message
    });
  }
});

// GET /api/v1/reports/history - Lấy lịch sử các báo cáo đã tạo
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-data')
        .lean(),
      Report.countDocuments()
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching report history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử báo cáo'
    });
  }
});

// GET /api/v1/reports/:id - Lấy chi tiết một báo cáo
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin báo cáo'
    });
  }
});

// DELETE /api/v1/reports/:id - Xóa báo cáo
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy báo cáo'
      });
    }

    res.json({
      success: true,
      message: 'Xóa báo cáo thành công'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa báo cáo'
    });
  }
});

// ============ HÀM PHỤ TRỢ TẠO CÁC LOẠI BÁO CÁO ============

async function generateStudentProgressReport(filters) {
  const query = {};
  if (filters.year) query.year = filters.year;
  if (filters.major) query.major = filters.major;

  const students = await Student.find(query).lean();

  if (students.length === 0) {
    return null;
  }

  // Phân loại theo năm học
  const yearDistribution = students.reduce((acc, student) => {
    const year = student.year || 'Chưa xác định';
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  // Phân loại theo ngành
  const majorDistribution = students.reduce((acc, student) => {
    const major = student.major || 'Chưa xác định';
    acc[major] = (acc[major] || 0) + 1;
    return acc;
  }, {});

  return {
    title: 'Báo cáo tiến độ học tập',
    description: 'Phân tích phân bố sinh viên theo năm học và ngành',
    data: {
      totalStudents: students.length,
      yearDistribution: Object.entries(yearDistribution).map(([year, count]) => ({
        year,
        count,
        percentage: ((count / students.length) * 100).toFixed(1)
      })),
      majorDistribution: Object.entries(majorDistribution).map(([major, count]) => ({
        major,
        count,
        percentage: ((count / students.length) * 100).toFixed(1)
      })),
      summary: {
        mostPopularYear: Object.keys(yearDistribution).reduce((a, b) => 
          yearDistribution[a] > yearDistribution[b] ? a : b
        ),
        mostPopularMajor: Object.keys(majorDistribution).reduce((a, b) => 
          majorDistribution[a] > majorDistribution[b] ? a : b
        )
      }
    }
  };
}

async function generateCourseCompletionReport(filters) {
  const tutors = await Tutor.find(filters.department ? { department: filters.department } : {}).lean();

  if (tutors.length === 0) {
    return null;
  }

  // Phân loại tutor theo môn học
  const subjectDistribution = tutors.reduce((acc, tutor) => {
    const subject = tutor.subject || 'Chưa xác định';
    acc[subject] = (acc[subject] || 0) + 1;
    return acc;
  }, {});

  // Phân loại theo khoa
  const departmentDistribution = tutors.reduce((acc, tutor) => {
    const dept = tutor.department || 'Chưa xác định';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  return {
    title: 'Tỷ lệ hoàn thành môn học',
    description: 'Thống kê giảng viên và môn học theo khoa',
    data: {
      totalTutors: tutors.length,
      activeTutors: tutors.filter(t => t.status === 'active').length,
      subjectDistribution: Object.entries(subjectDistribution).map(([subject, count]) => ({
        subject,
        count,
        percentage: ((count / tutors.length) * 100).toFixed(1)
      })),
      departmentDistribution: Object.entries(departmentDistribution).map(([department, count]) => ({
        department,
        count,
        percentage: ((count / tutors.length) * 100).toFixed(1)
      }))
    }
  };
}

async function generateActivityParticipationReport(filters) {
  const dateQuery = {};
  if (filters.startDate) dateQuery.$gte = new Date(filters.startDate);
  if (filters.endDate) dateQuery.$lte = new Date(filters.endDate);

  const students = await Student.find(
    Object.keys(dateQuery).length > 0 ? { createdAt: dateQuery } : {}
  ).lean();

  if (students.length === 0) {
    return null;
  }

  // Phân loại theo trạng thái
  const statusDistribution = students.reduce((acc, student) => {
    const status = student.status || 'active';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Phân tích theo tháng
  const monthlyRegistration = students.reduce((acc, student) => {
    const month = new Date(student.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  return {
    title: 'Mức độ tham gia hoạt động',
    description: 'Thống kê sinh viên theo trạng thái và thời gian đăng ký',
    data: {
      totalParticipants: students.length,
      statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({
        status,
        count,
        percentage: ((count / students.length) * 100).toFixed(1)
      })),
      monthlyTrend: Object.entries(monthlyRegistration)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count }))
    }
  };
}

async function generateTrainingResultsReport(filters) {
  const [studentCount, tutorCount] = await Promise.all([
    Student.countDocuments({}),
    Tutor.countDocuments({})
  ]);

  if (studentCount === 0 && tutorCount === 0) {
    return null;
  }

  // Tỷ lệ sinh viên/giảng viên
  const ratio = tutorCount > 0 ? (studentCount / tutorCount).toFixed(1) : 0;

  // Thống kê theo năm
  const currentYear = new Date().getFullYear();
  const yearlyStats = [];

  for (let year = currentYear - 2; year <= currentYear; year++) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const [students, tutors] = await Promise.all([
      Student.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Tutor.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } })
    ]);

    yearlyStats.push({ year, students, tutors });
  }

  return {
    title: 'Kết quả rèn luyện',
    description: 'Tổng quan về số lượng sinh viên và giảng viên qua các năm',
    data: {
      currentStats: {
        totalStudents: studentCount,
        totalTutors: tutorCount,
        studentTutorRatio: ratio
      },
      yearlyTrend: yearlyStats,
      summary: {
        averageStudentsPerYear: (yearlyStats.reduce((sum, y) => sum + y.students, 0) / yearlyStats.length).toFixed(0),
        averageTutorsPerYear: (yearlyStats.reduce((sum, y) => sum + y.tutors, 0) / yearlyStats.length).toFixed(0)
      }
    }
  };
}

async function generateFeedbackAnalysisReport(filters) {
  const year = filters.year || new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const feedbacks = await Feedback.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
    .populate('student', 'name email major')
    .populate('tutor', 'name subject department')
    .lean();

  if (feedbacks.length === 0) {
    return null;
  }

  // Phân loại theo rating
  const ratingDistribution = feedbacks.reduce((acc, fb) => {
    acc[fb.rating] = (acc[fb.rating] || 0) + 1;
    return acc;
  }, {});

  // Top giảng viên được đánh giá tốt
  const tutorRatings = feedbacks.reduce((acc, fb) => {
    if (!fb.tutor) return acc;
    const tutorId = fb.tutor._id.toString();
    if (!acc[tutorId]) {
      acc[tutorId] = {
        tutor: fb.tutor,
        good: 0,
        bad: 0,
        total: 0
      };
    }
    acc[tutorId].total++;
    if (fb.rating === 'good') acc[tutorId].good++;
    if (fb.rating === 'bad') acc[tutorId].bad++;
    return acc;
  }, {});

  const topTutors = Object.values(tutorRatings)
    .map(t => ({
      name: t.tutor.name,
      subject: t.tutor.subject,
      department: t.tutor.department,
      goodCount: t.good,
      badCount: t.bad,
      totalFeedbacks: t.total,
      satisfactionRate: ((t.good / t.total) * 100).toFixed(1)
    }))
    .sort((a, b) => parseFloat(b.satisfactionRate) - parseFloat(a.satisfactionRate))
    .slice(0, 10);

  return {
    title: 'Phân tích phản hồi',
    description: `Thống kê và phân tích phản hồi từ sinh viên năm ${year}`,
    data: {
      totalFeedbacks: feedbacks.length,
      ratingDistribution: Object.entries(ratingDistribution).map(([rating, count]) => ({
        rating,
        count,
        percentage: ((count / feedbacks.length) * 100).toFixed(1)
      })),
      topTutors,
      overallSatisfactionRate: (
        (ratingDistribution.good || 0) / feedbacks.length * 100
      ).toFixed(1)
    }
  };
}

module.exports = router;