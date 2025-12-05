// BẮT BUỘC "use client" để dùng state và onClick
"use client";

import { useState, useEffect } from 'react';
import { 
  HiOutlineClock, 
  HiOutlineMap, 
  HiOutlineCheckCircle, 
  HiOutlineDownload, 
  HiExclamationCircle,
  HiOutlineDocumentReport 
} from 'react-icons/hi';
import toast, { Toaster } from 'react-hot-toast';

// Định nghĩa kiểu dữ liệu cho loại báo cáo từ API
interface ReportType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export default function ReportsPage() {
  // --- STATE ---
  const [availableReports, setAvailableReports] = useState<ReportType[]>([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]); // Lưu mảng các ID (vd: ['student_progress'])
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  
  // Filter state (Mặc định năm hiện tại)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // --- EFFECT: Lấy danh sách báo cáo khi load trang ---
  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        // Gọi API lấy danh sách loại báo cáo
        const token = localStorage.getItem('access_token');
        const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
        const res = await fetch('http://localhost:5000/api/reports/types',{headers});
        const data = await res.json();
        
        if (data.success) {
          setAvailableReports(data.data);
        } else {
          toast.error('Không tải được danh sách báo cáo');
        }
      } catch (error) {
        console.error(error);
        toast.error('Lỗi kết nối server');
      }
    };

    fetchReportTypes();
  }, []);

  // --- HANDLER: Xử lý khi bấm Xuất Báo Cáo ---
  const handleExport = async () => {
    if (selectedReports.length === 0) {
      toast.error('Vui lòng chọn ít nhất một báo cáo!', {
        icon: <HiExclamationCircle className="text-red-500" />,
      });
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Đang tạo báo cáo...');

    try {
      // Gọi API generate báo cáo
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:5000/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Thêm token nếu cần
        },
        body: JSON.stringify({
          reportTypes: selectedReports,
          filters: {
            year: selectedYear,
            // Thêm các filter khác nếu cần (department, major...)
          }
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(`Đã xuất ${result.data.length} báo cáo thành công!`, { id: toastId });
        // Ở đây có thể thêm logic tải file về hoặc chuyển hướng sang trang lịch sử
        console.log("Report Data:", result.data); 
      } else {
        throw new Error(result.message || 'Lỗi khi tạo báo cáo');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Có lỗi xảy ra', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: Chọn/Bỏ chọn báo cáo ---
  const toggleReport = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId)
        ? prev.filter(item => item !== reportId) // Bỏ chọn
        : [...prev, reportId] // Thêm vào
    );
  };

  return (
    <div className="bg-white/90 p-8 rounded-lg shadow-lg max-w-5xl mx-auto mt-10">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HiOutlineDocumentReport className="text-blue-600" />
          HỆ THỐNG BÁO CÁO
        </h1>
        
        {/* Global Filters Display */}
        <div className="flex space-x-6 text-gray-600">
          <div className="flex items-center space-x-2">
            <HiOutlineClock className="w-5 h-5" />
            <span className="font-medium">Niên khóa: {selectedYear}</span>
          </div>
          <div className="flex items-center space-x-2">
            <HiOutlineMap className="w-5 h-5" />
            <span className="font-medium">Phạm vi: Toàn trường</span>
          </div>
        </div>
      </div>

      {/* DANH SÁCH BÁO CÁO (DYNAMIC TỪ API) */}
      <div className="space-y-4 mb-8">
        {availableReports.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Đang tải danh sách báo cáo...</p>
        ) : (
          availableReports.map((report) => (
            <div 
              key={report.id} 
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                selectedReports.includes(report.id) ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center flex-1 cursor-pointer" onClick={() => toggleReport(report.id)}>
                {/* Checkbox Custom */}
                <div 
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedReports.includes(report.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                  }`}
                >
                  {selectedReports.includes(report.id) && <HiOutlineCheckCircle className="w-5 h-5 text-white" />}
                </div>
                
                {/* Info Báo Cáo */}
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    {report.icon && <span>{report.icon}</span>}
                    {report.name}
                  </h3>
                  {report.description && (
                    <p className="text-sm text-gray-500">{report.description}</p>
                  )}
                </div>
              </div>

              {/* Filters Riêng Lẻ (Nếu muốn giữ giao diện cũ) */}
              <div className="flex space-x-4 pl-4 border-l ml-4">
                <select 
                  className="p-2 text-sm rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  onClick={(e) => e.stopPropagation()} // Ngăn click checkbox
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
                
                <select 
                  className="p-2 text-sm rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="all">Toàn trường</option>
                  <option value="cntt">CNTT</option>
                  <option value="kt">Kinh tế</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER: ĐỊNH DẠNG & NÚT XUẤT */}
      <div className="flex justify-between items-center pt-6 border-t bg-gray-50 p-4 -mx-8 -mb-8 rounded-b-lg">
        {/* Toggle Format */}
        <div className="flex items-center space-x-4">
          <span className={`font-semibold ${format === 'pdf' ? 'text-red-600' : 'text-gray-400'}`}>PDF</span>
          <button 
            onClick={() => setFormat(format === 'pdf' ? 'word' : 'pdf')}
            className={`w-14 h-7 rounded-full flex items-center p-1 transition-colors duration-300 ${
              format === 'pdf' ? 'bg-red-500' : 'bg-blue-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
              format === 'pdf' ? 'translate-x-0' : 'translate-x-7'
            }`} />
          </button>
          <span className={`font-semibold ${format === 'word' ? 'text-blue-600' : 'text-gray-400'}`}>Word</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">
            Đã chọn: <span className="text-blue-600 font-bold">{selectedReports.length}</span>
          </span>

          <button 
            onClick={handleExport}
            disabled={loading || availableReports.length === 0}
            className={`
              font-bold py-3 px-8 rounded-lg flex items-center space-x-2 shadow-lg transition-all
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transform hover:-translate-y-0.5'
              }
            `}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>ĐANG XỬ LÝ...</span>
              </>
            ) : (
              <>
                <HiOutlineDownload className="w-5 h-5" />
                <span>XUẤT BÁO CÁO</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}