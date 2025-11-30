"use client";

import { useState } from 'react'; // Import useState
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HiOutlineHome, 
  HiOutlineCalendar, 
  HiOutlineBookOpen, 
  HiOutlineUserGroup, 
  HiOutlineTrendingUp,
  HiOutlineX 
} from 'react-icons/hi';
import { FaChalkboardTeacher } from 'react-icons/fa';

// Component NavLink
const NavLink = ({ href, icon: Icon, text, active }: any) => {
  return (
    <Link href={href} className="block w-full">
      <div className={`
        relative flex items-center px-4 py-3 mx-2 rounded-xl text-sm transition-all duration-300 ease-in-out
        group
        ${active 
          ? 'bg-linear-to-r from-blue-600 to-blue-400 text-white font-bold shadow-lg shadow-blue-500/30 translate-x-1' 
          : 'text-gray-700 font-medium hover:bg-gray-100 hover:shadow-md hover:-translate-y-0.5 hover:text-blue-600'
        }
      `}>
        {/* Icon */}
        <Icon className={`
          w-5 h-5 mr-3 transition-colors duration-300
          ${active ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}
        `} />
        
        {/* Text */}
        <span className="tracking-wide">{text}</span>

        {/* Decor: Chấm tròn trắng nhỏ bên phải khi active */}
        {active && (
          <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full opacity-70 shadow-sm" />
        )}
      </div>
    </Link>
  );
};

export default function TutorSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  return (
    <>
      <aside className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col pt-6 pb-4 shadow-xl z-40 sticky top-0">
        
        {/* Logo Area */}
        <div className="flex items-center px-8 mb-10">
          <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <FaChalkboardTeacher className="w-6 h-6 text-blue-600" />
          </div>
          <div>
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight" style={{fontFamily: 'Jaro'}}>HCMUT <span className="text-blue-600">Tutor</span></h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="grow space-y-8 px-2 overflow-y-auto custom-scrollbar">
          {/* Nhóm: TỔNG QUAN */}
          <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 px-6 tracking-wider">Tổng quan</h3>
              <div className="space-y-2" > 
                  <NavLink 
                      href="/tutor" 
                      icon={HiOutlineHome} 
                      text="Trang chủ"
                      active={isActive("/tutor")} 
                  />
                  <NavLink 
                      href="/tutor/schedule" 
                      icon={HiOutlineCalendar} 
                      text="Lịch dạy của tôi"
                      active={isActive("/tutor/schedule")}
                  />
                  <NavLink 
                      href="/tutor/library" 
                      icon={HiOutlineBookOpen} 
                      text="Thư viện tài liệu"
                      active={isActive("/tutor/library")}
                  />
                  
              </div>
          </div>

          {/* Nhóm: QUẢN LÝ */}
          <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 px-6 tracking-wider">Quản lý lớp học</h3>
              <div className="space-y-2">
                  <NavLink 
                      href="/tutor/community" 
                      icon={HiOutlineUserGroup} 
                      text="Cộng đồng Tutor"
                      active={pathname.includes("/tutor/community")}
                  />
                  <NavLink 
                      href="/tutor/support_in4" 
                      icon={HiOutlineUserGroup} 
                      text="Thông tin hỗ trợ"
                      active={isActive("/tutor/support_in4")}
                  />
                  <NavLink 
                      href="/tutor/progress" 
                      icon={HiOutlineTrendingUp} 
                      text="Theo dõi tiến bộ"
                      active={isActive("/tutor/progress")}
                  />
              </div>
          </div>
        </nav>

        <div 
          className="mt-4 px-6 relative group cursor-pointer"
          onClick={() => setShowEasterEgg(true)}
        >
          <Image 
            src="/merry-christmas.png" 
            alt="Merry Christmas" 
            width={160} 
            height={80} 
            className="mx-auto opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300" 
          />
        </div>
      </aside>

      {showEasterEgg && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setShowEasterEgg(false)} 
        >
          <div 
            className="relative bg-white/10 p-2 rounded-2xl shadow-2xl animate-bounce-in max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Nút tắt */}
            <button 
              onClick={() => setShowEasterEgg(false)}
              className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors z-10"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>

            <div className="relative rounded-xl overflow-hidden border-4 border-white/20">
               <Image 
                 src="/IMG_1751.JPG" 
                 alt="Giang sinh vui ve thang l <3" 
                 width={800} 
                 height={800}
                 className="object-contain w-auto h-auto max-h-[80vh]"
                 priority
               />
            </div>
          </div>
        </div>
      )}
    </>
  );
}