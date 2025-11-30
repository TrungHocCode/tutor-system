const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sinh viên là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên không được quá 100 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  studentId: {
    type: String,
    trim: true,
    sparse: true, // Cho phép nhiều giá trị null
    maxlength: [20, 'Mã sinh viên không được quá 20 ký tự']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  major: {
    type: String,
    trim: true,
    maxlength: [100, 'Ngành học không được quá 100 ký tự']
  },
  year: {
    type: Number,
    min: [1, 'Năm học phải từ 1-6'],
    max: [6, 'Năm học phải từ 1-6']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
studentSchema.index({ email: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ name: 1 });
studentSchema.index({ createdAt: -1 });

// Instance method
studentSchema.methods.toJSON = function() {
  const student = this.toObject();
  return student;
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;