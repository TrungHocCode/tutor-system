"use client";

import { useState } from 'react';
import { HiOutlineSearch, HiDownload, HiOutlineEye, HiOutlineLink, HiX, HiCheck } from 'react-icons/hi';

// Mock Data - Danh sách tài liệu
const MOCK_DOCUMENTS = [
  {
    id: 1,
    title: "Giáo trình nhập môn Công nghệ phần mềm",
    subject: "Công nghệ phần mềm",
    authors: "Đỗ Văn Nhơn, Nguyễn Thị Thanh Trúc, Nguyễn Trác Thức",
    type: "Online",
    uploadDate: "2024-01-15",
    pages: 40,
    fileUrl: "/Assignment_DataMining.pdf"
  },
  {
    id: 2,
    title: "Cơ sở công nghệ phần mềm",
    subject: "Công nghệ phần mềm",
    authors: "Lương Mạnh Bá chủ biên; Lương Thanh Bình, Cao Tuấn Dũng, Nguyễn Thị Thu Trang",
    type: "Online",
    uploadDate: "2024-01-20",
    pages: 45,
    fileUrl: "/Assignment_DataMining.pdf"
  },
  {
    id: 3,
    title: "Kinh tế công nghệ phần mềm",
    subject: "Công nghệ phần mềm",
    authors: "Huỳnh Quyết Thắng",
    type: "Online",
    uploadDate: "2024-02-01",
    pages: 38,
    fileUrl: "/Assignment_DataMining.pdf"
  },
  {
    id: 4,
    title: "Công nghệ phần mềm",
    subject: "Công nghệ phần mềm",
    authors: "Lê Đức Trung",
    type: "Online",
    uploadDate: "2024-02-10",
    pages: 35,
    fileUrl: "/Assignment_DataMining.pdf"
  },
  {
    id: 5,
    title: "Phân tích và thiết kế hệ thống",
    subject: "Hệ thống thông tin",
    authors: "Nguyễn Văn A, Trần Thị B",
    type: "Online",
    uploadDate: "2024-02-15",
    pages: 50,
    fileUrl: "/Assignment_DataMining.pdf"
  },
  {
    id: 6,
    title: "Cơ sở dữ liệu nâng cao",
    subject: "Cơ sở dữ liệu",
    authors: "Lê Văn C, Phạm Thị D",
    type: "Online",
    uploadDate: "2024-02-20",
    pages: 42,
    fileUrl: "/Assignment_DataMining.pdf"
  },
  {
    id: 7,
    title: "Lập trình hướng đối tượng với Java",
    subject: "Lập trình",
    authors: "Hoàng Văn E",
    type: "Online",
    uploadDate: "2024-03-01",
    pages: 55,
    fileUrl: "/Assignment_DataMining.pdf"
  },
  {
    id: 8,
    title: "Cấu trúc dữ liệu và giải thuật",
    subject: "Lập trình",
    authors: "Võ Thị F, Đặng Văn G",
    type: "Online",
    uploadDate: "2024-03-05",
    pages: 48,
    fileUrl: "/Assignment_DataMining.pdf"
  },
  {
    id: 9,
    title: "Mạng máy tính cơ bản",
    subject: "Mạng máy tính",
    authors: "Bùi Văn H",
    type: "Online",
    uploadDate: "2024-03-10",
    pages: 40,
    fileUrl: "/Assignment_DataMining.pdf"
  },
  {
    id: 10,
    title: "Trí tuệ nhân tạo và Machine Learning",
    subject: "Trí tuệ nhân tạo",
    authors: "Phan Thị I, Lý Văn K",
    type: "Online",
    uploadDate: "2024-03-15",
    pages: 60,
    fileUrl: "/Assignment_DataMining.pdf"
  },
  {
    id: 11,
    title: "Kỹ thuật lập trình Python",
    subject: "Lập trình",
    authors: "Ngô Văn L",
    type: "Online",
    uploadDate: "2024-03-20",
    pages: 45,
    fileUrl: "/Assignment_DataMining.pdf"
  },
  {
    id: 12,
    title: "Hệ điều hành Linux",
    subject: "Hệ điều hành",
    authors: "Mai Thị M, Chu Văn N",
    type: "Online",
    uploadDate: "2024-03-25",
    pages: 52,
    fileUrl: "/Assignment_DataMining.pdf"
  }
];

// Mock Data - Danh sách lớp học
const MOCK_CLASSES = [
  { id: 1, name: "Công nghệ phần mềm - Lớp CC01", code: "CS101", students: 35 },
  { id: 2, name: "Cơ sở dữ liệu - Lớp CC02", code: "CS102", students: 30 },
  { id: 3, name: "Lập trình hướng đối tượng - Lớp CC03", code: "CS103", students: 28 },
  { id: 4, name: "Mạng máy tính - Lớp CC04", code: "CS104", students: 32 }
];

type Document = typeof MOCK_DOCUMENTS[0];
type ClassInfo = typeof MOCK_CLASSES[0];

export default function TutorLibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'none' | 'view' | 'attach'>('none');
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ 
    show: false, 
    message: '' 
  });

  // Lọc tài liệu theo từ khóa tìm kiếm
  const filteredDocs = MOCK_DOCUMENTS.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.authors.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Xử lý tải tài liệu
  const handleDownload = (doc: Document) => {
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = `${doc.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Tải tài liệu thành công!');
  };

  // Xử lý xem tài liệu
  const handleView = (doc: Document) => {
    setSelectedDoc(doc);
    setViewMode('view');
  };

  // Xử lý gắn tài liệu
  const handleAttach = (doc: Document) => {
    setSelectedDoc(doc);
    setViewMode('attach');
    setSelectedClasses([]);
  };

  // Toggle chọn lớp
  const toggleClass = (classId: number) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  // Xác nhận gắn tài liệu
  const confirmAttach = () => {
    if (selectedClasses.length === 0) {
      showNotification('Vui lòng chọn ít nhất một lớp!');
      return;
    }
    
    // Giả lập gắn tài liệu
    const classNames = MOCK_CLASSES
      .filter(c => selectedClasses.includes(c.id))
      .map(c => c.name)
      .join(', ');
    
    showNotification(`Đã gắn tài liệu "${selectedDoc?.title}" vào lớp: ${classNames}`);
    closeModal();
  };

  // Hiển thị thông báo
  const showNotification = (message: string) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  // Đóng modal
  const closeModal = () => {
    setViewMode('none');
    setSelectedDoc(null);
    setSelectedClasses([]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Thư viện tài liệu</h1>
        
        {/* Thanh tìm kiếm */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên tài liệu, môn học hoặc tác giả..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Kết quả tìm kiếm */}
        <p className="text-sm text-gray-600 mt-3">
          Tìm thấy <span className="font-bold text-blue-600">{filteredDocs.length}</span> tài liệu
        </p>
      </div>

      {/* Danh sách tài liệu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            {/* Header của card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full mb-2">
                    {doc.subject}
                  </span>
                  <h3 className="text-white font-bold text-lg line-clamp-2 leading-tight">
                    {doc.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Nội dung card */}
            <div className="p-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-gray-500 font-medium min-w-[80px]">Tác giả:</span>
                  <span className="text-gray-700 line-clamp-2">{doc.authors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-500 font-medium">Trang:</span>
                    <span className="text-gray-700 ml-2">{doc.pages}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 font-medium">Ngày tải:</span>
                    <span className="text-gray-700 ml-2">{new Date(doc.uploadDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              {/* Các nút hành động */}
              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => handleView(doc)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                  title="Xem tài liệu"
                >
                  <HiOutlineEye className="w-4 h-4" />
                  <span>Xem</span>
                </button>
                
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                  title="Tải xuống"
                >
                  <HiDownload className="w-4 h-4" />
                  <span>Tải</span>
                </button>
                
                <button
                  onClick={() => handleAttach(doc)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm"
                  title="Gắn vào buổi hỗ trợ"
                >
                  <HiOutlineLink className="w-4 h-4" />
                  <span>Gắn</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hiển thị khi không tìm thấy */}
      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <p className="text-gray-600 text-lg">Không tìm thấy tài liệu phù hợp</p>
          <p className="text-gray-500 text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}

      {/* Modal xem tài liệu */}
      {viewMode === 'view' && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
            {/* Header modal */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-blue-900">{selectedDoc.title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedDoc.subject} • {selectedDoc.authors}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <HiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Nội dung PDF */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedDoc.fileUrl}
                className="w-full h-full border-0"
                title={selectedDoc.title}
              />
            </div>

            {/* Footer modal */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                {selectedDoc.pages} trang • Tải lên: {new Date(selectedDoc.uploadDate).toLocaleDateString('vi-VN')}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(selectedDoc)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <HiDownload className="w-5 h-5" />
                  Tải xuống
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    handleAttach(selectedDoc);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <HiOutlineLink className="w-5 h-5" />
                  Gắn vào lớp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal gắn tài liệu vào lớp */}
      {viewMode === 'attach' && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-blue-900 mb-2">
                    Gắn tài liệu vào lớp học
                  </h2>
                  <p className="text-gray-600">
                    Tài liệu: <span className="font-semibold text-blue-600">{selectedDoc.title}</span>
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <HiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Danh sách lớp */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">
                Chọn các lớp bạn muốn gắn tài liệu này:
              </p>
              <div className="space-y-3">
                {MOCK_CLASSES.map((classInfo) => (
                  <div
                    key={classInfo.id}
                    onClick={() => toggleClass(classInfo.id)}
                    className={`
                      p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${selectedClasses.includes(classInfo.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              w-6 h-6 rounded-lg flex items-center justify-center transition-colors
                              ${selectedClasses.includes(classInfo.id)
                                ? 'bg-blue-600'
                                : 'bg-gray-200'
                              }
                            `}
                          >
                            {selectedClasses.includes(classInfo.id) && (
                              <HiCheck className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{classInfo.name}</h3>
                            <p className="text-sm text-gray-600">
                              Mã lớp: {classInfo.code} • {classInfo.students} sinh viên
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex items-center justify-between rounded-b-2xl">
              <p className="text-sm text-gray-600">
                Đã chọn: <span className="font-bold text-blue-600">{selectedClasses.length}</span> lớp
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmAttach}
                  disabled={selectedClasses.length === 0}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-all duration-200
                    ${selectedClasses.length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  Xác nhận gắn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in-right">
          <div className="min-w-[320px] bg-green-500 text-white rounded-lg shadow-2xl p-4 flex items-center gap-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <HiCheck className="w-4 h-4" />
            </div>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}