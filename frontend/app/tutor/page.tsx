"use client";

import { useState } from 'react';
import ClassCard from '@/components/ClassCard';
import { 
  HiOutlineClock, 
  HiOutlineUserGroup, 
  HiOutlineAcademicCap,
  HiOutlineTrendingUp,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineStar,
  HiOutlineCalendar
} from 'react-icons/hi';

const stats = [
  {
    label: 'Tổng giờ dạy',
    value: '248',
    unit: 'giờ',
    icon: HiOutlineClock,
    color: 'bg-blue-500',
    trend: '+12%',
    trendUp: true
  },
  {
    label: 'Học viên',
    value: '156',
    unit: 'sinh viên',
    icon: HiOutlineUserGroup,
    color: 'bg-green-500',
    trend: '+8%',
    trendUp: true
  },
  {
    label: 'Lớp đang dạy',
    value: '8',
    unit: 'lớp',
    icon: HiOutlineAcademicCap,
    color: 'bg-purple-500',
    trend: '+2',
    trendUp: true
  },
  {
    label: 'Đánh giá TB',
    value: '4.8',
    unit: '/5.0',
    icon: HiOutlineStar,
    color: 'bg-yellow-500',
    trend: '+0.2',
    trendUp: true
  }
];

// Mock data cho các lớp hôm nay
const todayClasses = [
  {
    title: 'Công nghệ phần mềm',
    base: '2',
    room: 'H6 - 201',
    time: '07h00 - 09h00',
    students: 45,
    status: 'completed',
    attendance: 42
  },
  {
    title: 'Cấu trúc dữ liệu',
    base: '1',
    room: 'H3 - 105',
    time: '09h30 - 11h30',
    students: 38,
    status: 'completed',
    attendance: 35
  },
  {
    title: 'Lập trình hướng đối tượng',
    base: '2',
    room: 'H6 - 303',
    time: '13h30 - 15h30',
    students: 50,
    status: 'ongoing',
    attendance: 48
  },
  {
    title: 'Cơ sở dữ liệu',
    base: '1',
    room: 'H2 - 204',
    time: '15h45 - 17h45',
    students: 42,
    status: 'upcoming',
    attendance: 0
  },
  {
    title: 'Mạng máy tính',
    base: '2',
    room: 'H6 - 401',
    time: '18h00 - 20h00',
    students: 35,
    status: 'upcoming',
    attendance: 0
  }
];

const teachingClasses = [
  { name: 'Công nghệ phần mềm', code: 'CO3001', room: 'H6 - 201', students: 45, schedule: 'T2, T5: 7h-9h' },
  { name: 'Cấu trúc dữ liệu', code: 'CO2003', room: 'H3 - 105', students: 38, schedule: 'T3, T6: 9h30-11h30' },
  { name: 'Lập trình OOP', code: 'CO2007', room: 'H6 - 303', students: 50, schedule: 'T4: 13h30-15h30' },
  { name: 'Cơ sở dữ liệu', code: 'CO2013', room: 'H2 - 204', students: 42, schedule: 'T5: 15h45-17h45' },
  { name: 'Mạng máy tính', code: 'CO3093', room: 'H6 - 401', students: 35, schedule: 'T6: 18h-20h' },
  { name: 'Hệ điều hành', code: 'CO2017', room: 'H3 - 302', students: 40, schedule: 'T7: 7h-9h' },
  { name: 'Trí tuệ nhân tạo', code: 'CO3061', room: 'H6 - 205', students: 30, schedule: 'T2: 13h30-15h30' },
  { name: 'An toàn thông tin', code: 'CO3015', room: 'H2 - 101', students: 28, schedule: 'T3: 15h45-17h45' }
];

// Mock data cho biểu đồ tròn (phân bổ giờ dạy theo môn)
const chartData = [
  { subject: 'Công nghệ PM', hours: 48, color: '#3B82F6', percentage: 19 },
  { subject: 'Cấu trúc DL', hours: 42, color: '#10B981', percentage: 17 },
  { subject: 'Lập trình OOP', hours: 38, color: '#8B5CF6', percentage: 15 },
  { subject: 'CSDL', hours: 35, color: '#F59E0B', percentage: 14 },
  { subject: 'Mạng MT', hours: 32, color: '#EF4444', percentage: 13 },
  { subject: 'Khác', hours: 53, color: '#6B7280', percentage: 22 }
];

const StatCard = ({ stat }: any) => (
  <div className="bg-[#F4F7F5] p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 font-medium mb-1">{stat.label}</p>
        <div className="flex items-baseline space-x-2">
          <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
          <span className="text-sm text-gray-500">{stat.unit}</span>
        </div>
        <div className="flex items-center mt-2">
          <HiOutlineTrendingUp className={`w-4 h-4 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-xs font-medium ml-1 ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {stat.trend} so với tháng trước
          </span>
        </div>
      </div>
      <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center`}>
        <stat.icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
);

// Component biểu đồ tròn đơn giản
const PieChart = () => {
  let currentAngle = 0;
  
  return (
    <div className="flex items-center justify-center gap-12">
      {/* Biểu đồ tròn */}
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 200 200" className="transform -rotate-90">
          {chartData.map((item, index) => {
            const startAngle = currentAngle;
            const angle = (item.percentage / 100) * 360;
            currentAngle += angle;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = ((startAngle + angle) * Math.PI) / 180;
            
            const x1 = 100 + 80 * Math.cos(startRad);
            const y1 = 100 + 80 * Math.sin(startRad);
            const x2 = 100 + 80 * Math.cos(endRad);
            const y2 = 100 + 80 * Math.sin(endRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            );
          })}
          {/* Vòng tròn trắng ở giữa */}
          <circle cx="100" cy="100" r="50" fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-gray-900">248</p>
          <p className="text-sm text-gray-600">Tổng giờ</p>
        </div>
      </div>
      
      {/* Chú thích */}
      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{item.subject}</p>
              <p className="text-xs text-gray-500">{item.hours} giờ ({item.percentage}%)</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component thẻ lớp học nâng cao
const EnhancedClassCard = ({ classData }: any) => {
  const statusConfig = {
    completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Đã hoàn thành' },
    ongoing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Đang diễn ra' },
    upcoming: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Sắp diễn ra' }
  };
  
  const config = statusConfig[classData.status as keyof typeof statusConfig];
  
  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-5 min-w-[280px] hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{classData.title}</h3>
          <p className="text-sm text-gray-600">Cơ sở {classData.base} • {classData.room}</p>
        </div>
        <span className={`${config.text} text-xs font-semibold px-3 py-1 rounded-full ${config.bg} border ${config.border}`}>
          {config.label}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-700">
          <HiOutlineClock className="w-4 h-4 mr-2 text-gray-500" />
          {classData.time}
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <HiOutlineUserGroup className="w-4 h-4 mr-2 text-gray-500" />
          {classData.students} sinh viên
        </div>
      </div>
      
      {classData.status === 'completed' && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Điểm danh: <span className="font-semibold text-green-600">{classData.attendance}/{classData.students}</span>
          </p>
        </div>
      )}
      
      {classData.status === 'ongoing' && (
        <div className="pt-3 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-blue-700">Đang diễn ra...</p>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              Xem chi tiết →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TutorDashboardPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerPage = 3;
  const totalSlides = Math.ceil(todayClasses.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const visibleClasses = todayClasses.slice(
    currentSlide * itemsPerPage,
    (currentSlide + 1) * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-8">
        <div 
          className="rounded-2xl shadow-sm relative overflow-hidden bg-cover bg-center group"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=80)',
            minHeight: '200px' 
          }}
        >
          <div className="absolute inset-0 bg-[#002815]/90"></div>
          
          <div className="absolute top-0 w-full h-full opacity-20 pointer-events-none" 
               style={{backgroundImage: 'radial-gradient(circle, #fcd34d 1px, transparent 1px)', backgroundSize: '30px 30px'}}>
          </div>

          <div className="relative z-10 p-6 flex flex-col justify-between h-full">
            
            <div className="w-full mb-4">
              <div className="flex justify-start">
                 <h1 
                  className="text-7xl md:text-8xl leading-none"
                  style={{
                    fontFamily: 'Italianno, cursive',
                    color: '#D32F2F', 
                    WebkitTextStroke: '1px white', 
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    transform: 'rotate(-0deg)',
                    fontStyle: 'italic' 
                  }}
                >
                  Giáng sinh an lành
                </h1>
              </div>

              {/* Dòng 2: Dạy học thật nhanh - Góc dưới bên phải (so với container chữ) */}
              <div className="flex justify-end mt-6 md:mt-1 mr-15">
                <h2 
                  className="text-5xl md:text-7xl tracking-wide"
                  style={{
                    fontFamily: 'Jaro, sans-serif',
                    color: '#4ADE80', 
                    textShadow: '2px 2px 0px #003300'
                  }}
                >
                  dạy học thật nhanh
                </h2>
              </div>
            </div>

            {/* KHU VỰC INFO NGƯỜI DÙNG (Giữ lại logic cũ của bạn nhưng đẩy xuống dưới) */}
            <div className="flex items-end justify-between border-t border-white/20 pt-4 mt-2">
              <p className="text-white/90 text-sm md:text-base font-light drop-shadow">
                Chào buổi chiều, <span className="font-bold text-yellow-300">Lương Ngọc Trung</span>. 
                Bạn có <span className="font-bold bg-white/20 px-2 py-0.5 rounded text-white">{todayClasses.filter(c => c.status !== 'completed').length}</span> lớp cần hỗ trợ.
              </p>
            </div>

          </div>
        </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột bên trái (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biểu đồ tròn */}
          <div className="bg-[#F4F7F5] p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Phân bổ giờ dạy theo môn</h2>
                <p className="text-sm text-gray-600 mt-1">Tháng 12/2024</p>
              </div>
              <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                <HiOutlineCalendar className="w-4 h-4 mr-1" />
                Xem chi tiết
              </button>
            </div>
            <PieChart />
          </div>
          
          {/* Các lớp hôm nay (Slider) */}
          <div className="bg-[#F4F7F5] p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Lịch dạy hôm nay</h2>
                <p className="text-sm text-gray-600 mt-1">Thứ Sáu, 28/11/2025</p>
              </div>
              
              {/* Nút điều hướng slider */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={prevSlide}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
                  disabled={currentSlide === 0}
                >
                  <HiOutlineChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm text-gray-600 px-2">
                  {currentSlide + 1} / {totalSlides}
                </span>
                <button 
                  onClick={nextSlide}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
                  disabled={currentSlide === totalSlides - 1}
                >
                  <HiOutlineChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Slider container */}
            <div className="overflow-hidden">
              <div 
                className="flex gap-4 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {todayClasses.map((classData, index) => (
                  <div key={index} className="shrink-0" style={{ width: `calc(33.333% - 11px)` }}>
                    <EnhancedClassCard classData={classData} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Chỉ số slider */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Cột bên phải (1/3) */}
        <div className="bg-[#F4F7F5] p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Lớp đang dạy</h2>
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {teachingClasses.length} lớp
            </span>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {teachingClasses.map((cls, index) => (
              <div 
                key={index}
                className="border border-gray-200 p-4 rounded-lg bg-linear-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{cls.code}</p>
                  </div>
                  <HiOutlineChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" />
                </div>
                
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center">
                    <HiOutlineCalendar className="w-4 h-4 mr-2 text-gray-400" />
                    {cls.schedule}
                  </div>
                  <div className="flex items-center">
                    <HiOutlineUserGroup className="w-4 h-4 mr-2 text-gray-400" />
                    {cls.students} sinh viên • {cls.room}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}