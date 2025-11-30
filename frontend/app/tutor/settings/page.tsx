"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  HiOutlineUser, 
  HiOutlineLockClosed, 
  HiOutlineBell, 
  HiOutlineCreditCard, 
  HiOutlineCloudUpload
} from 'react-icons/hi';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const BASE_URL = 'http://localhost:5000/api/tutors'; // Cập nhật port BE

// --- 1. Tab Thông Tin Cá Nhân (General Settings) ---
const GeneralSettings = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    Name: '',
    Specialization: '', // Chức danh/Nghề nghiệp
    Email: '',
    ContactInfo: '',
    Experience: ''      // Bio/Kinh nghiệm
  });

  // Fetch dữ liệu khi load trang
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const res = await axios.get(`${BASE_URL}/me`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setFormData({
            Name: data.Name || '',
            Specialization: data.Specialization || '',
            Email: data.Email || '',
            ContactInfo: data.ContactInfo || '',
            Experience: data.Experience || ''
        });
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
      const token = localStorage.getItem('access_token');
      try {
          await axios.put(`${BASE_URL}/me`, formData, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Cập nhật hồ sơ thành công!");
          
          // Cập nhật lại localStorage user_data để hiển thị đúng tên ở Header (nếu có dùng)
          const storedUser = localStorage.getItem('user_data');
          if (storedUser) {
              const parsed = JSON.parse(storedUser);
              parsed.Name = formData.Name;
              localStorage.setItem('user_data', JSON.stringify(parsed));
          }

      } catch (error) {
          console.error(error);
          toast.error("Cập nhật thất bại. Vui lòng thử lại.");
      }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải thông tin...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6 pb-6 border-b border-gray-100">
        <div className="relative">
          <Image 
            src="/avatar-placeholder.jpg" 
            alt="Avatar" 
            width={100} 
            height={100} 
            className="rounded-full border-4 border-white shadow-lg object-cover"
          />
          <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md">
            <HiOutlineCloudUpload className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Ảnh đại diện</h3>
          <p className="text-sm text-gray-500 mb-3">Cho phép định dạng JPG, GIF hoặc PNG. Tối đa 5MB.</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
          <input 
            type="text" 
            value={formData.Name}
            onChange={(e) => setFormData({...formData, Name: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Chức danh / Chuyên môn</label>
          <input 
            type="text" 
            value={formData.Specialization}
            onChange={(e) => setFormData({...formData, Specialization: e.target.value})}
            placeholder="VD: Gia sư Toán cao cấp"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            value={formData.Email}
            disabled 
            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
          <input 
            type="tel" 
            value={formData.ContactInfo}
            onChange={(e) => setFormData({...formData, ContactInfo: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Kinh nghiệm / Giới thiệu</label>
          <textarea 
            rows={4} 
            value={formData.Experience}
            onChange={(e) => setFormData({...formData, Experience: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none" 
            placeholder="Hãy viết đôi chút về kinh nghiệm giảng dạy của bạn..."
          ></textarea>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

// --- 2. Tab Bảo Mật (Security Settings) ---
const SecuritySettings = () => {
  const [passData, setPassData] = useState({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
  });

  const handleChangePass = async () => {
      // Validate Client
      if (!passData.oldPassword || !passData.newPassword) {
          toast.error("Vui lòng nhập đầy đủ thông tin.");
          return;
      }
      if (passData.newPassword !== passData.confirmPassword) {
          toast.error("Mật khẩu mới không khớp!");
          return;
      }

      const token = localStorage.getItem('access_token');
      try {
          await axios.put(`${BASE_URL}/change-password`, {
              oldPassword: passData.oldPassword,
              newPassword: passData.newPassword
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          toast.success("Đổi mật khẩu thành công!");
          setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Reset form
      } catch (error: any) {
          toast.error(error.response?.data?.error || "Đổi mật khẩu thất bại.");
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">Đổi mật khẩu</h3>
        <p className="text-sm text-gray-500 mb-6">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
            <input 
                type="password" 
                value={passData.oldPassword}
                onChange={e => setPassData({...passData, oldPassword: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
            <input 
                type="password" 
                value={passData.newPassword}
                onChange={e => setPassData({...passData, newPassword: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nhập lại mật khẩu mới</label>
            <input 
                type="password" 
                value={passData.confirmPassword}
                onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button 
            onClick={handleChangePass}
            className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-all"
        >
          Cập nhật mật khẩu
        </button>
      </div>
    </div>
  );
};

// --- 3. Tab Thông Báo (UI Only - Vì chưa có DB lưu setting này) ---
const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({
      newLesson: true,
      message: true,
      reminder: true,
      system: true
  });

  // 1. Tải cấu hình khi vào trang
  useEffect(() => {
      const fetchSettings = async () => {
          const token = localStorage.getItem('access_token');
          try {
              const res = await axios.get(`${BASE_URL}/settings/notifications`, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              if (res.data) {
                  setPrefs(res.data);
              }
          } catch (error) {
              console.error(error);
              toast.error("Không thể tải cấu hình thông báo.");
          } finally {
              setLoading(false);
          }
      };
      fetchSettings();
  }, []);

  // 2. Hàm xử lý khi bật/tắt switch
  const handleToggle = async (key: string) => {
      // Optimistic Update: Cập nhật UI ngay lập tức
      const newPrefs = { ...prefs, [key]: !prefs[key as keyof typeof prefs] };
      setPrefs(newPrefs);
      
      const token = localStorage.getItem('access_token');
      try {
          // Gọi API lưu xuống DB
          await axios.put(`${BASE_URL}/settings/notifications`, newPrefs, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Đã lưu thay đổi");
      } catch (error) {
          console.error(error);
          toast.error("Lỗi khi lưu cài đặt.");
          // Nếu lỗi, revert lại UI cũ
          setPrefs(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
      }
  };

  const ToggleItem = ({ label, desc, settingKey }: { label: string, desc: string, settingKey: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-4 -mx-4 rounded-lg transition-colors">
      <div>
        <h4 className="text-sm font-bold text-gray-800">{label}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={prefs[settingKey as keyof typeof prefs]} 
            onChange={() => handleToggle(settingKey)}
            disabled={loading}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  if (loading) return <div className="p-4 text-center text-gray-500">Đang tải cài đặt...</div>;

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Tùy chọn nhận thông báo</h3>
      <ToggleItem label="Lịch học mới" desc="Nhận thông báo khi có học viên đăng ký lịch mới." settingKey="newLesson" />
      <ToggleItem label="Tin nhắn từ học viên" desc="Thông báo khi có tin nhắn mới trong hộp thoại." settingKey="message" />
      <ToggleItem label="Nhắc nhở lịch dạy" desc="Nhận thông báo trước 30 phút khi lớp học bắt đầu." settingKey="reminder" />
      <ToggleItem label="Cập nhật hệ thống" desc="Nhận thông tin về các tính năng mới." settingKey="system" />
    </div>
  );
};

// --- COMPONENT CHÍNH ---

export default function TutorSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: HiOutlineUser },
    { id: 'security', label: 'Bảo mật', icon: HiOutlineLockClosed },
    { id: 'notifications', label: 'Thông báo', icon: HiOutlineBell },
    { id: 'payment', label: 'Thanh toán', icon: HiOutlineCreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 pb-20">
      <Toaster position="top-right" />
      {/* Header của trang Settings */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Cài đặt tài khoản</h1>
        <p className="text-gray-500 mt-2">Quản lý thông tin hồ sơ và các tùy chọn bảo mật của bạn.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR TAB NAVIGATION */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <nav className="flex flex-col p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            
            {/* Demo Content cho Tab Payment */}
            {activeTab === 'payment' && (
               <div className="text-center py-20 animate-in fade-in zoom-in duration-300">
                  <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineCreditCard className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Phương thức thanh toán</h3>
                  <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    Tính năng liên kết ngân hàng để nhận lương đang được phát triển. Vui lòng quay lại sau!
                  </p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}