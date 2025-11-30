const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'student_progress',      // Báo cáo tiến độ học tập
      'course_completion',     // Tỷ lệ hoàn thành môn học
      'activity_participation', // Mức độ tham gia hoạt động
      'training_results',      // Kết quả rèn luyện
      'feedback_analysis'      // Phân tích phản hồi
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  filters: {
    year: Number,
    quarter: Number,
    department: String,
    major: String,
    startDate: Date,
    endDate: Date
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  generatedBy: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
reportSchema.index({ type: 1, createdAt: -1 });
reportSchema.index({ 'filters.year': 1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;