const express = require('express');
const router = express.Router();
const Tutor = require('../models/Tutor.model');

// GET /api/v1/tutors - Lấy danh sách tutors (có phân trang)
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
        { subject: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.department) {
      filters.department = req.query.department;
    }

    const [tutors, total] = await Promise.all([
      Tutor.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tutor.countDocuments(filters)
    ]);

    res.json({
      success: true,
      data: tutors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tutors',
      error: error.message
    });
  }
});

// GET /api/v1/tutors/:id - Lấy chi tiết 1 tutor
router.get('/:id', async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tutor'
      });
    }

    res.json({
      success: true,
      data: tutor
    });
  } catch (error) {
    console.error('Error fetching tutor:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin tutor',
      error: error.message
    });
  }
});

// POST /api/v1/tutors - Tạo tutor mới
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, department } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Tên và email là bắt buộc'
      });
    }

    // Check if email already exists
    const existingTutor = await Tutor.findOne({ email });
    if (existingTutor) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }

    const tutor = await Tutor.create({
      name,
      email,
      phone,
      subject,
      department
    });

    res.status(201).json({
      success: true,
      message: 'Tạo tutor thành công',
      data: tutor
    });
  } catch (error) {
    console.error('Error creating tutor:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo tutor',
      error: error.message
    });
  }
});

// PUT /api/v1/tutors/:id - Cập nhật tutor
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, subject, department } = req.body;

    // Check if tutor exists
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tutor'
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== tutor.email) {
      const existingTutor = await Tutor.findOne({ email });
      if (existingTutor) {
        return res.status(400).json({
          success: false,
          message: 'Email đã tồn tại'
        });
      }
    }

    // Update fields
    if (name) tutor.name = name;
    if (email) tutor.email = email;
    if (phone !== undefined) tutor.phone = phone;
    if (subject !== undefined) tutor.subject = subject;
    if (department !== undefined) tutor.department = department;

    await tutor.save();

    res.json({
      success: true,
      message: 'Cập nhật tutor thành công',
      data: tutor
    });
  } catch (error) {
    console.error('Error updating tutor:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật tutor',
      error: error.message
    });
  }
});

// DELETE /api/v1/tutors/:id - Xóa tutor
router.delete('/:id', async (req, res) => {
  try {
    const tutor = await Tutor.findByIdAndDelete(req.params.id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tutor'
      });
    }

    res.json({
      success: true,
      message: 'Xóa tutor thành công',
      data: tutor
    });
  } catch (error) {
    console.error('Error deleting tutor:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tutor',
      error: error.message
    });
  }
});

module.exports = router;