import StudentSidebar from '@/components/StudentSidebar'; // Dùng @ để import tuyệt đối
import Header from '@/components/Header';

export default function StudentLayout({
  children, // 'children' chính là file page.tsx
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-emerald-300">
      {/* Sidebar (cố định bên trái) */}
      <StudentSidebar />

      {/* Khu vực nội dung chính (Header + Content) */}
      <div className="flex-1 flex flex-col">
        {/* Header (cố định bên trên) */}
        <Header role="student"/>

        {/* 'children' là nội dung trang của bạn (app/student/page.tsx) */}
        {/* overflow-y-auto: cho phép cuộn nội dung nếu dài */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children} 
        </main>
      </div>
    </div>
  );
}