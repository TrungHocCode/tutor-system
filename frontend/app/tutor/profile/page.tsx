'use client'; // Đánh dấu đây là Client Component để dùng hooks

import Image from 'next/image';
import { HiOutlinePencil } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// --- Type cho dữ liệu Profile ---
interface TutorProfile {
  ID: string;
  Name: string;
  Email: string;
  ContactInfo: string;
  Role: string;
  Specialization?: string;
  Experience?: string;
  // Giả định thêm các trường cần thiết khác (chưa có trong BE hiện tại)
  BirthDate?: string; 
  Address?: string; 
  Phone?: string; 
}

// --- Component phụ hiển thị hàng thông tin ---
const InfoRow = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="min-w-0">
    <h4 className="text-xs font-semibold text-gray-400 uppercase truncate">{label}</h4>
    {/* Dùng toán tử nullish coalescing để hiển thị "Chưa cập nhật" */}
    <p className="text-sm text-white break-words">{value ?? '[Chưa cập nhật]'}</p>
  </div>
);

export default function TutorProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Lấy dữ liệu Hồ sơ (GET /tutors/me) ---
  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Giả định token được lưu trong localStorage sau khi đăng nhập
      const token = localStorage.getItem('access_token'); 
      if (!token) {
        toast.error('Vui lòng đăng nhập lại.');
        router.push('/login'); // Chuyển hướng nếu không có token
        return;
      }

      const response = await fetch('http://localhost:5000/api/tutors/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Thêm token vào header
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
             // Lỗi xác thực hoặc không có quyền (ví dụ: token hết hạn/ko phải tutor)
             localStorage.removeItem('access_token');
             toast.error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
             router.push('/login');
             return;
        }
        throw new Error('Không thể tải dữ liệu hồ sơ.');
      }

      const data: TutorProfile = await response.json();
      setProfileData(data);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi kết nối máy chủ.');
      toast.error(err.message || 'Lỗi tải hồ sơ!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- 2. Xử lý Cập nhật Hồ sơ (PUT /tutors/me) ---
  const handleUpdateProfile = async (updateFields: { Specialization?: string; Experience?: string }) => {
    if (!profileData) return;
    
    // Đang chỉ ví dụ 2 trường có trong BE (tutorService.js)
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/tutors/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateFields),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Cập nhật hồ sơ thất bại.');
      }

      const updatedData: TutorProfile = await response.json();
      setProfileData(updatedData); // Cập nhật lại state với dữ liệu mới
      toast.success('Cập nhật hồ sơ thành công!');

    } catch (err: any) {
      console.error('Update Error:', err);
      toast.error(err.message || 'Lỗi khi cập nhật hồ sơ.');
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <p className="ml-3 text-lg text-white">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400">
        <h2 className="text-xl">Lỗi: {error}</h2>
        <p className="mt-2">Không thể hiển thị thông tin hồ sơ.</p>
      </div>
    );
  }

  // Lấy dữ liệu hoặc đặt giá trị mặc định (nếu profileData là null, dù đã check ở trên)
  const currentProfile = profileData || {} as TutorProfile;
  // --- UI Trang Profile ---
  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6"> 
      
      {/* Thẻ Profile trên cùng */}
      <div className="bg-white/10 p-6 rounded-xl shadow-2xl flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <div className="relative">
          <Image 
            src="/avatar-placeholder.jpg" 
            alt="User Avatar"
            width={120}
            height={120}
            className="rounded-full border-4 border-blue-400/50 object-cover"
          />
          <button className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors">
            <HiOutlinePencil className="w-5 h-5 text-white" />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">{currentProfile.Name}</h1>
          <p className="text-lg font-semibold text-blue-300 uppercase">{currentProfile.Role}</p>
          <p className="text-md text-gray-300 mt-2">TP.HCM, Việt Nam</p>
        </div>
      </div>
      
      {/* Thẻ Thông tin chuyên môn (Có thể cập nhật) */}
      <div className="bg-white/10 p-6 rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-2">
          <h2 className="text-xl font-bold text-white flex items-center">
             Thông tin chuyên môn <span className="ml-2 text-blue-300 text-sm">(tutor fields)</span>
          </h2>
          {/* Ví dụ kích hoạt chức năng cập nhật */}
          <button 
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            onClick={() => handleUpdateProfile({ Specialization: 'New Spec', Experience: '5 years' })}
          >
            <HiOutlinePencil className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoRow label="Chuyên ngành" value={currentProfile.Specialization} />
          <InfoRow label="Kinh nghiệm" value={currentProfile.Experience} />
        </div>
      </div>

      {/* Thẻ Thông tin cá nhân (Giả định nằm ở bảng users - Chưa có trong BE update hiện tại) */}
      <div className="bg-white/10 p-6 rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-2">
          <h2 className="text-xl font-bold text-white">Thông tin cá nhân</h2>
          <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <HiOutlinePencil className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoRow label="Tên" value={currentProfile.Name?.split(' ').pop()} />
          <InfoRow label="Họ" value={currentProfile.Name?.substring(0, currentProfile.Name.lastIndexOf(' '))} />
          <InfoRow label="Địa chỉ Email" value={currentProfile.Email} />
          {/* <InfoRow label="Ngày sinh" value={currentProfile.BirthDate} /> */}
          <InfoRow label="Điện thoại" value={currentProfile.ContactInfo || currentProfile.Phone} />
          <InfoRow label="Vai trò" value={currentProfile.Role} />
        </div>
      </div>

      {/* Thẻ Địa chỉ (Thông tin liên hệ chung) */}
      <div className="bg-white/10 p-6 rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-2">
          <h2 className="text-xl font-bold text-white">Địa chỉ và Liên hệ</h2>
          <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <HiOutlinePencil className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoRow label="Thông tin liên hệ chung" value={currentProfile.ContactInfo} />
          {/* <InfoRow label="Địa chỉ hiện tại" value={currentProfile.Address} />  */}
          <InfoRow label="Thông tin khác" value="[Chưa cập nhật]" />
        </div>
      </div>
      
      {/* Ẩn các tính năng còn thiếu như lịch trống/buổi học, gợi ý nơi tích hợp */}
      <div className="bg-gray-800 p-4 rounded-lg text-white/70 text-sm italic">
        <h3 className="text-lg font-semibold text-blue-300">Tính năng khác (Cần tích hợp)</h3>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>**Quản lý lịch trống** (`/tutors/me/availability`): Cần tạo một trang hoặc component modal riêng để hiển thị/thêm/xóa lịch trống.</li>
          <li>**Quản lý Buổi học** (`/tutors/sessions/me`, `/tutors/sessions`): Cần tạo một trang riêng để hiển thị danh sách các buổi học đã tạo và form tạo buổi học mới.</li>
        </ul>
      </div>
    </div>
  );
}