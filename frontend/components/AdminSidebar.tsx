'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HiLogout } from 'react-icons/hi'; 

const Sidebar = () => {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại (VD: /admin/students)
  const router = useRouter();

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: '🏠' },
    { label: 'Tutor', href: '/admin/tutors', icon: '👨‍🏫' },
    { label: 'Sinh viên', href: '/admin/students', icon: '🎓' },
    { label: 'Phân tích báo cáo', href: '/admin/reports', icon: '📊' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="w-64 h-screen bg-white fixed left-0 top-0 shadow-lg flex flex-col z-50 border-r border-gray-200">
      {/* Logo Header */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-blue-200">
          H
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800 leading-tight">HCMUT Tutor</h1>
          <span className="text-xs text-gray-500 font-medium">Admin Portal</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="px-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
            Menu Chính
          </h3>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              // --- LOGIC KIỂM TRA ACTIVE ---
              // 1. Nếu là Dashboard (/admin): Phải trùng khớp hoàn toàn (pathname === '/admin')
              // 2. Nếu là các trang con (/admin/students...): Chỉ cần bắt đầu bằng href đó
              const isActive = item.href === '/admin' 
                ? pathname === '/admin'
                : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200' // Style khi được chọn
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700' // Style bình thường
                  }`}
                >
                  <span className={`text-xl ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <HiLogout className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;