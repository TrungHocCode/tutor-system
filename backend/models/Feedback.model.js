const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  rating: {
    type: String,
    enum: ['good', 'bad'],
    required: true
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment không được quá 500 ký tự']
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
feedbackSchema.index({ student: 1, tutor: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;