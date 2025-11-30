"use client";

import { useState } from 'react';
import { HiX, HiStar } from 'react-icons/hi';
import { Evaluation } from './mockStudentData';
import toast from 'react-hot-toast';

interface EvaluationModalProps {
  studentId: string;
  studentName: string;
  studentYear: string;
  studentFaculty: string;
  subject: string;
  onClose: () => void;
  onSave: (evaluation: Evaluation) => void;
}

// Component đánh giá sao
const StarRating = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: number; 
  onChange: (val: number) => void; 
  label: string;
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
      <span className="font-medium text-gray-800 text-sm">{label}</span>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <HiStar 
              className={`w-7 h-7 ${
                star <= (hover || value)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default function EvaluationModal({
  studentId,
  studentName,
  studentYear,
  studentFaculty,
  subject,
  onClose,
  onSave
}: EvaluationModalProps) {
  
  const [sessionNumber, setSessionNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [criteria, setCriteria] = useState({
    understanding: 0,
    participation: 0,
    homework: 0,
    progress: 0
  });

  const updateCriteria = (key: keyof typeof criteria, value: number) => {
    setCriteria(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Validate
    if (!sessionNumber) {
      toast.error('Vui lòng nhập số buổi học!');
      return;
    }

    if (Object.values(criteria).some(v => v === 0)) {
      toast.error('Vui lòng đánh giá đầy đủ tất cả các tiêu chí!');
      return;
    }

    if (!notes.trim()) {
      toast.error('Vui lòng nhập ghi chú!');
      return;
    }

    // Tính điểm trung bình
    const averageScore = Number(
      (Object.values(criteria).reduce((a, b) => a + b, 0) / 4).toFixed(2)
    );

    const evaluation: Evaluation = {
      id: Date.now(),
      studentId,
      tutorId: 'T001',
      date: new Date().toISOString().split('T')[0],
      session: `Buổi ${sessionNumber}`,
      studentName,
      studentYear,
      studentFaculty,
      subject,
      criteria,
      notes,
      strengths: '',
      improvements: '',
      averageScore
    };

    onSave(evaluation);
    toast.success('Đánh giá đã được lưu thành công!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">THEO DÕI TIẾN BỘ</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <HiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button className="flex items-center space-x-2 px-4 py-2 border-b-2 border-gray-800 font-medium text-gray-800">
              <span className="text-lg">ℹ️</span>
              <span>THÔNG TIN SINH VIÊN</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 font-medium text-gray-400 ml-4">
              <span className="text-lg">📝</span>
              <span>ĐÁNH GIÁ</span>
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 gap-8">
            
            {/* Left Column - Thông tin sinh viên */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    Họ và tên:
                  </label>
                  <div className="bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-gray-800">{studentName}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    Khoa:
                  </label>
                  <div className="bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-gray-800">{studentFaculty}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    Khoá:
                  </label>
                  <div className="bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-gray-800">{studentYear}</span>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div className="pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg">📝</span>
                  <h3 className="font-bold text-gray-800">GHI CHÚ</h3>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nhập ghi chú về buổi học, thái độ, tiến bộ của sinh viên..."
                  className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Right Column - Đánh giá */}
            <div className="space-y-4">
              {/* Chủ đề và Số buổi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    Chủ đề
                  </label>
                  <div className="bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-gray-800 text-sm">{subject}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    Buổi số
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(e.target.value)}
                    placeholder="Nhập số buổi"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Chuẩn bị */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  Chuẩn bị
                </label>
                <input
                  type="text"
                  value="vd: XSTK - Xác suất,..."
                  disabled
                  className="w-full bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-500"
                />
              </div>

              {/* Thái độ */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  Thái độ
                </label>
                <input
                  type="text"
                  value="vd: 1, 2, 3, 4, 5,..."
                  disabled
                  className="w-full bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-500"
                />
              </div>

              {/* Kết quả */}
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  Kết quả
                </label>
                <input
                  type="text"
                  value="vd: 1, 2, 3, 4, 5,..."
                  disabled
                  className="w-full bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-500"
                />
              </div>

              {/* Đánh giá với ngôi sao */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Đánh giá chi tiết</h3>
                <StarRating
                  label="Chuẩn bị bài"
                  value={criteria.understanding}
                  onChange={(val) => updateCriteria('understanding', val)}
                />
                <StarRating
                  label="Thái độ học tập"
                  value={criteria.participation}
                  onChange={(val) => updateCriteria('participation', val)}
                />
                <StarRating
                  label="Kết quả bài tập"
                  value={criteria.homework}
                  onChange={(val) => updateCriteria('homework', val)}
                />
                <StarRating
                  label="Tiến bộ chung"
                  value={criteria.progress}
                  onChange={(val) => updateCriteria('progress', val)}
                />
              </div>
            </div>
          </div>

          {/* Danh sách 4 buổi gần nhất (giả lập design) */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4 text-center">4 buổi gần nhất</h3>
            <div className="grid grid-cols-4 gap-4">
              {['Buổi 16', 'Buổi 17', 'Buổi 18', 'Buổi 19'].map((session, idx) => (
                <div 
                  key={idx}
                  className="bg-gray-100 rounded-lg p-6 text-center hover:bg-gray-200 transition cursor-pointer"
                >
                  <span className="font-bold text-gray-700">{session}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nút lưu */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg flex items-center space-x-2"
            >
              <span>➤</span>
              <span>LƯU</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}