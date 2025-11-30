// BẮT BUỘC phải có dòng này ở trên cùng
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HiOutlineSearch, 
  HiOutlineBell, 
  HiOutlineChatAlt, 
  HiOutlineChevronDown, 
  HiOutlineUser, 
  HiOutlineCog, 
  HiOutlineLogout 
} from 'react-icons/hi';

export default function Header({ role }: { role: 'student' | 'tutor' | 'admin' }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    // Header chính: Nền trong suốt, dùng z-50 để nổi lên trên cùng
    // Lưu ý: Để thấy hiệu ứng Glassmorphism đẹp, nền body/page phía sau nên có màu hoặc hình ảnh.
    <header className="flex items-center justify-end relative h-20 w-full px-8 z-50 bg-transparent">
      
      {/* === Ô TÌM KIẾM (GLASSMORPHISM & CENTERED) === */}
      {/* - absolute left-1/2 -translate-x-1/2: Căn giữa tuyệt đối màn hình 
         - backdrop-blur-md: Làm mờ hậu cảnh (hiệu ứng kính)
         - bg-white/30: Màu trắng độ trong suốt 30%
         - shadow-lg: Đổ bóng nhẹ tạo chiều sâu
      */}
      <div className="
        absolute left-1/2 transform -translate-x-1/2
        flex items-center w-[500px]
        bg-white/40 backdrop-blur-md 
        border border-white/50
        shadow-lg rounded-full px-4 py-2.5
        transition-all duration-300
        focus-within:bg-white/60 focus-within:shadow-xl focus-within:w-[520px]
      ">
        <HiOutlineSearch className="w-5 h-5 text-gray-600 ml-1" />
        <input 
          type="text"
          placeholder="Tìm kiếm khóa học, gia sư..."
          className="bg-transparent ml-3 outline-none text-gray-800 placeholder-gray-500 w-full"
        />
      </div>

      {/* === CÁC ICON & AVATAR (GIỮ NGUYÊN) === */}
      <div className="flex items-center space-x-4">
        {/* Chat Icon */}
        <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
          <HiOutlineChatAlt className="w-6 h-6 text-gray-700" />
        </button>
        
        {/* Bell Icon */}
        <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
          <HiOutlineBell className="w-6 h-6 text-gray-700" />
        </button>
        
        {/* Khu vực Avatar và Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 cursor-pointer p-1.5 pr-3 rounded-full hover:bg-white/50 transition-colors border border-transparent hover:border-white/40"
          >
            <Image 
              src="/avatar-placeholder.jpg" 
              alt="User Avatar"
              width={36} 
              height={36}
              className="rounded-full border border-gray-200"
            />
            <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-800 leading-tight">Chutine</span>
            </div>
            <HiOutlineChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          {/* === MENU THẢ XUỐNG === */}
          {isDropdownOpen && (
            <div 
              className="
                absolute top-full right-0 mt-3 w-56
                bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 z-50
                animate-in fade-in slide-in-from-top-2 duration-200
              "
            >
              <ul className="py-2">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tài khoản của tôi</p>
                </div>

                <Link href={`/${role}/profile`}>
                  <li className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors">
                    <HiOutlineUser className="w-5 h-5 mr-3" />
                    Hồ sơ cá nhân
                  </li>
                </Link>
                <Link href={`/${role}/settings`}>
                  <li className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors">
                    <HiOutlineCog className="w-5 h-5 mr-3" />
                    Cài đặt
                  </li>
                </Link>
                
                <div className="border-t border-gray-100 my-1"></div>

                <Link href="/"> 
                  <li className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors rounded-b-xl">
                    <HiOutlineLogout className="w-5 h-5 mr-3" />
                    Đăng xuất
                  </li>
                </Link>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}