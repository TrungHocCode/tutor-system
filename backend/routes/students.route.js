const express = require('express');
const router = express.Router();
const Student = require('../models/Student.model');

// GET /api/v1/students - Lấy danh sách students (có phân trang)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query filters (optional)
    const filters = {};
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { studentId: { $regex: req.query.search, $options: 'i' } },
        { major: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.major) {
      filters.major = req.query.major;
    }
    if (req.query.year) {
      filters.year = parseInt(req.query.year);
    }

    const [students, total] = await Promise.all([
      Student.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filters)
    ]);

    res.json({
      success: true,
      data: students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách students',
      error: error.message
    });
  }
});

// GET /api/v1/students/:id - Lấy chi tiết 1 student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sinh viên',
      error: error.message
    });
  }
});

// POST /api/v1/students - Tạo student mới
router.post('/', async (req, res) => {
  try {
    const { name, email, studentId, phone, major, year } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Tên và email là bắt buộc'
      });
    }

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }

    // Check if studentId already exists (if provided)
    if (studentId) {
      const existingId = await Student.findOne({ studentId });
      if (existingId) {
        return res.status(400).json({
          success: false,
          message: 'Mã sinh viên đã tồn tại'
        });
      }
    }

    const student = await Student.create({
      name,
      email,
      studentId,
      phone,
      major,
      year
    });

    res.status(201).json({
      success: true,
      message: 'Tạo sinh viên thành công',
      data: student
    });
  } catch (error) {
    console.error('Error creating student:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo sinh viên',
      error: error.message
    });
  }
});

// PUT /api/v1/students/:id - Cập nhật student
router.put('/:id', async (req, res) => {
  try {
    const { name, email, studentId, phone, major, year } = req.body;

    // Check if student exists
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== student.email) {
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Email đã tồn tại'
        });
      }
    }

    // Check if studentId is being changed and already exists
    if (studentId && studentId !== student.studentId) {
      const existingId = await Student.findOne({ studentId });
      if (existingId) {
        return res.status(400).json({
          success: false,
          message: 'Mã sinh viên đã tồn tại'
        });
      }
    }

    // Update fields
    if (name) student.name = name;
    if (email) student.email = email;
    if (studentId !== undefined) student.studentId = studentId;
    if (phone !== undefined) student.phone = phone;
    if (major !== undefined) student.major = major;
    if (year !== undefined) student.year = year;

    await student.save();

    res.json({
      success: true,
      message: 'Cập nhật sinh viên thành công',
      data: student
    });
  } catch (error) {
    console.error('Error updating student:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật sinh viên',
      error: error.message
    });
  }
});

// DELETE /api/v1/students/:id - Xóa student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }

    res.json({
      success: true,
      message: 'Xóa sinh viên thành công',
      data: student
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sinh viên',
      error: error.message
    });
  }
});

module.exports = router;