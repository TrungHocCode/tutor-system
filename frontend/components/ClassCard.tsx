import { HiOutlineUserGroup, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';

// Định nghĩa 'kiểu' cho các props
type ClassCardProps = {
  title: string;
  base: string | number;
  room: string;
  time: string;
};

// Component nhận props
export default function ClassCard({ title, base, room, time }: ClassCardProps) {
  return (
    // Thẻ trắng, bo góc, có bóng
    <div className="bg-white rounded-lg shadow-md p-4 w-64 shrink-0">
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center">
          <HiOutlineUserGroup className="w-5 h-5 mr-2 text-gray-500" />
          <span>Cơ sở: {base}</span>
        </div>
        
        <div className="flex items-center">
          <HiOutlineLocationMarker className="w-5 h-5 mr-2 text-gray-500" />
          <span>Phòng: {room}</span>
        </div>
        
        <div className="flex items-center">
          <HiOutlineClock className="w-5 h-5 mr-2 text-gray-500" />
          <span>Giờ: {time}</span>
        </div>
      </div>
      
      {/* Nút Đăng ký */}
      <button 
        className="mt-4 w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition duration-300"
      >
        Đăng ký
      </button>
    </div>
  );
}