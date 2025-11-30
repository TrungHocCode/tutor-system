import TutorSidebar from '@/components/TutorSidebar'; // <-- DÙNG SIDEBAR MỚI
import Header from '@/components/Header'; // <-- Tái sử dụng Header

export default function TutorLayout({
  children, // 'children' chính là file page.tsx của Tutor
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#475569]">
      {/* Sidebar của Tutor */}
      <TutorSidebar />

      {/* Khu vực nội dung chính */}
      <div className="flex-1 flex flex-col">
        {/* Header (dùng chung) */}
        <Header role="tutor"/>

        {/* Nội dung trang Tutor (overflow-y-auto: cho phép cuộn) */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children} 
        </main>
      </div>
    </div>
  );
}