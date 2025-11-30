"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  HiOutlineUser, 
  HiOutlineLockClosed, 
  HiOutlineBell, 
  HiOutlineCreditCard, 
  HiOutlineCloudUpload,
  HiOutlineAcademicCap,
  HiOutlinePlus 
} from 'react-icons/hi';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const BASE_URL = 'http://localhost:5000/api/students';

// --- 1. TAB THÔNG TIN CÁ NHÂN ---
const GeneralSettings = () => {
  const [formData, setFormData] = useState({
    Name: '',
    Email: '', // Readonly
    ID: '',    // Readonly (MSSV)
    ContactInfo: '',
    Major: '',
    LearningGoals: ''
  });
  const [loading, setLoading] = useState(true);

  // Load dữ liệu
  useEffect(() => {
    const fetchProfile = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await axios.get(`${BASE_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const d = res.data;
            setFormData({
                Name: d.Name || '',
                Email: d.Email || '',
                ID: d.ID || '',
                ContactInfo: d.ContactInfo || '',
                Major: d.Major || '',
                LearningGoals: d.LearningGoals || '' // Backend cần trả thêm trường này
            });
        } catch (error) {
            toast.error("Lỗi tải thông tin cá nhân");
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, []);

  // Lưu dữ liệu
  const handleSave = async () => {
      const token = localStorage.getItem('access_token');
      try {
          await axios.put(`${BASE_URL}/me`, formData, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Cập nhật hồ sơ thành công!");
      } catch (error) {
          toast.error("Cập nhật thất bại.");
      }
  };

  if(loading) return <div className="p-4 text-center">Đang tải...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6 pb-6 border-b border-gray-100">
        <div className="relative">
          <Image src="/avatar-placeholder.jpg" alt="Avatar" width={100} height={100} className="rounded-full border-4 border-white shadow-lg object-cover" />
          <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md">
            <HiOutlineCloudUpload className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Ảnh đại diện</h3>
          <p className="text-sm text-gray-500 mb-3">Tải lên ảnh rõ mặt để Tutor dễ nhận diện.</p>
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mã số sinh viên (MSSV)</label>
          <input type="text" value={formData.ID} disabled className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email trường</label>
          <input type="email" value={formData.Email} disabled className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" />
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Khoa / Ngành học</label>
          <div className="flex items-center border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-500">
              <HiOutlineAcademicCap className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                value={formData.Major}
                onChange={(e) => setFormData({...formData, Major: e.target.value})}
                className="w-full bg-transparent outline-none text-gray-700" 
                placeholder="VD: Khoa học máy tính"
              />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mục tiêu học tập</label>
          <textarea 
            rows={3} 
            value={formData.LearningGoals}
            onChange={(e) => setFormData({...formData, LearningGoals: e.target.value})}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none" 
            placeholder="VD: Muốn cải thiện môn Giải tích, đạt GPA 3.5..."
          ></textarea>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

// --- 2. TAB BẢO MẬT ---
const SecuritySettings = () => {
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    const handleChangePass = async () => {
        if (!passData.oldPassword || !passData.newPassword) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
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
            toast.error(error.response?.data?.error || "Đổi mật khẩu thất bại");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Đổi mật khẩu</h3>
            <p className="text-sm text-gray-500 mb-6">Bảo vệ tài khoản sinh viên của bạn.</p>
            
            <div className="space-y-4">
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                <input type="password" value={passData.oldPassword} onChange={e => setPassData({...passData, oldPassword: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                </div>
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                <input type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                </div>
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nhập lại mật khẩu mới</label>
                <input type="password" value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                </div>
            </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
            <button onClick={handleChangePass} className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-all">
                Cập nhật mật khẩu
            </button>
            </div>
        </div>
    );
};

// --- 3. TAB THÔNG BÁO ---
const NotificationSettings = () => {
  const [prefs, setPrefs] = useState({
      schedule: true,
      feedback: true,
      materials: true,
      messages: true
  });

  // Load Settings
  useEffect(() => {
      const fetchSettings = async () => {
          const token = localStorage.getItem('access_token');
          try {
              const res = await axios.get(`${BASE_URL}/settings`, { headers: { Authorization: `Bearer ${token}` } });
              if (res.data && res.data.NotificationPrefs) {
                  setPrefs(res.data.NotificationPrefs);
              }
          } catch (e) { console.error(e); }
      };
      fetchSettings();
  }, []);

  const handleToggle = async (key: string) => {
      const newPrefs = { ...prefs, [key]: !prefs[key as keyof typeof prefs] };
      setPrefs(newPrefs); // Optimistic UI update
      
      const token = localStorage.getItem('access_token');
      try {
          await axios.put(`${BASE_URL}/settings/notifications`, newPrefs, { headers: { Authorization: `Bearer ${token}` } });
          toast.success("Đã lưu cài đặt");
      } catch (e) { 
          toast.error("Lỗi lưu cài đặt");
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
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Thông báo học tập</h3>
      <ToggleItem label="Nhắc nhở lịch học" desc="Thông báo trước 15 phút khi lớp học bắt đầu." settingKey="schedule" />
      <ToggleItem label="Kết quả đánh giá" desc="Nhận thông báo khi Tutor gửi nhận xét về buổi học." settingKey="feedback" />
      <ToggleItem label="Tài liệu mới" desc="Thông báo khi Tutor tải lên tài liệu mới vào thư viện." settingKey="materials" />
      <ToggleItem label="Tin nhắn từ Tutor" desc="Thông báo khi có tin nhắn mới trong hộp thoại." settingKey="messages" />
    </div>
  );
};

// --- 4. TAB THANH TOÁN (UI ONLY) ---
// (Phần này phức tạp, thường cần tích hợp cổng thanh toán bên thứ 3 như Stripe/VNPAY. Giữ nguyên UI demo)
const PaymentSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Phương thức thanh toán đã lưu</h3>
            <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-white/20 rounded flex items-center justify-center">
                        <span className="font-bold text-xs italic">VISA</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                        <p className="text-xs text-gray-400">Hết hạn 12/25</p>
                    </div>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">Mặc định</span>
            </div>
            <button onClick={() => toast("Tính năng đang phát triển")} className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium">
                <HiOutlinePlus className="w-5 h-5 mr-2" />
                Thêm phương thức mới
            </button>
        </div>
        <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Lịch sử giao dịch</h3>
            <p className="text-sm text-gray-500">Xem lại lịch sử đóng học phí của bạn.</p>
            <div className="mt-4 bg-gray-50 p-4 rounded-lg text-center text-sm text-gray-500">
                Chưa có giao dịch nào gần đây.
            </div>
        </div>
    </div>
);

// --- COMPONENT CHÍNH ---

export default function StudentSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Hồ sơ cá nhân', icon: HiOutlineUser },
    { id: 'security', label: 'Bảo mật', icon: HiOutlineLockClosed },
    { id: 'notifications', label: 'Thông báo', icon: HiOutlineBell },
    { id: 'payment', label: 'Thanh toán', icon: HiOutlineCreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-10 pb-20">
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Cài đặt tài khoản</h1>
        <p className="text-gray-500 mt-2">Quản lý thông tin sinh viên và tùy chọn cá nhân.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR */}
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
                      ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'payment' && <PaymentSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}