"use client";
import { Toaster } from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import { HiChevronLeft, HiChevronRight, HiPlus, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { format, addWeeks, subWeeks, startOfWeek, addDays, getWeek, parse, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

// --- CONFIG & TYPES ---
const BASE_URL = 'http://localhost:5000'; // Đổi port theo BE của bạn

export interface Session {
  id: number;
  subject: string;   // BE: Topic
  date: string;      // BE: Date (YYYY-MM-DD) -> FE: dd/MM/yyyy
  startTime: string; // BE: StartTime (HH:mm:ss)
  endTime: string;   // BE: EndTime
  duration: number;  // Tính toán từ Start/End
  type: 'online' | 'offline'; // BE: Format
  location: string;
  base?: string;     // Có thể gộp vào Location hoặc tách riêng tuỳ DB
  maxStudents: number;
  status: 'open' | 'cancelled' | 'finished';
  period?: 'morning' | 'afternoon' | 'evening'; // FE calculated
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PERIODS = [
  { id: 'morning', label: 'Sáng', icon: '🌅' },
  { id: 'afternoon', label: 'Chiều', icon: '☀️' },
  { id: 'evening', label: 'Tối', icon: '🌙' },
];

// --- HELPERS CHUYỂN ĐỔI NGÀY & GIỜ ---

// 1. Xác định buổi dựa trên giờ bắt đầu
const getPeriod = (timeStr: string) => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
};

// 2. Chuyển đổi Data BE -> FE
const mapBeToFe = (data: any): Session => {
    // BE trả về YYYY-MM-DD (nhờ to_char), FE cần dd/MM/yyyy để hiển thị khớp logic cũ
    const dateParts = data.Date.split('-'); // [YYYY, MM, DD]
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; 

    // Tính duration
    const startParts = data.StartTime.split(':').map(Number);
    const endParts = data.EndTime.split(':').map(Number);
    const duration = (endParts[0] * 60 + endParts[1]) - (startParts[0] * 60 + startParts[1]);

    return {
        id: data.SessionID,
        subject: data.Topic,
        date: formattedDate, 
        startTime: data.StartTime.substring(0, 5), // HH:mm
        endTime: data.EndTime.substring(0, 5),
        duration: duration,
        type: data.Format.toLowerCase() as 'online' | 'offline',
        location: data.Location,
        maxStudents: data.MaxStudent,
        status: data.Status.toLowerCase(),
        period: getPeriod(data.StartTime) as any,
        base: data.Base
    };
};

// 3. Chuyển đổi dd/MM/yyyy -> YYYY-MM-DD để gửi xuống BE
const formatToSubmitDate = (displayDate: string) => {
    if (!displayDate) return '';
    const parts = displayDate.split('/'); // dd, MM, yyyy
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// 4. Tính EndTime từ StartTime + Duration
const calculateEndTime = (startTime: string, durationMin: number) => {
    if (!startTime) return '00:00';
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMin;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
};

export default function TutorSchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<Session[]>([]);
  const [viewMode, setViewMode] = useState<'none' | 'create' | 'detail' | 'edit' | 'cancel'>('none');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState<Partial<Session>>({});

  // Navigation Logic
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const startDateOfWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

  // --- API FETCHING ---
  const fetchSessions = useCallback(async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      setIsLoading(true);
      try {
          const response = await axios.get(`${BASE_URL}/api/tutors/sessions/me`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data) {
              const mappedData = response.data.map(mapBeToFe);
              setSchedule(mappedData);
          }
      } catch (error) {
          console.error(error);
          toast.error('Không thể tải lịch dạy.');
      } finally {
          setIsLoading(false);
      }
  }, []);

  useEffect(() => {
      fetchSessions();
  }, [fetchSessions]);

  // --- ACTIONS ---
  const openCreateModal = (day: string, period: string, dateStr: string) => {
    setFormData({ 
      date: dateStr, // dd/MM/yyyy
      period: period as any,
      type: 'online', 
      duration: 90, 
      maxStudents: 10,
      startTime: period === 'morning' ? '08:00' : period === 'afternoon' ? '13:00' : '18:00'
    });
    setViewMode('create');
  };

  const openDetailModal = (session: Session) => {
    setSelectedSession(session);
    setViewMode('detail');
  };

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        toast.error('Vui lòng đăng nhập lại.');
        return;
    }

    // 1. Chuẩn bị dữ liệu
    const submitDate = formatToSubmitDate(formData.date || '');
    const endTime = calculateEndTime(formData.startTime || '00:00', formData.duration || 0);
    
    // 2. Validate
    if (!formData.subject || !submitDate || !formData.startTime) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
        return;
    }

    const payload = {
        Topic: formData.subject,
        Date: submitDate,
        StartTime: formData.startTime,
        EndTime: endTime,
        Format: formData.type === 'online' ? 'Online' : 'Offline',
        Location: formData.location || (formData.type === 'online' ? 'Google Meet' : 'P.A101'),
        MaxStudent: formData.maxStudents,
        Base: formData.base || '' // Đã thêm trường Base
    };

    try {
        if (viewMode === 'create') {
            await axios.post(`${BASE_URL}/api/tutors/sessions`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Tạo buổi học thành công!'); // Thông báo xanh
            
        } else if (viewMode === 'edit' && selectedSession) {
            await axios.put(`${BASE_URL}/api/tutors/sessions/${selectedSession.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Cập nhật thành công!');
        }
        
        await fetchSessions();
        closeModal();

    } catch (error: any) {
        console.error("Lỗi khi lưu:", error);

        // --- PHẦN QUAN TRỌNG: TRÍCH XUẤT LỖI TỪ BACKEND ---
        // error.response.data.error là chuỗi text ta đã gửi từ controller (res.status(400).json({ error: "..." }))
        const errorMessage = error.response?.data?.error;

        if (errorMessage) {
            // Hiển thị thông báo đỏ với nội dung cụ thể từ Backend
            toast.error(errorMessage, {
                duration: 5000, // Hiện lâu hơn (5s) để người dùng kịp đọc
                style: {
                    border: '1px solid #EF4444',
                    padding: '16px',
                    color: '#B91C1C',
                },
            });
        } else {
            // Lỗi không xác định (Mất mạng, Server sập, v.v.)
            toast.error('Có lỗi hệ thống. Vui lòng thử lại sau.');
        }
    }
  };

  const handleCancelSession = async () => {
    if (!selectedSession) return;
    const token = localStorage.getItem('access_token');
    
    try {
        // --- HỦY BUỔI (Code mới) ---
        // Gọi API DELETE /sessions/:id
        await axios.delete(`${BASE_URL}/api/tutors/sessions/${selectedSession.id}`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('Đã hủy buổi học!');
        
        await fetchSessions(); // Tải lại danh sách để mất buổi đã hủy
        closeModal();
        
    } catch (error: any) {
        console.error("Lỗi khi hủy:", error);
        if (error.response?.data?.error) {
            toast.error(error.response.data.error);
        } else {
            toast.error('Không thể hủy buổi học.');
        }
    }
  };

  const closeModal = () => {
    setViewMode('none');
    setSelectedSession(null);
    setFormData({});
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header Lịch */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h1 className="text-3xl font-bold text-blue-900 font-serif">
          {format(currentDate, 'MMMM yyyy', { locale: vi })}
        </h1>
        <div className="flex items-center space-x-4 bg-gray-100 p-1 rounded-full">
          <button onClick={prevWeek} className="p-2 hover:bg-white rounded-full shadow-sm transition"><HiChevronLeft className="w-5 h-5 text-blue-800"/></button>
          <span className="text-lg font-bold text-blue-900 px-2 min-w-[80px] text-center">Tuần {getWeek(currentDate, { weekStartsOn: 1 })}</span>
          <button onClick={nextWeek} className="p-2 hover:bg-white rounded-full shadow-sm transition"><HiChevronRight className="w-5 h-5 text-blue-800"/></button>
        </div>
      </div>

      {/* Grid Lịch */}
      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border relative">
        {isLoading && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">Đang tải...</div>}
        
        {/* Header Ngày */}
        <div className="grid grid-cols-8 border-b text-center bg-blue-50">
           <div className="border-r border-blue-100 p-3 font-bold text-blue-900">Buổi</div>
           {DAYS.map((dayLabel, index) => {
             const dateOfColumn = addDays(startDateOfWeek, index);
             const dateStr = format(dateOfColumn, 'dd/MM/yyyy');
             const isToday = format(new Date(), 'dd/MM/yyyy') === dateStr;
             return (
              <div key={dayLabel} className={`border-r border-blue-100 p-2 last:border-0 ${isToday ? 'bg-blue-100' : ''}`}>
                <div className="font-bold text-blue-900">{dayLabel}</div>
                <div className={`text-sm ${isToday ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>{format(dateOfColumn, 'dd/MM')}</div>
              </div>
             );
           })}
        </div>

        {/* Body Lịch */}
        <div className="flex-1 grid grid-rows-3 divide-y divide-blue-100">
          {PERIODS.map((p) => (
            <div key={p.id} className="grid grid-cols-8 divide-x divide-blue-100">
              <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-900 p-2 font-medium">
                 <span className="text-2xl mb-1">{p.icon}</span>
                 <span className="text-sm">{p.label}</span>
              </div>
              {DAYS.map((dayLabel, index) => {
                const dateOfColumn = addDays(startDateOfWeek, index);
                const dateStr = format(dateOfColumn, 'dd/MM/yyyy'); // dd/MM/yyyy
                
                // Lọc session theo ngày (String compare) và buổi
                const sessionsInSlot = schedule.filter(s => {
                    return s.period === p.id && s.date === dateStr;
                });

                return (
                  <div 
                    key={dayLabel} 
                    className="relative p-2 hover:bg-blue-50/50 transition min-h-[120px] group flex flex-col gap-2 cursor-pointer font-montserrat"
                    onClick={() => openCreateModal(dayLabel, p.id, dateStr)}
                  >
                    {sessionsInSlot.map(s => (
                      <div 
                        key={s.id}
                        onClick={(e) => { e.stopPropagation(); openDetailModal(s); }}
                        className={`
                          p-2 rounded-lg shadow-sm text-sm font-bold border-l-4 hover:shadow-md transition z-10
                          ${s.status === 'open' ? 'bg-green-50 text-green-800 border-green-500' : s.status === 'finished' ? 'bg-indigo-50 text-indigo-800 border-indigo-500' : 'bg-red-50 text-red-800 border-red-500 opacity-70'}
                        `}
                      >
                        <div className="truncate">{s.subject}</div>
                        <div className="text-xs font-normal mt-1 opacity-80">{s.startTime} - {s.duration}'</div>
                      </div>
                    ))}
                    
                    {/* Nút cộng chỉ hiện khi hover */}
                    <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="p-1 rounded-full bg-blue-100 text-blue-600"><HiPlus className="w-4 h-4" /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <ScheduleModals 
        viewMode={viewMode}
        selectedSession={selectedSession}
        formData={formData}
        setFormData={setFormData}
        setViewMode={setViewMode}
        handleSave={handleSave}
        handleCancel={handleCancelSession}
        closeModal={closeModal}
      />
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

// =========================================================================
// UI COMPONENTS (Giữ nguyên UI logic nhưng fix các handler)
// =========================================================================

type InputGroupProps = {
  label: string;
  value?: string | number;
  onChange?: (val: string) => void;
  type?: string;
  placeholder?: string;
};

const InputGroup = ({ label, value, onChange, type = 'text', placeholder }: InputGroupProps) => (
  <div className="flex items-center space-x-4">
    <label className="font-bold text-blue-800 w-32 flex-shrink-0 text-sm">{label}:</label>
    <input 
      type={type} 
      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:outline-blue-500 transition text-sm"
      value={value || ''}
      onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const InfoRow = ({ label, value, isBox }: any) => (
  <div className="flex items-start">
    <span className="font-bold text-blue-800 w-32 flex-shrink-0 text-sm">{label}:</span>
    {isBox ? <span className="border border-blue-800 text-blue-800 px-2 rounded font-bold text-sm">{value}</span> : <span className="font-medium text-gray-800 text-sm">{value}</span>}
  </div>
);

const ScheduleModals = ({ viewMode, selectedSession, formData, setFormData, setViewMode, handleSave, handleCancel, closeModal }: any) => {
  
  // Helper để convert dd/MM/yyyy sang YYYY-MM-DD cho input date
  const getInputDate = (dateStr?: string) => {
      if(!dateStr) return '';
      const parts = dateStr.split('/');
      if(parts.length !== 3) return '';
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // Helper convert ngược lại khi input change
  const setInputDate = (isoDate: string) => {
      if(!isoDate) return '';
      const parts = isoDate.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <>
      {/* MODAL CHI TIẾT */}
      {viewMode === 'detail' && selectedSession && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl w-[500px] p-6 shadow-2xl relative">
             <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><HiX className="w-6 h-6"/></button>
             <h2 className="text-center text-2xl font-bold text-blue-800 mb-6 font-serif">Chi tiết buổi hỗ trợ</h2>
             <div className="space-y-3 text-gray-700">
               <InfoRow label="Chủ đề" value={selectedSession.subject} />
               <InfoRow label="Thời gian" value={`${selectedSession.date} | ${selectedSession.startTime} - ${selectedSession.endTime}`} />
               <InfoRow label="Hình thức" value={selectedSession.type === 'online' ? 'Trực tuyến' : 'Trực tiếp'} />
               <div className="bg-gray-50 p-3 rounded-lg border">
                  <InfoRow label={selectedSession.type === 'online' ? 'Link' : 'Phòng'} value={selectedSession.location} />
                  {selectedSession.base && <InfoRow label="Cơ sở" value={selectedSession.base} />}
               </div>
               
               <InfoRow label="Trạng thái" value={selectedSession.status === 'open' ? 'Đang mở' : selectedSession.status === 'cancelled' ? 'Đã hủy' : 'Hoàn thành'} />
             </div>
             {selectedSession.status === 'open' && (
                <div className="flex justify-center space-x-3 mt-6">
                    <button onClick={() => { setFormData(selectedSession); setViewMode('edit'); }} className="bg-blue-800 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-900 text-sm">Đổi lịch</button>
                    {/* Tạm ẩn nút hủy đến khi có API */}
                    <button onClick={() => setViewMode('cancel')} className="bg-red-100 text-red-700 font-bold py-2 px-6 rounded-full hover:bg-red-200 text-sm">Hủy buổi</button>
                </div>
             )}
          </div>
        </div>
      )}
      
      {/* MODAL TẠO MỚI / CHỈNH SỬA */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl w-[600px] p-8 shadow-2xl relative">
             <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><HiX className="w-6 h-6"/></button>
             <h2 className="text-center text-2xl font-bold text-blue-800 mb-6 font-serif">{viewMode === 'create' ? 'Tạo buổi mới' : 'Sửa buổi học'}</h2>
             
             <div className="space-y-4">
                <InputGroup label="Chủ đề" value={formData.subject} onChange={(v: string) => setFormData({...formData, subject: v})} placeholder="Nhập tên môn..." />
                
                <div className="flex space-x-4">
                   <div className="flex-1">
                      <label className="block text-blue-800 font-bold mb-1 text-sm ml-4">Ngày</label>
                      <input 
                        type="date" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
                        value={getInputDate(formData.date)} 
                        onChange={e => setFormData({...formData, date: setInputDate(e.target.value)})}
                      />
                   </div>
                   <div className="flex-1">
                      <label className="block text-blue-800 font-bold mb-1 text-sm ml-4">Giờ bắt đầu</label>
                      <input type="time" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50" value={formData.startTime || ''} onChange={e => setFormData({...formData, startTime: e.target.value})}/>
                   </div>
                </div>

                <InputGroup label="Thời lượng" type="number" value={formData.duration} onChange={(v: string) => setFormData({...formData, duration: Number(v)})} placeholder="Phút" />
                
                <div className="flex items-center space-x-4">
                    <label className="font-bold text-blue-800 w-32 flex-shrink-0 text-sm">Hình thức:</label>
                    <select className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-gray-50" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})}>
                        <option value="online">Trực tuyến (Online)</option>
                        <option value="offline">Trực tiếp (Offline)</option>
                    </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                   {formData.type === 'online' ? (
                      <InputGroup label="Link Meet" placeholder="https://..." value={formData.location} onChange={(v: string) => setFormData({...formData, location: v})}/>
                   ) : (
                      <>
                        <InputGroup label="Phòng học" value={formData.location} onChange={(v: string) => setFormData({...formData, location: v})}/>
                        <InputGroup label="Cơ sở" value={formData.base} onChange={(v: string) => setFormData({...formData, base: v})}/>
                      </>
                   )}
                </div>
                <InputGroup label="Số SV tối đa" type="number" value={formData.maxStudents} onChange={(v: string) => setFormData({...formData, maxStudents: Number(v)})} />
             </div>

             <div className="flex justify-center space-x-4 mt-8">
               <button onClick={handleSave} className="bg-blue-800 text-white font-bold py-2 px-8 rounded-full hover:bg-blue-900 shadow-lg">{viewMode === 'create' ? 'Tạo' : 'Lưu'}</button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL HỦY BUỔI - (Đã code khung nhưng chưa kích hoạt nút vì cần route delete) */}
      {viewMode === 'cancel' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in">
           <div className="bg-white rounded-2xl w-96 p-6 relative shadow-2xl text-center">
              <h3 className="text-red-600 font-bold text-xl mb-2">Xác nhận hủy?</h3>
              <p className="text-gray-600 text-sm mb-6">Hành động này không thể hoàn tác.</p>
              <div className="flex justify-center space-x-4">
                 <button onClick={() => setViewMode('detail')} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-full hover:bg-gray-300 text-sm">Quay lại</button>
                 <button onClick={handleCancel} className="bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 text-sm shadow-lg">Hủy ngay</button>
              </div>
           </div>
           
        </div>
      )}

    </>
  );
};