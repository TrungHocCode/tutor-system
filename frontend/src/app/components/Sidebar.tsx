'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Trang chủ', href: '/', icon: '🏠' },
    { label: 'Tutor', href: '/tutors', icon: '👨‍🏫' },
    { label: 'Sinh viên', href: '/students', icon: '🎓' },
    { label: 'Phân tích báo cáo', href: '/reports', icon: '📊' },
  ];

  const structureItems = [
    { label: 'Cấu trúc rõi rạc', color: 'bg-purple-600' },
    { label: 'Mô hình hóa Toán học', color: 'bg-red-600' },
  ];

  return (
    <div className="w-52 h-screen bg-white fixed left-0 top-0 shadow-lg flex flex-col">
      {/* Logo Header */}
      <div className="p-4 flex items-center gap-3 border-b">
        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
          <div className="w-full h-full bg-linear-to-br from-gray-400 to-gray-600" />
        </div>
        <h1 className="text-base font-bold text-blue-900">HCMUT Tutor</h1>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Tổng quan
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>


      </div>

      {/* Christmas Decoration */}
      <div className="p-4 flex justify-center">
        <div className="text-4xl">🎄</div>
      </div>
    </div>
  );
};

export default Sidebar;