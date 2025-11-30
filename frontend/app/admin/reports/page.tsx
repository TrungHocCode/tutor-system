// BẮT BUỘC "use client" để dùng state và onClick
"use client";

import { useState } from 'react';
import { HiOutlineClock, HiOutlineMap, HiOutlineCheckCircle, HiOutlineDownload, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast'; // <-- Import toast

export default function ReportsPage() {
  // State để quản lý các lựa chọn
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [format, setFormat] = useState('pdf');

  // Hàm xử lý khi bấm Xuất Báo Cáo
  const handleExport = () => {
    if (selectedReports.length === 0) {
      // Gọi pop-up LỖI
      toast.error('Vui lòng chọn ít nhất một báo cáo!', {
        icon: <HiExclamationCircle className="text-red-500" />,
      });
      return;
    }

    // Xử lý logic...
    
    // Gọi pop-up THÀNH CÔNG
    toast.success('Xuất file thành công!');
  };

  // Hàm xử lý chọn/bỏ chọn
  const toggleReport = (reportName: string) => {
    setSelectedReports(prev => 
      prev.includes(reportName)
        ? prev.filter(item => item !== reportName) // Bỏ chọn
        : [...prev, reportName] // Thêm vào
    );
  };

  return (
    <div className="bg-white/90 p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">BÁO CÁO</h1>
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <HiOutlineClock className="w-6 h-6" />
            <span className="font-semibold">Thời gian</span>
          </div>
          <div className="flex items-center space-x-2">
            <HiOutlineMap className="w-6 h-6" />
            <span className="font-semibold">Phạm vi</span>
          </div>
        </div>
      </div>

      {/* Danh sách báo cáo */}
      <div className="space-y-4 mb-8">
        {/* Từng mục báo cáo */}
        {[
          'Báo cáo tỷ lệ tham gia của sinh viên',
          'Báo cáo hiệu suất sử dụng',
          'Báo cáo tổng hợp phản hồi sinh viên',
          'Báo cáo hoạt động của tutor'
        ].map((report) => (
          <div key={report} className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Checkbox tùy chỉnh */}
              <button 
                onClick={() => toggleReport(report)}
                className={`w-6 h-6 rounded border-2 ${selectedReports.includes(report) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
              >
                {selectedReports.includes(report) && <HiOutlineCheckCircle className="w-5 h-5 text-white" />}
              </button>
              <span className="ml-4 text-lg">{report}</span>
            </div>
            <div className="flex space-x-4">
              <select className="p-2 rounded-lg bg-gray-200 border border-gray-300">
                <option>Chọn thời gian</option>
                <option>Tháng 10</option>
                <option>Toàn trường</option>
              </select>
              <select className="p-2 rounded-lg bg-gray-200 border border-gray-300">
                <option>Chọn phạm vi</option>
                <option>Toàn trường</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Phần chọn định dạng và xuất file */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center space-x-4">
          {/* Nút toggle PDF/Word */}
          <span className="font-semibold">PDF</span>
          <button 
            onClick={() => setFormat(format === 'pdf' ? 'word' : 'pdf')}
            className="w-12 h-6 bg-gray-300 rounded-full flex items-center p-1"
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${format === 'pdf' ? 'translate-x-0' : 'translate-x-6'}`} />
          </button>
          <span className="font-semibold">Word</span>
        </div>
        
        <button 
          onClick={handleExport} // <-- GỌI HÀM XUẤT
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <HiOutlineDownload className="w-5 h-5" />
          <span>XUẤT BÁO CÁO</span>
        </button>

        <span className="text-lg font-semibold">Đã chọn: {selectedReports.length}</span>
      </div>
    </div>
  );
}