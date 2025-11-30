"use client";

import Link from 'next/link';
import { HiOutlineClipboardList, HiUsers, HiAcademicCap, HiCalendar, HiDocumentText } from 'react-icons/hi'; // Thêm icons
import { useState, useEffect, useCallback } from 'react';

// --- CẤU HÌNH CHART.JS (BẮT BUỘC) ---
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
// -------------------------------------

// --- DỮ LIỆU TÍNH TOÁN BAN ĐẦU ---
const INITIAL_STATS = {
    totalUsers: 0,
    totalTutors: 0,
    totalStudents: 0,
    totalSessions: 0,
    totalMaterials: 0,
    // Dữ liệu cho biểu đồ (giả định)
    barChartData: { students: [0, 0, 0, 0], tutors: [0, 0, 0, 0] },
    pieChartData: { good: 0, bad: 0 }
};

// --- CUSTOM HOOK ĐỂ GỌI API VÀ TÍNH TOÁN STATS ---
const API_BASE = 'http://localhost:5000/api/admin'; // Base API cho Admin

/**
 * Hàm fetcher có kèm Authorization Header (CẦN TÙY CHỈNH)
 * @param url API endpoint
 */
const fetcher = async (url: string) => {
    // *** CẦN THAY THẾ logic này bằng cách lấy token xác thực (JWT) thực tế của Admin ***
    // Ví dụ: Lấy từ localStorage, Context, hoặc Redux
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null; 
    
    if (!token) {
        throw new Error('Authentication token not found. Please log in.');
    }

    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Thêm token vào header
        },
    });
    
    // Xử lý lỗi 401/403 (Unauthorized/Forbidden) do middleware auth/authorize
    if (res.status === 401 || res.status === 403) {
         throw new Error('Unauthorized access. Role permissions missing or token expired.');
    }
    
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}. Status: ${res.status}`);
    }
    return res.json();
};

function useAdminStats() {
    const [stats, setStats] = useState(INITIAL_STATS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Gọi các API danh sách đã tạo
            const usersPromise = fetcher(`${API_BASE}/users`); // GET /api/admin/users
            const sessionsPromise = fetcher(`${API_BASE}/sessions`); // GET /api/admin/sessions
            const materialsPromise = fetcher(`${API_BASE}/materials`); // GET /api/admin/materials
            
            // Chạy song song để tối ưu tốc độ
            const [users, sessions, materials] = await Promise.all([
                usersPromise, 
                sessionsPromise, 
                materialsPromise
            ]);

            // --- TÍNH TOÁN SỐ LIỆU TỔNG HỢP ---
            
            const totalUsers = users.length;
            const totalTutors = users.filter((u: any) => u.Role === 'tutor').length;
            const totalStudents = users.filter((u: any) => u.Role === 'student').length;
            const totalSessions = sessions.length;
            const totalMaterials = materials.length;

            // Tính toán Pie Chart (Giả định 70% sessions đã hoàn thành/Tốt để minh họa)
            // Trong thực tế, bạn sẽ lấy dữ liệu từ bảng feedback hoặc status của session
            const goodSessions = Math.round(totalSessions * 0.7);
            const badSessions = totalSessions - goodSessions;

            // Cập nhật state
            setStats({
                totalUsers,
                totalTutors,
                totalStudents,
                totalSessions,
                totalMaterials,
                // Giữ nguyên Bar Data Mock vì thiếu API phân tích theo Quý (BE chỉ có getAll)
                barChartData: { students: [200, 250, 300, 350], tutors: [50, 60, 70, 80] }, 
                pieChartData: { good: goodSessions, bad: badSessions }
            });

        } catch (err: any) {
            console.error(err);
            setError(`Lỗi tải dữ liệu: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { stats, loading, error };
}

// --- COMPONENT CHÍNH ---
export default function AdminDashboardPage() {
    const { stats, loading, error } = useAdminStats();

    // Dữ liệu cho biểu đồ Cột (Sử dụng stats.barChartData)
    const barData = {
        labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'],
        datasets: [
            {
                label: 'Sinh viên',
                data: stats.barChartData.students,
                backgroundColor: 'rgba(74, 222, 128, 1)',
            },
            {
                label: 'Tutor',
                data: stats.barChartData.tutors,
                backgroundColor: 'rgba(239, 68, 68, 1)',
            },
        ],
    };

    // Dữ liệu cho biểu đồ Tròn (Sử dụng stats.pieChartData)
    const pieData = {
        labels: ['Tốt', 'Không tốt'],
        datasets: [
            {
                data: [stats.pieChartData.good, stats.pieChartData.bad],
                backgroundColor: [
                    'rgba(37, 99, 235, 1)',
                    'rgba(220, 38, 38, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };
    
    // --- Hiển thị Loading/Error ---
    if (loading) {
        return <div className="p-6 text-center text-xl text-blue-600">Đang tải dữ liệu...</div>;
    }
    
    if (error) {
        return (
            <div className="p-6 text-center text-xl text-red-600">
                Lỗi kết nối hoặc xác thực: **{error}**. Vui lòng kiểm tra console và đăng nhập lại.
            </div>
        );
    }

    // --- Card Thống kê Tổng quan ---
    const statCards = [
        { 
            title: 'Tổng Người Dùng', 
            value: stats.totalUsers, 
            icon: HiUsers, 
            color: 'bg-indigo-500', 
            link: '/admin/users' 
        },
        { 
            title: 'Tổng Gia Sư', 
            value: stats.totalTutors, 
            icon: HiAcademicCap, 
            color: 'bg-green-500', 
            link: '/admin/tutors' 
        },
        { 
            title: 'Tổng Phiên Học', 
            value: stats.totalSessions, 
            icon: HiCalendar, 
            color: 'bg-pink-500', 
            link: '/admin/sessions' 
        },
        { 
            title: 'Tổng Tài Liệu', 
            value: stats.totalMaterials, 
            icon: HiDocumentText, 
            color: 'bg-yellow-500', 
            link: '/admin/materials' 
        },
    ];


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard Quản Trị</h1>
            
            {/* Hàng Card Thống kê Tổng quan */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statCards.map((card) => (
                    <Link key={card.title} href={card.link} className="block">
                        <div className={`p-5 rounded-lg shadow-xl text-white transition transform hover:scale-[1.02] ${card.color}`}>
                            <div className="flex justify-between items-center">
                                <card.icon className="w-10 h-10 opacity-70" />
                                <div className="text-right">
                                    <p className="text-3xl font-extrabold">{card.value}</p>
                                    <p className="text-sm opacity-90">{card.title}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            
            {/* Hàng Biểu đồ và Lịch */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cột trái: BIỂU ĐỒ */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Biểu đồ cột */}
                    <div className="bg-white/90 p-6 rounded-lg shadow-lg">
                        <h2 className="font-bold mb-4 text-blue-900">Thống kê số lượng (Giả định theo Quý)</h2>
                        <p className="text-sm text-gray-500 mb-4">
                           *Dữ liệu thống kê theo quý là giả định do BE chỉ hỗ trợ lấy danh sách tổng.
                        </p>
                        <div className="h-64">
                            <Bar data={barData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>

                    {/* Biểu đồ tròn */}
                    <div className="bg-white/90 p-6 rounded-lg shadow-lg">
                        <h2 className="font-bold mb-4 text-blue-900">Thống kê Phản hồi</h2>
                        <p className="text-sm text-gray-500 mb-4">
                           Dựa trên tổng **{stats.totalSessions}** Sessions. (Tỷ lệ phân bổ phản hồi là giả định)
                        </p>
                        <div className="h-64 flex justify-center">
                            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>

                {/* Cột phải: LỊCH & ACTION */}
                <div className="space-y-6">
                    {/* Calendar Tĩnh */}
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                         <div className="flex justify-between font-bold text-lg mb-4">
                            <span>January</span><span>2025</span>
                         </div>
                         <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-600">
                            {['S','M','T','W','T','F','S'].map(d => <span key={d}>{d}</span>)}
                            {[...Array(31)].map((_, i) => (
                               <div key={i} className={`p-2 rounded hover:bg-gray-100 cursor-pointer ${i===24 ? 'bg-blue-600 text-white':''}`}>
                                 {i+1}
                               </div>
                            ))}
                         </div>
                    </div>
                    
                    {/* Nút Phân tích báo cáo */}
                    <Link href="/admin/reports">
                        <div className="bg-white/90 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-blue-50 transition border-2 border-transparent hover:border-blue-200">
                            <HiOutlineClipboardList className="w-16 h-16 text-blue-800" />
                            <span className="mt-4 bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-lg">
                                PHÂN TÍCH BÁO CÁO
                            </span>
                        </div>
                    </Link>
                </div>

            </div>
        </div>
    );
}