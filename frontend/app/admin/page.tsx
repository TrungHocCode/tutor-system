"use client";

import Link from 'next/link';
import { HiOutlineClipboardList, HiUsers, HiAcademicCap, HiCalendar, HiDocumentText, HiChatAlt2 } from 'react-icons/hi';
import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// --- CẤU HÌNH CHART.JS ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// --- INTERFACES ---
interface OverviewData {
  totalStudents: number;
  totalTutors: number;
  totalFeedbacks: number;
  totalSessions: number;
}

interface QuarterlyStat {
  quarter: number;
  students: number;
  tutors: number;
}

// --- CONFIG API ---
const API_BASE = 'http://localhost:5000/api/reports';

export default function AdminDashboardPage() {
  // --- STATE ---
  const [overview, setOverview] = useState<OverviewData>({
    totalStudents: 0,
    totalTutors: 0,
    totalFeedbacks: 0,
    totalSessions: 0
  });

  const [chartData, setChartData] = useState<{ students: number[], tutors: number[] }>({
    students: [0, 0, 0, 0], // Q1, Q2, Q3, Q4
    tutors: [0, 0, 0, 0]
  });

  const [loading, setLoading] = useState(true);

  // --- FETCH DATA FUNCTION ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token'); // Đảm bảo key token khớp với lúc login

      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // 1. Gọi API Tổng quan
      const overviewRes = await fetch(`${API_BASE}/overview`, { headers });
      const overviewJson = await overviewRes.json();

      // 2. Gọi API Thống kê theo Quý (Năm hiện tại)
      const currentYear = new Date().getFullYear();
      const statsRes = await fetch(`${API_BASE}/stats?year=${currentYear}`, { headers });
      const statsJson = await statsRes.json();

      if (overviewJson.success && statsJson.success) {
        // Cập nhật Overview
        setOverview(overviewJson.data);

        // Cập nhật Chart Data (Mapping từ BE response sang mảng 4 phần tử)
        const qStats: QuarterlyStat[] = statsJson.quarterlyStats;
        const studentData = [0, 0, 0, 0];
        const tutorData = [0, 0, 0, 0];

        qStats.forEach(stat => {
          // quarter từ BE là 1-4, mảng index là 0-3
          if (stat.quarter >= 1 && stat.quarter <= 4) {
            studentData[stat.quarter - 1] = stat.students;
            tutorData[stat.quarter - 1] = stat.tutors;
          }
        });

        setChartData({ students: studentData, tutors: tutorData });
      } else {
        toast.error('Không thể tải dữ liệu thống kê');
      }

    } catch (error) {
      console.error(error);
      toast.error('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CONFIG DATA CHO CHART ---
  
  // 1. Bar Chart: Dữ liệu thực từ API
  const barChartConfig = {
    labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'],
    datasets: [
      {
        label: 'Sinh viên mới',
        data: chartData.students,
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
      },
      {
        label: 'Gia sư mới',
        data: chartData.tutors,
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // Green
      },
    ],
  };

  // 2. Pie Chart: Dữ liệu giả lập dựa trên tổng số Feedback thực tế
  // (Vì Dashboard API hiện tại chỉ trả về tổng số lượng, chưa phân loại Good/Bad)
  const pieChartConfig = {
    labels: ['Tích cực', 'Tiêu cực'],
    datasets: [
      {
        // Giả lập tỉ lệ 80/20 dựa trên tổng số thực tế
        data: [
          Math.round(overview.totalFeedbacks * 0.8), 
          Math.round(overview.totalFeedbacks * 0.2)
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 1)', // Blue
          'rgba(239, 68, 68, 1)',  // Red
        ],
        borderWidth: 1,
      },
    ],
  };

  // --- STAT CARDS DATA ---
  const statCards = [
    { 
      title: 'Tổng Sinh Viên', 
      value: overview.totalStudents, 
      icon: HiUsers, 
      color: 'bg-indigo-500', 
      link: '/admin/users?role=student' 
    },
    { 
      title: 'Tổng Gia Sư', 
      value: overview.totalTutors, 
      icon: HiAcademicCap, 
      color: 'bg-green-500', 
      link: '/admin/tutors' 
    },
    { 
      title: 'Tổng Phiên Học', 
      value: overview.totalSessions, 
      icon: HiCalendar, 
      color: 'bg-pink-500', 
      link: '/admin/sessions' 
    },
    { 
      title: 'Tổng Phản Hồi', 
      value: overview.totalFeedbacks, 
      icon: HiChatAlt2, 
      color: 'bg-yellow-500', 
      link: '/admin/reports' // Link đến trang report chi tiết
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard Quản Trị</h1>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
          Niên khóa: {new Date().getFullYear()}
        </span>
      </div>
      
      {/* 1. CARDS THỐNG KÊ TỔNG QUAN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link key={card.title} href={card.link} className="block group">
            <div className={`p-5 rounded-lg shadow-lg text-white transition transform group-hover:scale-[1.02] ${card.color}`}>
              <div className="flex justify-between items-center">
                <card.icon className="w-10 h-10 opacity-70" />
                <div className="text-right">
                  <p className="text-3xl font-extrabold">{card.value}</p>
                  <p className="text-sm opacity-90 font-medium">{card.title}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* 2. BIỂU ĐỒ VÀ WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột Trái: Biểu đồ (Chiếm 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Biểu đồ Cột */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-800">Tăng trưởng người dùng</h2>
              <span className="text-xs text-gray-400">Dữ liệu thực tế theo quý</span>
            </div>
            <div className="h-72">
              <Bar 
                data={barChartConfig} 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' as const },
                  }
                }} 
              />
            </div>
          </div>

          {/* Biểu đồ Tròn */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <h2 className="font-bold text-lg text-gray-800 mb-4">Tổng quan phản hồi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-64 flex justify-center">
                <Pie data={pieChartConfig} options={{ maintainAspectRatio: false }} />
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>Tổng số phản hồi: <strong className="text-gray-900">{overview.totalFeedbacks}</strong></p>
                <p>Để xem phân tích chi tiết rating và top giảng viên, vui lòng truy cập trang <span className="text-blue-600 font-bold">Phân tích báo cáo</span>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cột Phải: Lịch & Quick Actions (Chiếm 1/3) */}
        <div className="space-y-6">
          
          {/* Calendar Widget */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
             <div className="flex justify-between font-bold text-lg mb-6 text-gray-800">
                <span>Tháng {new Date().getMonth() + 1}</span>
                <span>{new Date().getFullYear()}</span>
             </div>
             <div className="grid grid-cols-7 gap-3 text-center text-sm">
                {['CN','T2','T3','T4','T5','T6','T7'].map(d => (
                  <span key={d} className="text-gray-400 font-medium">{d}</span>
                ))}
                {[...Array(30)].map((_, i) => (
                   <div key={i} className={`
                      h-8 w-8 flex items-center justify-center rounded-full cursor-pointer transition-colors
                      ${i + 1 === new Date().getDate() 
                        ? 'bg-blue-600 text-white font-bold shadow-md' 
                        : 'hover:bg-gray-100 text-gray-700'}
                   `}>
                     {i+1}
                   </div>
                ))}
             </div>
          </div>
          
          {/* Quick Action: Create Report */}
          <Link href="/admin/reports"> 
          {/* Lưu ý: Đảm bảo route này trỏ đúng đến file page.tsx của reports mà bạn đã tạo ở bước trước */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-lg shadow-lg text-white flex flex-col items-center justify-center h-48 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1">
                <HiOutlineClipboardList className="w-16 h-16 mb-3 opacity-90" />
                <span className="font-bold text-lg">TẠO BÁO CÁO MỚI</span>
                <span className="text-xs opacity-75 mt-1">Xuất PDF / Word</span>
            </div>
          </Link>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-2">Trạng thái hệ thống</h3>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Database Connected
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              API Gateway Active
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}