import AdminSidebar from '@/components/AdminSidebar'; // <-- Dùng Admin Sidebar
import Header from '@/components/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#475569]"> 
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Truyền role="admin" để Header biết */}
        <Header role="admin" /> 
        <main className="flex-1 p-6 overflow-y-auto">
          {children} 
        </main>
      </div>
    </div>
  );
}