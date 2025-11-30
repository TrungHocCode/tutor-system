const Tutor = require('../models/Tutor.model');

// Tạo Tutor mới
exports.createTutor = async (req, res) => {
  try {
    const tutor = await Tutor.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Tạo giảng viên thành công',
      data: tutor
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy danh sách Tutors có phân trang
exports.getAllTutors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Lọc theo query params
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const tutors = await Tutor.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Tutor.countDocuments(filter);

    res.status(200).json({
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy thông tin chi tiết 1 Tutor
exports.getTutorById = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên'
      });
    }

    res.status(200).json({
      success: true,
      data: tutor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cập nhật thông tin Tutor
exports.updateTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      data: tutor
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Xóa Tutor
exports.deleteTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findByIdAndDelete(req.params.id);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giảng viên'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa giảng viên thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};