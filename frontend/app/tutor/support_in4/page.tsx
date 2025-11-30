"use client";

import { useState, useCallback } from 'react';
import { HiX } from 'react-icons/hi';
import { NotiContainer } from '@/components/noti';
import AvailabilitySchedule from '@/components/AvailabilitySchedule';
import axios from 'axios';
// Mock data ban đầu
const INITIAL_EXPERTISE = ['Giải tích 2', 'Cấu trúc dữ liệu và giải thuật', 'Kỹ thuật lập trình', 'Công nghệ phần mềm'];
const INITIAL_SKILLS = ['Giao tiếp tiếng anh', 'Viết report bằng latex'];
const BASE_URL = 'http://localhost:5000';
interface NotificationItem {
  id: number;
  type: 'success' | 'error';
  title: string;
  message: string;
}

interface AvailableSlot {
  ID?: number; 
  Date: string; // YYYY-MM-DD
  StartTime: string; // HH:MM:SS
  EndTime: string; // HH:MM:SS
}

export default function TutorSupportInfoPage() {
  // State quản lý tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule'>('profile');

  // State quản lý dữ liệu Hồ sơ hỗ trợ
  const [expertise, setExpertise] = useState<string[]>(INITIAL_EXPERTISE);
  const [skills, setSkills] = useState<string[]>(INITIAL_SKILLS);
  const [experience, setExperience] = useState('');

  // State quản lý input
  const [expertiseInput, setExpertiseInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  // State quản lý modal xác nhận hủy
  const [showCancelModal, setShowCancelModal] = useState(false);

  // State quản lý thông báo
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Backup data để restore khi hủy
  const [backupData, setBackupData] = useState({
    expertise: INITIAL_EXPERTISE,
    skills: INITIAL_SKILLS,
    experience: ''
  });

  // Hàm thêm thông báo
const addNotification = useCallback((type: 'success' | 'error', title: string, message: string) => {
      const newNoti: NotificationItem = {
        id: Date.now() + Math.random(), // FIX KEY ISSUE HERE
        type,
        title,
        message
      };
      // setNotifications là hàm ổn định (stable function), nên dependencies là []
      setNotifications(prev => [...prev, newNoti]); 
  }, [setNotifications]);

  // Hàm xóa thông báo
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Thêm expertise
  const addExpertise = () => {
    if (expertiseInput.trim()) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput('');
    }
  };

  // Xóa expertise
  const removeExpertise = (index: number) => {
    setExpertise(expertise.filter((_, i) => i !== index));
  };

  // Thêm skill
  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  // Xóa skill
  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Xử lý lưu thông tin Hồ sơ
  const handleSaveProfile = () => {
    try {
      setBackupData({ expertise, skills, experience });
      addNotification('success', 'Thành công', 'Cập nhật thông tin thành công!');
    } catch (error) {
      addNotification('error', 'Lỗi', 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau!');
    }
  };

  // Xử lý hủy thay đổi
  const handleCancelConfirm = () => {
    setExpertise(backupData.expertise);
    setSkills(backupData.skills);
    setExperience(backupData.experience);
    setShowCancelModal(false);
  };

  // Xử lý lưu lịch rảnh
  const handleSaveSchedule = async (newSlots: AvailableSlot[], deletedIds: number[]) => {
    let successCount = 0;
    let errorCount = 0;
    const token = localStorage.getItem('access_token'); 

    if (!token) {
        addNotification('error', 'Lỗi xác thực', 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        throw new Error('Missing token');
    }

    const config = {
        headers: {
            Authorization: `Bearer ${token}` 
        }
    };
    try {
        // 1. Xử lý xóa (DELETE)
        if (deletedIds.length > 0) {
            await Promise.all(deletedIds.map(async (id) => {
                try {
                    // Endpoint: DELETE /api/tutors/me/availability/:id
                    await axios.delete(`${BASE_URL}/api/tutors/me/availability/${id}`, config);
                    successCount++;
                } catch(e) {
                    console.error(`Lỗi xóa slot ID ${id}:`, e);
                    errorCount++;
                }
            }));
        }

        // 2. Xử lý thêm mới (POST)
        if (newSlots.length > 0) {
            await Promise.all(newSlots.map(async (slot) => {
                // Endpoint: POST /api/tutors/me/availability
                try {
                    // Gửi dữ liệu đúng format BE: { Date, StartTime, EndTime }
                    await axios.post(`${BASE_URL}/api/tutors/me/availability`, slot, config);
                    successCount++;
                } catch(e) {
                    console.error('Lỗi thêm slot mới:', e);
                    errorCount++;
                }
            }));
        }

        if (successCount > 0) {
            addNotification('success', 'Thành công', `Đã xử lý thành công ${successCount} thay đổi (Thêm mới/Xóa)!`);
        }
        if (errorCount > 0) {
            addNotification('error', 'Lỗi', `Đã xảy ra lỗi với ${errorCount} tác vụ. Vui lòng kiểm tra console.`);
            // Ném lỗi để component con (AvailabilitySchedule) biết và fetch lại
            throw new Error('Some save operations failed.');
        }

    } catch (error) {
        console.error("Lỗi API tổng thể khi lưu lịch rảnh:", error);
        if (successCount === 0) {
            addNotification('error', 'Lỗi', 'Không thể lưu lịch rảnh do lỗi hệ thống.');
        }
        // Ném lỗi để component con (AvailabilitySchedule) biết và fetch lại
        throw error;
    }
  };
  // Xử lý khi nhấn Enter trong input
  const handleExpertiseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExpertise();
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Container thông báo */}
      <NotiContainer notifications={notifications} onRemove={removeNotification} />

      {/* Header với tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full p-1" style={{ backgroundColor: '#E8E8E8' }}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-8 py-2.5 rounded-full font-bold text-base transition-all ${
              activeTab === 'profile'
                ? 'text-black shadow-md'
                : 'text-gray-600'
            }`}
            style={activeTab === 'profile' ? { backgroundColor: '#D4D9E5' } : {}}
          >
            Hồ sơ hỗ trợ
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-8 py-2.5 rounded-full font-bold text-base transition-all ${
              activeTab === 'schedule'
                ? 'text-black shadow-md'
                : 'text-gray-600'
            }`}
            style={activeTab === 'schedule' ? { backgroundColor: '#D4D9E5' } : {}}
          >
            Thiết lập lịch rảnh
          </button>
        </div>
      </div>

      {/* Main content - Flex layout 10:4 */}
      <div className="max-w-7xl mx-auto flex gap-6">
        
        {/* Cột bên trái - Nội dung chính (10/14 = 71.43%) */}
        <div className="flex-[10]">
          <div className="rounded-3xl shadow-2xl p-8" style={{ backgroundColor: '#F2F6F4' }}>
            
            {/* ========== TAB 1: HỒ SƠ HỖ TRỢ ========== */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <h1 className="text-3xl font-bold text-center mb-8" style={{ color: '#0313B0' }}>
                  Thông tin chuyên môn và giới thiệu
                </h1>

                <div className="space-y-6">
                  {/* Lĩnh vực chuyên môn */}
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-xl mr-2">👤</span>
                      <label className="font-bold text-lg text-black">Lĩnh vực chuyên môn :</label>
                    </div>
                    
                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        onKeyDown={handleExpertiseKeyDown}
                        placeholder="Nhập các môn học hoặc lĩnh vực bạn có thể hỗ trợ"
                        className="w-full px-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-blue-500 text-gray-700"
                        style={{ backgroundColor: 'white' }}
                      />
                      {expertiseInput && (
                        <button
                          onClick={addExpertise}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-white w-9 h-9 rounded-full flex items-center justify-center hover:opacity-90 transition font-bold text-lg"
                          style={{ backgroundColor: '#0313B0' }}
                        >
                          T
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {expertise.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center px-4 py-2 bg-white rounded-full border border-gray-300 text-sm"
                        >
                          <button
                            onClick={() => removeExpertise(index)}
                            className="mr-2 text-gray-500 hover:text-red-600 transition"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                          <span className="text-gray-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kỹ năng cụ thể */}
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-xl mr-2">💡</span>
                      <label className="font-bold text-lg text-black">Kỹ năng cụ thể :</label>
                    </div>
                    
                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder="VD: MATLAB, Debugging, Viết báo cáo khoa học..."
                        className="w-full px-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-blue-500 text-gray-700"
                        style={{ backgroundColor: 'white' }}
                      />
                      {skillInput && (
                        <button
                          onClick={addSkill}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-white w-9 h-9 rounded-full flex items-center justify-center hover:opacity-90 transition font-bold text-lg"
                          style={{ backgroundColor: '#0313B0' }}
                        >
                          T
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skills.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center px-4 py-2 bg-white rounded-full border border-gray-300 text-sm"
                        >
                          <button
                            onClick={() => removeSkill(index)}
                            className="mr-2 text-gray-500 hover:text-red-600 transition"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                          <span className="text-gray-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kinh nghiệm và mô tả */}
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-xl mr-2">🎓</span>
                      <label className="font-bold text-lg text-black">Kinh nghiệm và mô tả :</label>
                    </div>
                    
                    <textarea
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Mô tả về phương pháp giảng dạy, kinh nghiệm của bạn và những gì sinh viên có thể mong đợi từ buổi hỗ trợ"
                      rows={6}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 focus:outline-none focus:border-blue-500 resize-none text-gray-700"
                      style={{ backgroundColor: 'white' }}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-center space-x-4 mt-8">
                  <button
                    onClick={handleSaveProfile}
                    className="px-8 py-3 rounded-full font-bold text-white text-base shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                    style={{ backgroundColor: '#0313B0' }}
                  >
                    <span>💾</span>
                    <span>Lưu thông tin</span>
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-8 py-3 rounded-full font-bold text-white text-base shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                    style={{ backgroundColor: '#28A745' }}
                  >
                    <span>✖</span>
                    <span>Hủy thay đổi</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========== TAB 2: THIẾT LẬP LỊCH RẢNH ========== */}
            {activeTab === 'schedule' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-center mb-8" style={{ color: '#0313B0' }}>
              Lịch rảnh chung hằng tuần
            </h1>
            
            {/* TRUYỀN HÀM onSave VÀ addNotification XUỐNG */}
            <AvailabilitySchedule 
              onSave={handleSaveSchedule} 
              addNotification={addNotification} 
            />
          </div>
        )}
          </div>
        </div>

        {/* Cột bên phải - Profile card (4/14 = 28.57%) */}
        <div className="flex-[4]">
          <div className="rounded-3xl shadow-2xl p-6 h-full flex flex-col justify-center items-center" style={{backgroundColor: '#F2F6F4' }}>
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200">
                <img 
                  src="/avatar-placeholder.jpg" 
                  alt="Tutor Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center space-y-2 w-full" style={{color : '#0313B0'}}>
                <div>
                  <h3 className="font-bold text-base">Họ tên : Trương Anh Ngọc</h3>
                </div>
                <div>
                  <p className="font-bold text-sm">Mã căn bộ/MSSV : 332942</p>
                </div>
                <div>
                  <p className="font-bold text-sm">Khoa/Bộ môn : KHKTMT</p>
                </div>
                <div>
                  <p className="font-bold text-sm">Email: mothaiba@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận hủy (cho tab Hồ sơ hỗ trợ) */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl w-[500px] p-8 shadow-2xl relative">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <HiX className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-center mb-4" style={{ color: '#0313B0' }}>
              Xác nhận hủy ?
            </h2>
            <p className="text-center text-gray-700 mb-2">
              Tất cả các thay đổi chưa lưu sẽ bị mất.
            </p>
            <p className="text-center text-gray-700 mb-6">
              Bạn có chắc chắn muốn hủy không?
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelConfirm}
                className="px-6 py-2.5 rounded-full font-bold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: '#0313B0' }}
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-6 py-2.5 rounded-full font-bold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: '#28A745' }}
              >
                Hủy thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}