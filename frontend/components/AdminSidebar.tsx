"use client";

import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineHome, HiOutlineUserGroup, HiOutlineUsers, HiAcademicCap } from 'react-icons/hi';
import { FaChalkboardTeacher } from 'react-icons/fa';



// Component NavLink
const NavLink = ({ href, icon: Icon, text, active }: any) => (
  <Link href={href}>
    <div className={`
      flex items-center p-3 rounded-lg text-sm font-medium
      ${active 
        ? 'bg-blue-600 text-white' 
        : 'text-gray-700 hover:bg-gray-100'}
    `}>
      <Icon className="w-5 h-5 mr-3" />
      {text}
    </div>
  </Link>
);

export default function AdminSidebar() {
  const currentPath = "/admin"; // Giả sử đang ở trang chủ Admin

  return (
    <aside className="w-64 h-screen bg-white p-4 flex flex-col shadow-lg">
      {/* Phần Logo và Tên */}
      <div className="flex items-center mb-6 p-2">
        {/* Thay bằng logo admin nếu có, tạm dùng logo cũ */}
        <Image src="/logo-bkhcm.png" alt="Logo" width={40} height={40} />
        <span className="text-xl font-bold ml-2">HCMUT Tutor</span>
      </div>

      {/* Phần điều hướng chính */}
      <nav className="grow">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">TỔNG QUAN</h3>
        <div className="space-y-2">
          <NavLink 
            href="/admin" 
            icon={HiOutlineHome} 
            text="Trang chủ"
            active={currentPath === "/admin"}
          />
          <NavLink 
            href="/admin/tutors" 
            icon={HiOutlineUserGroup} // Icon cho Tutor
            text="Tutor"
            active={false}
          />
          <NavLink 
            href="/admin/students" 
            icon={HiOutlineUsers} // Icon cho Sinh vien
            text="Sinh viên"
            active={false}
          />
        </div>

        <h3 className="text-xs font-semibold text-gray-500 uppercase mt-6 mb-2">TRUY CẬP GẦN ĐÂY</h3>
        <div className="space-y-2">
           {/* Link màu */}
           <div className="flex items-center p-3 text-sm font-medium">
             <span className="w-4 h-4 rounded-full bg-blue-500 mr-3"></span>
             Cấu trúc rời rạc
           </div>
           <div className="flex items-center p-3 text-sm font-medium">
             <span className="w-4 h-4 rounded-full bg-red-500 mr-3"></span>
             Mô hình hóa Toán...
           </div>
        </div>
      </nav>

      {/* Ảnh Merry Christmas */}
      <div className="mt-auto">
        <Image 
          src="/merry-christmas.png" 
          alt="Merry Christmas" 
          width={200} 
          height={100}
          className="mx-auto"
        />
      </div>
    </aside>
  );
}