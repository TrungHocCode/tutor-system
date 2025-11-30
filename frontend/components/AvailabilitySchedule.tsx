// File: AvailabilitySchedule.tsx (ĐÃ CẬP NHẬT TOÀN DIỆN)

"use client";

import { useState, useEffect, useCallback } from 'react';
import { HiChevronLeft, HiChevronRight, HiX } from 'react-icons/hi';
import { format, addWeeks, subWeeks, startOfWeek,endOfWeek, addDays, getWeek, parse, subDays } from 'date-fns';
import axios from 'axios';
import { vi } from 'date-fns/locale'; // Để hiển thị tháng tiếng Việt
const BASE_URL = 'http://localhost:5000'
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Mở rộng TIME_SLOTS để xác định EndTime (Giả định 2 tiếng/slot)
const TIME_SLOTS = [
  { id: '08:00', label: '08:00', end: '10:00' }, 
  { id: '12:00', label: '12:00', end: '14:00' },
  { id: '13:00', label: '13:00', end: '15:00' },
  { id: '17:00', label: '17:00', end: '19:00' },
  { id: '18:00', label: '18:00', end: '20:00' },
  { id: '21:00', label: '21:00', end: '23:00' },
];

// Helper function để lấy EndTime
const getEndTime = (startTime: string) => {
    const slot = TIME_SLOTS.find(ts => ts.id === startTime);
    return slot ? slot.end : '00:00'; 
};

// Cấu trúc slot được lưu trong state của component
interface SlotData {
  localId: string; 
  ID?: number; // Database ID (chỉ có nếu slot đã tồn tại)
  date: string; // dd/MM/yyyy (FE format)
  time: string; // HH:MM (FE format)
  isNew: boolean; // TRUE nếu slot vừa được chọn và chưa lưu
  isDeleted: boolean; // TRUE nếu slot đã tồn tại và bị hủy
}

// Cấu trúc slot được gửi tới hàm onSave (format BE)
interface AvailableSlot {
    ID?: number; 
    Date: string; // YYYY-MM-DD (BE format)
    StartTime: string; // HH:MM:SS (BE format)
    EndTime: string; // HH:MM:SS (BE format)
}

interface AvailabilityScheduleProps {
  onSave: (newSlots: AvailableSlot[], deletedIds: number[]) => Promise<void>;
  addNotification: (type: 'success' | 'error', title: string, message: string) => void;
}

export default function AvailabilitySchedule({ onSave, addNotification }: AvailabilityScheduleProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allSlots, setAllSlots] = useState<SlotData[]>([]); 
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [slotToCancel, setSlotToCancel] = useState<SlotData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const startDateOfWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Hàm chuyển đổi BE data sang FE format
  const mapBeToFe = (beSlots: any[]): SlotData[] => {
    return beSlots.map(s => {
        // Parse date từ ISO string
        const dateStr = s.Date.split('T')[0]; // YYYY-MM-DD
        const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
        const formattedDate = format(parsedDate, 'dd/MM/yyyy');
        const formattedTime = s.StartTime.substring(0, 5); // HH:MM
        
        console.log(`🔍 Mapping BE slot: Date=${dateStr}, Time=${s.StartTime}, Formatted=${formattedDate} ${formattedTime}`);
        
        return {
            localId: `${formattedDate}-${formattedTime}`,
            ID: s.AvailabilityID,
            date: formattedDate,
            time: formattedTime,
            isNew: false,
            isDeleted: false,
        };
    });
};
  
  // Hàm fetch lịch rảnh
  const fetchAvailability = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        addNotification('error', 'Lỗi xác thực', 'Vui lòng đăng nhập lại để xem lịch rảnh.');
        setIsLoading(false);
        return;
    }

    try {
        // --- SỬA Ở ĐÂY ---
        // Sai: const now = new Date(); // Cái này luôn lấy ngày giờ hiện tại
        // Đúng: Sử dụng currentDate (biến state đang lưu tuần người dùng đang xem)
        
        // 1. TÍNH TOÁN NGÀY DỰA TRÊN currentDate
        const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
        const sunday = endOfWeek(currentDate, { weekStartsOn: 1 });
        
        // Lưu ý: Logic subDays(monday, 1) của bạn có thể là để lấy Chủ Nhật tuần trước (nếu BE cần thế)
        // hoặc để xử lý múi giờ. Giữ nguyên logic tính toán của bạn, chỉ thay đổi input là currentDate.
        const startDayForQuery = subDays(monday, 1); 
        
        const start = format(startDayForQuery, 'yyyy-MM-dd'); 
        const end = format(sunday, 'yyyy-MM-dd'); 

        console.log(`[FE Fetch] Fetching from ${start} to ${end}`);
        
        // 2. GỌI API
        const response = await axios.get(`${BASE_URL}/api/tutors/me/availability`, {
            params: { start, end },
            headers: {
                Authorization: `Bearer ${token}` 
            }
        });

        // 3. CẬP NHẬT STATE
        if (response.data && Array.isArray(response.data)) {
            const mappedSlots = mapBeToFe(response.data);
            setAllSlots(mappedSlots);
        } else {
            setAllSlots([]); 
        }

    } catch (error) {
        console.error("Lỗi khi tải lịch rảnh:", error);
        addNotification('error', 'Lỗi tải lịch', 'Không thể tải lịch rảnh hiện tại.');
    } finally {
        setIsLoading(false);
    }
}, [addNotification, currentDate]);

  useEffect(() => {
      fetchAvailability();
  }, [fetchAvailability]);

  // Kiểm tra xem slot có được chọn không (chưa bị đánh dấu xóa)
  const isSlotSelected = (date: string, time: string) => {
    const slot = allSlots.find(s => 
        s.date === date && 
        s.time === time && 
        !s.isDeleted
    );
    
    // Debug logging
    if (slot) {
        console.log(`✅ Slot Found: ${date} ${time}`, slot);
    }
    
    return !!slot;
};
  
  // Lấy slot data
  const getSlot = (date: string, time: string) => {
      return allSlots.find(slot => slot.date === date && slot.time === time);
  };

  // Thêm, xóa hoặc khôi phục slot
  const toggleSlot = (date: string, time: string) => {
    const slot = getSlot(date, time);

    if (slot && !slot.isDeleted) {
      // Đã chọn: Hiện modal hủy (áp dụng cho cả slot đã lưu và slot mới chưa lưu)
      setSlotToCancel(slot);
      setShowCancelModal(true);
      
    } else if (slot && slot.isDeleted) {
      // Đã bị đánh dấu xóa: Khôi phục lại
      setAllSlots(prev => prev.map(s => s.localId === slot.localId ? {...s, isDeleted: false} : s));
      
    } else {
      // Slot hoàn toàn mới: Thêm vào state
      const newSlot: SlotData = {
          localId: `${date}-${time}`,
          date,
          time,
          isNew: true,
          isDeleted: false,
      };
      setAllSlots(prev => [...prev, newSlot]);
    }
  };

  // Xác nhận hủy slot
  const confirmCancel = () => {
    if (slotToCancel) {
        if (slotToCancel.ID !== undefined) {
            // Slot đã tồn tại: Đánh dấu là CẦN XÓA
            setAllSlots(prev => prev.map(s => s.localId === slotToCancel.localId ? {...s, isDeleted: true} : s));
        } else {
            // Slot mới: Xóa khỏi danh sách
            setAllSlots(prev => prev.filter(s => s.localId !== slotToCancel.localId));
        }
        setShowCancelModal(false);
        setSlotToCancel(null);
    }
  };
  
  // Xử lý lưu chính
  const handleSave = () => {
      // 1. Lấy danh sách các slot mới (isNew === true)
      const newSlots = allSlots
        .filter(s => s.isNew && !s.isDeleted)
        .map(s => ({
            // Chuyển đổi sang format BE (YYYY-MM-DD, HH:MM:SS)
            Date: format(parse(s.date, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd'),
            StartTime: `${s.time}:00`, 
            EndTime: `${getEndTime(s.time)}:00`, 
        } as AvailableSlot));

      // 2. Lấy danh sách ID cần xóa (có ID và isDeleted === true)
      const deletedIds = allSlots
        .filter(s => s.ID !== undefined && s.isDeleted)
        .map(s => s.ID!);
        
      if (newSlots.length === 0 && deletedIds.length === 0) {
          addNotification('error', 'Lỗi', 'Không có thay đổi nào cần lưu.');
          return;
      }

      // Gọi hàm onSave trong page.tsx và fetch lại sau khi thành công
      onSave(newSlots, deletedIds)
        .then(() => fetchAvailability())
        .catch(() => { /* error handling is in page.tsx */ });
  };
  

  return (
    <div className="space-y-6">
      {/* Thông báo hướng dẫn */}
      <div className="bg-green-600 text-white p-4 rounded-2xl flex items-start space-x-3 shadow-lg">
        <div className="bg-white text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl shrink-0">
          !
        </div>
        <div className="flex-1">
          <p className="font-medium">
            Chọn các khung giờ bạn <strong>thường xuyên rảnh</strong> trong tuần. Đây là lịch tham khảo để sinh viên tiện liên hệ. Các buổi hỗ trợ cụ thể sẽ được tạo trong mục <strong>Lịch dạy của tôi</strong>.
          </p>
        </div>
      </div>

      {/* Header lịch động */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h2 className="text-3xl font-bold text-blue-900 font-serif">
          {format(currentDate, 'MMMM yyyy', { locale: vi })}
        </h2>
        
        <div className="flex items-center space-x-4 bg-gray-100 p-1 rounded-full">
          <button onClick={prevWeek} className="p-2 hover:bg-white rounded-full shadow-sm transition">
            <HiChevronLeft className="w-5 h-5 text-blue-800"/>
          </button>
          
          <span className="text-lg font-bold text-blue-900 px-2 min-w-20 text-center">
            Tuần {getWeek(currentDate, { weekStartsOn: 1 })}
          </span>
          
          <button onClick={nextWeek} className="p-2 hover:bg-white rounded-full shadow-sm transition">
            <HiChevronRight className="w-5 h-5 text-blue-800"/>
          </button>
        </div>
      </div>

      {/* Grid lịch */}
      {isLoading ? (
        <div className="text-center py-10 text-lg text-gray-600">Đang tải lịch rảnh...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        
          {/* Header các ngày */}
          <div className="grid grid-cols-8 border-b text-center bg-blue-50">
            <div className="border-r border-blue-100 p-3 font-bold text-blue-900">Giờ</div>
            
            {DAYS.map((dayLabel, index) => {
              const dateOfColumn = addDays(startDateOfWeek, index);
              const dateStr = format(dateOfColumn, 'dd/MM/yyyy');
              const isToday = format(new Date(), 'dd/MM/yyyy') === dateStr;
              
              return (
                <div key={dayLabel} className={`border-r border-blue-100 p-2 last:border-0 ${isToday ? 'bg-blue-100' : ''}`}>
                  <div className="font-bold text-blue-900">{dayLabel}</div>
                  <div className={`text-sm ${isToday ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                    {format(dateOfColumn, 'dd/MM')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Các ô lịch */}
          <div className="divide-y divide-blue-100">
            {TIME_SLOTS.map((timeSlot) => (
              <div key={timeSlot.id} className="grid grid-cols-8 divide-x divide-blue-100">
                
                {/* Cột giờ */}
                <div className="flex items-center justify-center bg-blue-50 text-blue-900 p-3 font-bold">
                  {timeSlot.label}
                </div>

                {/* Các ô theo ngày */}
                {DAYS.map((dayLabel, index) => {
                  const dateOfColumn = addDays(startDateOfWeek, index);
                  const dateStr = format(dateOfColumn, 'dd/MM/yyyy');
                  const isSelected = isSlotSelected(dateStr, timeSlot.id);
                  const slotData = getSlot(dateStr, timeSlot.id); // Lấy data slot
                  
                  return (
                    <div
                      key={dayLabel}
                      className="relative p-3 min-h-20 group cursor-pointer transition-all"
                      onClick={() => toggleSlot(dateStr, timeSlot.id)}
                    >
                      {/* Background gradient khi đã chọn */}
                      <div 
                        className={`absolute inset-0 transition-all duration-300 ${
                          isSelected 
                            ? (slotData?.isNew ? 'bg-linear-to-br from-yellow-400 to-yellow-600 opacity-100' : 'bg-linear-to-br from-green-400 to-green-600 opacity-100')
                            : 'bg-blue-50/0 group-hover:bg-blue-50/50'
                        }`}
                      />

                      {/* Nút Chọn/Hủy */}
                      <div 
                        className="relative z-10 h-full flex items-center justify-center"
                      >
                        {isSelected ? (
                          // Hiển thị "Đã chọn" và nút Hủy khi hover
                          <div className="text-center">
                             <div className="text-white font-bold text-sm mb-1 group-hover:hidden">
                                {slotData?.isNew ? 'MỚI' : 'Đã chọn'}
                            </div>
                            <button 
                                className="hidden group-hover:block bg-white text-red-600 px-4 py-1.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition"
                                onClick={(e) => { e.stopPropagation(); toggleSlot(dateStr, timeSlot.id); }} 
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          // Hiển thị nút Chọn khi hover
                          <button 
                            className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:bg-blue-700 transition"
                            onClick={(e) => { e.stopPropagation(); toggleSlot(dateStr, timeSlot.id); }} 
                          >
                            Chọn
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Chú thích */}
      <div className="p-3 bg-white rounded-xl flex justify-center space-x-6 text-sm border shadow-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-linear-to-br from-green-400 to-green-600 mr-2 rounded"></div>
          Đã lưu (Thời gian rảnh)
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-linear-to-br from-yellow-400 to-yellow-600 mr-2 rounded"></div>
          Mới (Chưa lưu)
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 mr-2 rounded"></div>
          Chưa chọn
        </div>
      </div>

      {/* Nút Lưu thông tin */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          className="px-8 py-3 rounded-full font-bold text-white text-base shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
          style={{ backgroundColor: '#0313B0' }}
          disabled={isLoading}
        >
          <span>💾</span>
          <span>{isLoading ? 'Đang tải...' : 'Lưu lịch rảnh'}</span>
        </button>
      </div>

      {/* Modal xác nhận hủy */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl w-[500px] p-8 shadow-2xl relative">
            <button
              onClick={() => setShowCancelModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <HiX className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-center mb-4" style={{ color: '#0313B0' }}>
              Xác nhận hủy ?
            </h2>
            <p className="text-center text-gray-700 mb-2">
              Bạn có chắc chắn muốn hủy khung giờ này không?
            </p>
            <p className="text-center text-gray-500 text-sm mb-6">
              ({slotToCancel?.date} - {slotToCancel?.time})
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmCancel}
                className="px-6 py-2.5 rounded-full font-bold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: '#0313B0' }}
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-6 py-2.5 rounded-full font-bold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: '#28A745' }}
              >
                Hủy thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}