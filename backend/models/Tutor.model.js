const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên tutor là bắt buộc'],
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
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Môn học không được quá 100 ký tự']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Khoa không được quá 100 ký tự']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  versionKey: false
});

// Indexes for better query performance
tutorSchema.index({ email: 1 });
tutorSchema.index({ name: 1 });
tutorSchema.index({ createdAt: -1 });

// Instance method to format response
tutorSchema.methods.toJSON = function() {
  const tutor = this.toObject();
  return tutor;
};

const Tutor = mongoose.model('Tutor', tutorSchema);

module.exports = Tutor;