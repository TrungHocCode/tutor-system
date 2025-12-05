import Sidebar from '@/components/AdminSidebar'; // Đảm bảo đường dẫn đúng tới file Sidebar bạn đã tạo
import Header from '@/components/Header';   // Đảm bảo đường dẫn đúng

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. Sidebar cố định bên trái (w-64) */}
      <Sidebar />
        
      {/* 2. Khu vực nội dung chính (bên phải) */}
      {/* ml-64: Đẩy toàn bộ khối này sang phải 16rem (256px) bằng đúng độ rộng Sidebar */}
      <div className="flex-1 ml-64 flex flex-col">
        
        {/* Header nằm trên cùng, cuộn theo nội dung hoặc sticky tùy CSS trong Header */}
        <Header role={'admin'} />

        {/* Nội dung thay đổi của từng trang (Dashboard, Student, Tutor...) */}
        <main className="p-8 flex-1 overflow-y-auto">
          {children}
        </main>
        
      </div>
    </div>
  );
}