"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { HiOutlinePencil, HiAcademicCap, HiMail, HiPhone, HiUser } from 'react-icons/hi';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

// --- CONFIG ---
const BASE_URL = 'http://localhost:5000/api/students';

// --- TYPES ---
interface StudentProfile {
  ID: number;
  Name: string;
  Email: string;
  ContactInfo: string | null;
  Role: string;
  Major: string | null; // Trường đặc biệt của Student
}

// --- HELPER COMPONENT ---
const InfoRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="flex items-start p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="bg-blue-50 p-3 rounded-full text-blue-600 mr-4">
      {icon || <HiUser className="w-6 h-6" />}
    </div>
    <div>
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</h4>
      <p className="text-gray-800 font-medium text-lg break-all">{value || "---"}</p>
    </div>
  </div>
);

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        window.location.href = '/login'; // Redirect nếu không có token
        return;
      }

      try {
        setLoading(true);
        // Gọi API GET /me đã định nghĩa trong studentRouter
        const response = await axios.get(`${BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setProfile(response.data);
      } catch (error) {
        console.error("Lỗi tải hồ sơ:", error);
        toast.error("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- RENDER LOADING ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!profile) return <div className="text-center mt-10">Không tìm thấy thông tin sinh viên.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <Toaster position="top-right" />

      {/* --- HEADER CARD --- */}
      <div className="relative bg-linear-to-r from-[#0313B0] to-blue-600 p-8 rounded-3xl shadow-xl text-white overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar Area */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white/30 bg-white overflow-hidden shadow-2xl">
               {/* Placeholder Avatar - Bạn có thể thay bằng URL thật nếu DB có lưu ảnh */}
              <Image 
                src="/avatar-placeholder.jpg" 
                alt="Avatar"
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
            <button className="absolute bottom-0 right-0 bg-white text-blue-900 p-2 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-110" title="Đổi ảnh đại diện">
              <HiOutlinePencil className="w-4 h-4" />
            </button>
          </div>

          {/* Info Area */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-bold font-serif mb-2">{profile.Name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10">
                Sinh viên
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10 flex items-center gap-1">
                 <HiAcademicCap className="w-4 h-4"/>
                 {profile.Major || "Chưa cập nhật chuyên ngành"}
              </span>
            </div>
            <p className="opacity-90 text-sm max-w-xl">
              Sinh viên trường Đại học Bách Khoa - ĐHQG TP.HCM. 
              Luôn sẵn sàng học hỏi và kết nối tri thức.
            </p>
          </div>
        </div>
      </div>

      {/* --- MAIN INFO GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Cột Trái: Thông tin liên hệ */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Thông tin cá nhân
             </h3>
             <button 
                onClick={() => toast("Tính năng chỉnh sửa đang phát triển")}
                className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
             >
                <HiOutlinePencil /> Chỉnh sửa
             </button>
          </div>
          
          <div className="grid gap-4">
             <InfoRow 
                label="Họ và tên" 
                value={profile.Name} 
                icon={<HiUser className="w-6 h-6"/>}
             />
             <InfoRow 
                label="Chuyên ngành" 
                value={profile.Major || "Chưa cập nhật"} 
                icon={<HiAcademicCap className="w-6 h-6"/>}
             />
             <InfoRow 
                label="Mã số sinh viên (ID)" 
                value={profile.ID.toString()} 
                icon={<span className="font-bold text-lg">#</span>}
             />
          </div>
        </div>

        {/* Cột Phải: Liên lạc */}
        <div className="space-y-6">
           <h3 className="text-xl font-bold text-gray-800 px-2 pt-1">Thông tin liên hệ</h3>
           <div className="grid gap-4">
             <InfoRow 
                label="Email Nhà trường" 
                value={profile.Email} 
                icon={<HiMail className="w-6 h-6"/>}
             />
             <InfoRow 
                label="Số điện thoại / Liên hệ" 
                value={profile.ContactInfo || "Chưa cập nhật"} 
                icon={<HiPhone className="w-6 h-6"/>}
             />
           </div>
           
           {/* Card trạng thái học tập (Demo UI) */}
           <div className="bg-linear-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 mt-4">
              <h4 className="font-bold text-gray-700 mb-2">Trạng thái tài khoản</h4>
              <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-2 rounded-lg w-fit">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 Đang hoạt động
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}