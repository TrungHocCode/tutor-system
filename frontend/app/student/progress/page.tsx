"use client";

import { useState } from 'react';
import { 
  HiChartBar, 
  HiStar, 
  HiOutlineChatAlt, 
  HiOutlineClipboardCheck, 
  HiOutlineAcademicCap,
  HiOutlineEmojiHappy,
  HiOutlineEmojiSad
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

// --- 1. MOCK DATA (Dữ liệu giả lập cho SV) ---

// Thống kê tổng quan
const studentStats = {
  gpa: 8.5,
  creditsEarned: 86,
  feedbackGiven: 12, // Số lần đã đánh giá tutor
  completedCourses: 4
};

// Danh sách các lớp đang học (Để xem tiến độ & nhận xét từ Tutor)
const myCourses = [
  {
    id: 1,
    subject: "Cấu trúc rời rạc",
    tutorName: "Mai Đức Trung",
    progress: 75, // % hoàn thành
    averageScore: 8.0,
    attendance: "8/10",
    latestFeedback: "Trung cần tập trung hơn vào phần Lý thuyết đồ thị. Bài tập về nhà làm rất tốt.",
    feedbackDate: "20/11/2025"
  },
  {
    id: 2,
    subject: "Giải tích 2",
    tutorName: "Nguyễn Thị B",
    progress: 40,
    averageScore: 6.5,
    attendance: "4/10",
    latestFeedback: "Có tiến bộ trong tuần này. Cần ôn lại kiến thức đạo hàm.",
    feedbackDate: "25/11/2025"
  },
  {
    id: 3,
    subject: "Lập trình Python",
    tutorName: "Hoàng Văn F",
    progress: 90,
    averageScore: 9.5,
    attendance: "9/10",
    latestFeedback: "Xuất sắc! Code clean và tư duy thuật toán tốt.",
    feedbackDate: "27/11/2025"
  }
];

// Danh sách Tutor cần đánh giá (Chưa đánh giá hoặc đánh giá định kỳ)
const tutorsToEvaluate = [
  {
    id: 101,
    tutorName: "Mai Đức Trung",
    subject: "Cấu trúc rời rạc",
    sessionDate: "28/11/2025",
    status: "pending" // chưa đánh giá
  },
  {
    id: 102,
    tutorName: "Nguyễn Thị B",
    subject: "Giải tích 2",
    sessionDate: "27/11/2025",
    status: "reviewed" // đã đánh giá
  }
];

// --- 2. COMPONENTS ---

// Component hiển thị sao đánh giá
const RatingStars = ({ rating, setRating, interactive = false }: any) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <HiStar
          key={star}
          className={`w-6 h-6 transition-colors ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
          onClick={() => interactive && setRating(star)}
        />
      ))}
    </div>
  );
};

export default function StudentProgressPage() {
  const [activeTab, setActiveTab] = useState<'my-progress' | 'evaluate-tutor'>('my-progress');
  const [showModal, setShowModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  
  // State cho form đánh giá
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Mở modal đánh giá
  const handleOpenEvaluate = (tutor: any) => {
    setSelectedTutor(tutor);
    setRating(0);
    setComment("");
    setShowModal(true);
  };

  // Gửi đánh giá
  const handleSubmitEvaluation = () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao!");
      return;
    }
    // Logic gọi API lưu đánh giá ở đây
    toast.success(`Đã gửi đánh giá cho Tutor ${selectedTutor.tutorName}!`);
    setShowModal(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6 pb-8">
      
      {/* Header Thống kê (Giống style Tutor) */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tiến độ & Đánh giá</h1>
            <p className="text-indigo-100">Theo dõi kết quả học tập và phản hồi chất lượng giảng dạy</p>
          </div>
          <HiChartBar className="w-16 h-16 text-indigo-200 opacity-50" />
        </div>

        {/* Stats Cards */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-indigo-100 text-sm mb-1">Điểm TB (GPA)</div>
            <div className="text-3xl font-bold text-yellow-300">{studentStats.gpa}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-indigo-100 text-sm mb-1">Tín chỉ tích lũy</div>
            <div className="text-3xl font-bold">{studentStats.creditsEarned}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-indigo-100 text-sm mb-1">Đánh giá đã gửi</div>
            <div className="text-3xl font-bold">{studentStats.feedbackGiven}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-indigo-100 text-sm mb-1">Môn hoàn thành</div>
            <div className="text-3xl font-bold">{studentStats.completedCourses}</div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('my-progress')}
          className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'my-progress' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Kết quả học tập
        </button>
        <button
          onClick={() => setActiveTab('evaluate-tutor')}
          className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'evaluate-tutor' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Đánh giá Tutor
        </button>
      </div>

      {/* === TAB 1: KẾT QUẢ HỌC TẬP (Xem Feedback từ Tutor) === */}
      {activeTab === 'my-progress' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {myCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{course.subject}</h3>
                  <p className="text-sm text-gray-500">GV: {course.tutorName}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  course.averageScore >= 8 ? 'bg-green-100 text-green-700' : 
                  course.averageScore >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  ĐTB: {course.averageScore}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Tiến độ</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineChatAlt className="text-indigo-600 w-4 h-4"/>
                  <span className="text-xs font-bold text-gray-700 uppercase">Nhận xét mới nhất</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{course.feedbackDate}</span>
                </div>
                <p className="text-sm text-gray-600 italic">"{course.latestFeedback}"</p>
              </div>

              <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm">
                <span className="text-gray-500">Điểm danh:</span>
                <span className="font-medium text-gray-900">{course.attendance}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === TAB 2: ĐÁNH GIÁ TUTOR (Gửi Feedback) === */}
      {activeTab === 'evaluate-tutor' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Section: Cần đánh giá */}
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
              <span className="w-2 h-6 bg-red-500 rounded-full mr-2"></span>
              Cần đánh giá
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorsToEvaluate.filter(t => t.status === 'pending').map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">{item.subject}</h4>
                    <p className="text-sm text-gray-600">Tutor: {item.tutorName}</p>
                    <p className="text-xs text-gray-400 mt-1">Buổi học: {item.sessionDate}</p>
                  </div>
                  <button 
                    onClick={() => handleOpenEvaluate(item)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-transform active:scale-95"
                  >
                    Đánh giá ngay
                  </button>
                </div>
              ))}
              {tutorsToEvaluate.filter(t => t.status === 'pending').length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                  Bạn đã hoàn thành tất cả đánh giá! 🎉
                </div>
              )}
            </div>
          </div>

          {/* Section: Lịch sử đánh giá */}
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
              <span className="w-2 h-6 bg-green-500 rounded-full mr-2"></span>
              Lịch sử đánh giá
            </h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tutorsToEvaluate.filter(t => t.status === 'reviewed').map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tutorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sessionDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Đã hoàn thành
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL ĐÁNH GIÁ (POPUP) === */}
      {showModal && selectedTutor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Header Modal */}
            <div className="bg-indigo-600 p-4 text-white">
              <h3 className="text-xl font-bold">Đánh giá Tutor</h3>
              <p className="text-indigo-100 text-sm">{selectedTutor.subject} - {selectedTutor.sessionDate}</p>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-6">
              
              {/* Thông tin Tutor */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">👨‍🏫</div>
                <div>
                  <p className="text-sm text-gray-500">Giảng viên hướng dẫn</p>
                  <p className="font-bold text-gray-900 text-lg">{selectedTutor.tutorName}</p>
                </div>
              </div>

              {/* Chọn sao */}
              <div className="text-center">
                <p className="text-gray-600 mb-2 font-medium">Bạn cảm thấy buổi học thế nào?</p>
                <div className="flex justify-center">
                  <RatingStars rating={rating} setRating={setRating} interactive={true} />
                </div>
                <p className="text-sm text-indigo-600 font-bold mt-2 h-5">
                  {rating === 1 ? "Rất tệ 😡" : rating === 2 ? "Cần cải thiện 😞" : rating === 3 ? "Bình thường 😐" : rating === 4 ? "Tốt 🙂" : rating === 5 ? "Tuyệt vời! 😍" : ""}
                </p>
              </div>

              {/* Nhập nhận xét */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhận xét chi tiết (Tùy chọn)</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Thầy dạy dễ hiểu, nhiệt tình..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              {/* Gợi ý nhanh */}
              <div className="flex flex-wrap gap-2">
                {['Nhiệt tình', 'Dễ hiểu', 'Đúng giờ', 'Bài giảng hay'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setComment(prev => prev + (prev ? ", " : "") + tag)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full transition"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition"
              >
                Hủy
              </button>
              <button 
                onClick={handleSubmitEvaluation}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition transform active:scale-95"
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}