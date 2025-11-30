"use client";

import { useState } from 'react';
import { 
  HiOutlineClock, 
  HiOutlineBookOpen, // Thay icon UserGroup bằng BookOpen
  HiOutlineAcademicCap,
  HiOutlineTrendingUp,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineLightningBolt, // Icon cho điểm số
  HiOutlineCalendar,
  HiOutlineUser
} from 'react-icons/hi';

// --- 1. MOCK DATA CHO STUDENT ---

const studentStats = [
  {
    label: 'Tổng giờ học',
    value: '312',
    unit: 'giờ',
    icon: HiOutlineClock,
    color: 'bg-blue-500',
    trend: '+15%',
    trendUp: true
  },
  {
    label: 'Tín chỉ tích lũy',
    value: '86',
    unit: 'tín chỉ',
    icon: HiOutlineBookOpen,
    color: 'bg-green-500',
    trend: '+4',
    trendUp: true
  },
  {
    label: 'Lớp đang học',
    value: '6',
    unit: 'lớp',
    icon: HiOutlineAcademicCap,
    color: 'bg-purple-500',
    trend: '0',
    trendUp: true // Giữ nguyên
  },
  {
    label: 'Điểm TB (GPA)',
    value: '8.2',
    unit: '/10',
    icon: HiOutlineLightningBolt,
    color: 'bg-yellow-500',
    trend: '+0.1',
    trendUp: true
  }
];

// Lớp học hôm nay của Sinh viên
const todayClasses = [
  {
    title: 'Cấu trúc rời rạc',
    tutor: 'Thầy Mai Đức Trung', // Thêm tên Tutor
    base: '2',
    room: 'H6 - 201',
    time: '07h00 - 09h00',
    students: 40, // Sĩ số lớp
    status: 'completed',
    attendance: 'Đã điểm danh' // Trạng thái điểm danh của SV
  },
  {
    title: 'Giải tích 2',
    tutor: 'Cô Nguyễn Thị B',
    base: '1',
    room: 'B4 - 301',
    time: '09h30 - 11h30',
    students: 60,
    status: 'completed',
    attendance: 'Vắng'
  },
  {
    title: 'Mạng máy tính',
    tutor: 'Thầy Phạm Văn C',
    base: '2',
    room: 'H6 - 402',
    time: '13h30 - 15h30',
    students: 45,
    status: 'ongoing',
    attendance: 'Chưa điểm danh'
  },
  {
    title: 'Hệ thống số',
    tutor: 'Thầy Lê Văn D',
    base: 'Online',
    room: 'Google Meet',
    time: '15h45 - 17h45',
    students: 50,
    status: 'upcoming',
    attendance: ''
  }
];

// Các lớp đã đăng ký (Enrolled Classes)
const enrolledClasses = [
  { name: 'Cấu trúc rời rạc', code: 'CO1007', tutor: 'Mai Đức Trung', schedule: 'T2: 7h-9h' },
  { name: 'Giải tích 2', code: 'MT1005', tutor: 'Nguyễn Thị B', schedule: 'T2: 9h30-11h30' },
  { name: 'Mạng máy tính', code: 'CO3093', tutor: 'Phạm Văn C', schedule: 'T3: 13h30-15h30' },
  { name: 'Hệ thống số', code: 'CO2031', tutor: 'Lê Văn D', schedule: 'T4: 15h45-17h45' },
  { name: 'Công nghệ phần mềm', code: 'CO3001', tutor: 'Trần Văn E', schedule: 'T5: 7h-9h' },
  { name: 'Lập trình Python', code: 'CO1011', tutor: 'Hoàng Thị F', schedule: 'T6: 13h30-15h30' },
];

// Biểu đồ phân bổ thời gian học
const learningChartData = [
  { subject: 'Toán học', hours: 40, color: '#3B82F6', percentage: 25 },
  { subject: 'Lập trình', hours: 55, color: '#10B981', percentage: 35 },
  { subject: 'Phần cứng', hours: 25, color: '#8B5CF6', percentage: 15 },
  { subject: 'Mạng MT', hours: 20, color: '#F59E0B', percentage: 12 },
  { subject: 'Khác', hours: 18, color: '#6B7280', percentage: 13 }
];

// --- 2. COMPONENTS CON (Tái sử dụng style) ---

const StatCard = ({ stat }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
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
            {stat.trend} so với kỳ trước
          </span>
        </div>
      </div>
      <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center`}>
        <stat.icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
);

// Biểu đồ tròn (Logic giữ nguyên, thay data)
const PieChart = () => {
  let currentAngle = 0;
  return (
    <div className="flex items-center justify-center gap-12">
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 200 200" className="transform -rotate-90">
          {learningChartData.map((item, index) => {
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
            const pathData = [`M 100 100`, `L ${x1} ${y1}`, `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(' ');
            
            return <path key={index} d={pathData} fill={item.color} className="hover:opacity-80 transition-opacity cursor-pointer" />;
          })}
          <circle cx="100" cy="100" r="50" fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-gray-900">158</p>
          <p className="text-sm text-gray-600">Giờ học</p>
        </div>
      </div>
      <div className="space-y-3">
        {learningChartData.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{item.subject}</p>
              <p className="text-xs text-gray-500">{item.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Thẻ lớp học (Update hiển thị Tutor thay vì Attendance count)
const StudentClassCard = ({ classData }: any) => {
  const statusConfig = {
    completed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Đã xong' },
    ongoing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Đang học' },
    upcoming: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Sắp tới' }
  };
  
  const config = statusConfig[classData.status as keyof typeof statusConfig];
  
  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-5 min-w-[280px] hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">{classData.title}</h3>
          <p className="text-sm text-gray-600">CS {classData.base} • {classData.room}</p>
        </div>
        <span className={`${config.text} text-[10px] font-bold px-2 py-1 rounded-full ${config.bg} border ${config.border} uppercase`}>
          {config.label}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-700">
          <HiOutlineClock className="w-4 h-4 mr-2 text-gray-500" />
          {classData.time}
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <HiOutlineUser className="w-4 h-4 mr-2 text-gray-500" />
          {classData.tutor}
        </div>
      </div>
      
      {/* Footer của Card khác với Tutor */}
      <div className="pt-3 border-t border-gray-200/50 flex justify-between items-center">
         <span className="text-xs text-gray-500">Trạng thái:</span>
         {classData.status === 'completed' ? (
            <span className={`text-xs font-bold ${classData.attendance === 'Vắng' ? 'text-red-500' : 'text-green-600'}`}>
               {classData.attendance}
            </span>
         ) : classData.status === 'ongoing' ? (
            <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-700 transition">Vào lớp</button>
         ) : (
            <span className="text-xs text-orange-500 italic">Chưa bắt đầu</span>
         )}
      </div>
    </div>
  );
};

// --- 3. PAGE COMPONENT CHÍNH ---

export default function StudentDashboardPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerPage = 3; // Số lượng thẻ hiển thị 1 lúc
  const totalSlides = Math.ceil(todayClasses.length / itemsPerPage);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  // Cắt mảng data để hiển thị slider
  const visibleClasses = todayClasses.slice(currentSlide * itemsPerPage, (currentSlide + 1) * itemsPerPage);

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
                  Giáng sinh này
                </h1>
              </div>

              <div className="flex justify-end mt-6 md:mt-1 mr-15">
                <h2 
                  className="text-5xl md:text-7xl tracking-wide"
                  style={{
                    fontFamily: 'Jaro, sans-serif',
                    color: '#4ADE80', 
                    textShadow: '2px 2px 0px #003300'
                  }}
                >
                  bạn có ai học cùng chưa?
                </h2>
              </div>
            </div>

            {/* KHU VỰC INFO NGƯỜI DÙNG (Giữ lại logic cũ của bạn nhưng đẩy xuống dưới) */}
            <div className="flex items-end justify-between border-t border-white/20 pt-4 mt-2">
                <p className="text-white/95 text-base drop-shadow">
                  Hôm nay bạn có <span className="font-bold text-yellow-300">{todayClasses.filter(c => c.status !== 'completed').length} lớp học</span>. Cố gắng đạt điểm A+ nhé!
                </p>
            </div>

          </div>
        </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentStats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột bên trái (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Biểu đồ tròn: Thời gian học tập */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Thời gian tự học</h2>
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Lịch học hôm nay</h2>
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
                <span className="text-sm text-gray-600 px-2">{currentSlide + 1} / {totalSlides}</span>
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
                    <StudentClassCard classData={classData} />
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
                  className={`h-2 rounded-full transition-all ${currentSlide === index ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Cột bên phải (1/3) - Danh sách lớp đã đăng ký */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Lớp đã đăng ký</h2>
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {enrolledClasses.length} lớp
            </span>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {enrolledClasses.map((cls, index) => (
              <div 
                key={index}
                className="border border-gray-200 p-4 rounded-lg bg-linear-to-r from-gray-50 to-white hover:from-green-50 hover:to-white hover:border-green-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{cls.code}</p>
                  </div>
                  <HiOutlineChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition" />
                </div>
                
                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center">
                    <HiOutlineCalendar className="w-4 h-4 mr-2 text-gray-400" />
                    {cls.schedule}
                  </div>
                  <div className="flex items-center">
                    <HiOutlineUser className="w-4 h-4 mr-2 text-gray-400" />
                    GV: {cls.tutor}
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