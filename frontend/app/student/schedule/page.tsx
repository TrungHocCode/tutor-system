"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  HiOutlineSearch, HiLocationMarker, HiClock, HiUser, HiX, 
  HiCheckCircle, HiExclamation, HiCalendar, HiViewList, HiViewBoards, HiFilter 
} from 'react-icons/hi';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday, addDays, parse 
} from 'date-fns';

// --- CONFIG ---
const BASE_URL = 'http://localhost:5000/api/students';

// Interface khớp với dữ liệu sau khi map từ BE
interface Session {
  id: number;
  subject: string;
  tutorName: string;
  date: string;       // dd/MM/yyyy (Hiển thị)
  rawDate: string;    // YYYY-MM-DD (Logic lọc)
  startTime: string;
  endTime: string;
  location: string;
  base?: string;
  currentStudents: number;
  maxStudents: number;
  type: 'online' | 'offline';
  day?: string; // Thứ (Mon, Tue...)
}

export default function StudentSchedulePage() {
  // --- STATE ---
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]); // Lớp có thể đăng ký
  const [mySessions, setMySessions] = useState<Session[]>([]); // Lớp đã đăng ký
  const [loading, setLoading] = useState(true);

  // Filter & View State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<Date | null>(new Date());
  const [viewType, setViewType] = useState<'day' | 'week'>('day');

  // Modal State
  const [modalType, setModalType] = useState<'none' | 'confirm' | 'detail' | 'success' | 'conflict' | 'full' | 'confirm-cancel'>('none');
  const [selectedClass, setSelectedClass] = useState<Session | null>(null);

  // --- API HELPERS ---

  // Hàm map dữ liệu từ Backend (PascalCase/SnakeCase) -> Frontend (CamelCase)
  const mapBeToFe = (item: any): Session => {
    // Xử lý Date: BE trả về chuỗi YYYY-MM-DD hoặc ISO
    const dateStr = typeof item.Date === 'string' ? item.Date.split('T')[0] : '';
    let dateObj = new Date();
    try {
        dateObj = parse(dateStr, 'yyyy-MM-dd', new Date());
    } catch (e) { console.error("Invalid date", dateStr); }
    
    return {
      id: item.SessionID,
      subject: item.Topic,
      // API available trả TutorName, API me trả tutor_name
      tutorName: item.TutorName || item.tutor_name || "Giảng viên",
      date: format(dateObj, 'dd/MM/yyyy'),
      rawDate: dateStr,
      startTime: item.StartTime?.slice(0, 5) || "",
      endTime: item.EndTime?.slice(0, 5) || "",
      location: item.Location,
      base: item.Base,
      // API available trả CurrentStudents, API me trả enrolled_students
      currentStudents: Number(item.CurrentStudents || item.enrolled_students || 0),
      maxStudents: item.MaxStudent,
      type: (item.Format === 'Online' || item.Format === 'online') ? 'online' : 'offline',
      day: format(dateObj, 'EEEE') // Lấy thứ
    };
  };

  // 1. Fetch Dữ liệu
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        return;
    }

    try {
      setLoading(true);
      
      // Gọi song song 2 API: Lớp có sẵn & Lớp của tôi
      const [resAvailable, resMe] = await Promise.all([
         axios.get(`${BASE_URL}/sessions/available`, { headers: { Authorization: `Bearer ${token}` } }),
         axios.get(`${BASE_URL}/sessions/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Map dữ liệu
      setAvailableSessions(resAvailable.data.map(mapBeToFe));
      
      // API /sessions/me trả về { success: true, count: n, data: [...] }
      if (resMe.data.success && Array.isArray(resMe.data.data)) {
          setMySessions(resMe.data.data.map(mapBeToFe));
      }

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      // Không toast lỗi ở đây để tránh spam khi mới load trang nếu chưa có dữ liệu
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // --- LOGIC TÍNH TOÁN (COMPUTED) ---

  // 1. Dữ liệu cho View Tuần
  const currentWeekStart = startOfWeek(filterDate || new Date(), { weekStartsOn: 1 }); 
  const weekDays = Array.from({ length: 7 }).map((_, index) => addDays(currentWeekStart, index));

  // 2. Helper check ngày
  const isClassOnDate = (cls: Session, date: Date | null) => {
    if (!date) return true;
    return cls.rawDate === format(date, 'yyyy-MM-dd'); 
  };

  // 3. Lọc danh sách "Available" (Search)
  // Backend đã lọc sẵn lớp đã đăng ký, nên ở đây chỉ lọc theo từ khóa
  const filteredAvailable = availableSessions.filter(c => {
    const matchesSearch = c.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch; 
  }).sort((a, b) => a.rawDate.localeCompare(b.rawDate) || a.startTime.localeCompare(b.startTime));


  // --- HANDLERS ---

  // Chọn ngày trên lịch
  const handleDateSelect = (date: Date) => {
    setFilterDate(date);
  };

  // Check trùng lịch với lớp ĐÃ ĐĂNG KÝ
  const checkConflict = (newClass: Session) => {
    return mySessions.find(registered => 
        registered.rawDate === newClass.rawDate && 
        (
          (newClass.startTime < registered.endTime && registered.startTime < newClass.endTime)
        )
      );
  };

  const onRegisterClick = (cls: Session) => {
    setSelectedClass(cls);
    if (cls.currentStudents >= cls.maxStudents) { setModalType('full'); return; }
    if (checkConflict(cls)) { setModalType('conflict'); return; }
    setModalType('confirm');
  };

  // API: Xác nhận Đăng ký
  const confirmRegister = async () => {
    if (!selectedClass) return;
    const token = localStorage.getItem('access_token');

    try {
        await axios.post(`${BASE_URL}/sessions/me/${selectedClass.id}/register`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setModalType('success');
        fetchData(); // Tải lại dữ liệu để cập nhật danh sách
    } catch (error: any) {
        const msg = error.response?.data?.error || "Đăng ký thất bại";
        toast.error(msg);
        setModalType('none');
    }
  };

  // API: Xác nhận Hủy
  const confirmCancel = async () => {
    if (!selectedClass) return;
    const token = localStorage.getItem('access_token');

    try {
        await axios.delete(`${BASE_URL}/sessions/me/${selectedClass.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success("Hủy lớp thành công");
        setModalType('none');
        setSelectedClass(null);
        fetchData(); // Tải lại dữ liệu
    } catch (error: any) {
        const msg = error.response?.data?.error || "Không thể hủy lớp";
        toast.error(msg, { duration: 4000 });
        setModalType('detail'); // Quay lại modal chi tiết
    }
  };


  // --- RENDER GIAO DIỆN ---
  return (
    <div className="flex h-full gap-6 relative">
      <Toaster position="top-right" />
      
      {/* === CỘT TRÁI: LỊCH CỦA TÔI === */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        <div className="bg-[#EBF4FF] p-5 rounded-3xl shadow-sm border border-blue-100 flex-shrink-0 flex flex-col max-h-[500px]">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4 px-1">
             <div className="flex items-center gap-2">
                <HiCalendar className="text-blue-600 w-5 h-5"/>
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                  {viewType === 'day' 
                    ? `Lịch ngày ${filterDate ? format(filterDate, 'dd/MM/yyyy') : '...'}`
                    : `Tuần ${format(currentWeekStart, 'dd/MM')} - ${format(endOfWeek(currentWeekStart, {weekStartsOn: 1}), 'dd/MM')}`
                  }
                </h2>
             </div>

             <div className="bg-white p-1 rounded-lg border flex text-xs font-bold shadow-sm">
                <button onClick={() => setViewType('day')} className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${viewType === 'day' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}><HiViewList className="w-3 h-3"/> Ngày</button>
                <button onClick={() => setViewType('week')} className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${viewType === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}><HiViewBoards className="w-3 h-3"/> Tuần</button>
             </div>
          </div>
          
          {/* Nội dung My Sessions */}
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
            {loading ? <div className="text-center text-sm text-gray-500 pt-10">Đang tải lịch học...</div> : (
              <>
                {/* VIEW NGÀY */}
                {viewType === 'day' && (
                  <div className="space-y-3">
                    {mySessions.filter(c => isClassOnDate(c, filterDate)).length > 0 ? (
                      mySessions
                        .filter(c => isClassOnDate(c, filterDate))
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(cls => (
                          <ClassItem key={cls.id} cls={cls} onDetail={() => { setSelectedClass(cls); setModalType('detail'); }} />
                        ))
                    ) : (
                      <EmptyState text="Không có lịch học nào vào ngày này." />
                    )}
                  </div>
                )}

                {/* VIEW TUẦN */}
                {viewType === 'week' && (
                  <div className="space-y-4">
                    {weekDays.map((dayDate, index) => {
                      const dateStr = format(dayDate, 'yyyy-MM-dd');
                      const classesToday = mySessions
                        .filter(c => c.rawDate === dateStr)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime));
                      const isTodayHighlight = isToday(dayDate);

                      return (
                        <div key={index} className={`rounded-xl border ${isTodayHighlight ? 'bg-white border-blue-300 shadow-md ring-1 ring-blue-200' : 'border-transparent'}`}>
                          <div className={`px-3 py-2 text-sm font-bold flex items-center gap-2 ${isTodayHighlight ? 'text-blue-700' : 'text-gray-500'}`}>
                            <span className="w-20">{format(dayDate, 'EEEE')}</span>
                            <span className="opacity-75 font-normal">{format(dayDate, 'dd/MM/yyyy')}</span>
                            {classesToday.length > 0 && <span className="ml-auto bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px]">{classesToday.length} tiết</span>}
                          </div>
                          <div className="space-y-2 px-2 pb-2">
                            {classesToday.length > 0 ? (
                              classesToday.map(cls => (
                                <ClassItem key={cls.id} cls={cls} onDetail={() => { setSelectedClass(cls); setModalType('detail'); }} mini />
                              ))
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* --- CỘT DƯỚI: TÌM & ĐĂNG KÝ (AVAILABLE) --- */}
        <div className="bg-[#475569] p-6 rounded-[32px] flex-1 shadow-lg flex flex-col min-h-0 relative overflow-hidden">
           {/* Decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

           {/* Search */}
           <div className="relative mb-6 flex-shrink-0 z-10">
              <HiOutlineSearch className="absolute left-5 top-4 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Tìm lớp học hoặc Giảng viên..." className="w-full pl-12 pr-4 py-3.5 rounded-full outline-none text-gray-700 font-medium shadow-lg bg-white/95 focus:bg-white transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>

           {/* List Available */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar z-10 pb-4">
              {loading ? <div className="col-span-full text-center text-gray-300 pt-10">Đang tải danh sách...</div> : (
                  <>
                    {filteredAvailable.map(cls => (
                        <div key={cls.id} className="bg-gray-200 p-5 rounded-3xl group hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-gray-900 leading-tight">{cls.subject}</h3>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${cls.type === 'online' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{cls.type}</span>
                        </div>
                        <div className="space-y-2 text-gray-700 text-sm font-medium">
                            <div className="flex items-center"><HiUser className="w-4 h-4 mr-2 opacity-60"/> {cls.tutorName}</div>
                            <div className="flex items-center gap-2"><HiClock className="w-4 h-4 mr-2 opacity-60"/> <span>{cls.startTime} - {cls.endTime}</span></div>
                            <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                <span>{cls.date}</span>
                                <span className={cls.currentStudents >= cls.maxStudents ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                                    {cls.currentStudents}/{cls.maxStudents} chỗ
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => onRegisterClick(cls)} 
                            className="mt-4 w-full bg-black text-white py-2.5 rounded-full font-bold hover:bg-gray-800 shadow-lg transition active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={cls.currentStudents >= cls.maxStudents}
                        >
                            <span>{cls.currentStudents >= cls.maxStudents ? 'Hết chỗ' : 'Đăng ký'}</span>
                            {cls.currentStudents < cls.maxStudents && <HiCheckCircle className="w-4 h-4 opacity-50"/>}
                        </button>
                        </div>
                    ))}
                    {!loading && filteredAvailable.length === 0 && <div className="col-span-full text-center text-gray-300 py-10">Không tìm thấy lớp học phù hợp.</div>}
                  </>
              )}
           </div>
        </div>
      </div>

      {/* === CỘT PHẢI (CALENDAR WIDGET) === */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-6">
         <MiniCalendar selectedDate={filterDate} onDateSelect={handleDateSelect} />
      </div>

      {/* === MODALS === */}
      <ScheduleModals modalType={modalType} setModalType={setModalType} selectedClass={selectedClass} confirmRegister={confirmRegister} confirmCancel={confirmCancel} />
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const ClassItem = ({ cls, onDetail, mini }: { cls: Session, onDetail: () => void, mini?: boolean }) => (
  <div className={`bg-white p-3 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md border border-transparent hover:border-blue-200 transition ${mini ? 'py-2' : ''}`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`flex flex-col items-center justify-center bg-blue-50 rounded-xl border border-blue-100 flex-shrink-0 ${mini ? 'w-12 h-10' : 'w-16 h-12'}`}>
            <span className={`text-blue-900 font-bold ${mini ? 'text-xs' : 'text-sm'}`}>{cls.startTime}</span>
            {!mini && <span className="text-blue-400 text-[10px] font-bold">{cls.day?.substring(0,3)}</span>}
        </div>
        <div className="min-w-0">
            <h3 className={`font-bold text-gray-800 truncate ${mini ? 'text-xs' : 'text-sm'}`}>{cls.subject}</h3>
            <div className="flex items-center text-xs text-gray-500 gap-2 mt-0.5 truncate">
              <span className="flex items-center truncate"><HiUser className="w-3 h-3 mr-1 flex-shrink-0"/>{cls.tutorName}</span>
              {!mini && <span className="flex items-center"><HiLocationMarker className="w-3 h-3 mr-1"/>{cls.location}</span>}
            </div>
        </div>
      </div>
      <button onClick={onDetail} className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-full transition"><HiFilter className="w-4 h-4 rotate-180" /></button>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="text-center py-6 bg-white/50 rounded-2xl border border-dashed border-blue-200">
    <p className="text-gray-500 text-sm italic">{text}</p>
  </div>
);

const MiniCalendar = ({ selectedDate, onDateSelect }: { selectedDate: Date | null, onDateSelect: (d: Date) => void }) => {
   const [viewDate, setViewDate] = useState(new Date());
   const nextMonth = () => setViewDate(addMonths(viewDate, 1));
   const prevMonth = () => setViewDate(subMonths(viewDate, 1));
   const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(viewDate)), end: endOfWeek(endOfMonth(viewDate)) });

   return (
      <div className="bg-[#E5E5E5] p-5 rounded-[32px] shadow-sm select-none">
         <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-2xl font-bold text-black font-serif">{format(viewDate, 'MMMM')}</h2>
            <div className="flex gap-2">
               <button onClick={prevMonth} className="hover:bg-white p-1 rounded transition">◀</button>
               <span className="font-bold text-gray-600 self-center">{format(viewDate, 'yyyy')}</span>
               <button onClick={nextMonth} className="hover:bg-white p-1 rounded transition">▶</button>
            </div>
         </div>
         <div className="bg-[#B91C1C] text-white rounded-xl py-2 px-1 mb-3">
            <div className="grid grid-cols-7 text-center text-xs font-bold uppercase">{['S','M','T','W','T','F','S'].map((d,i)=><div key={i}>{d}</div>)}</div>
         </div>
         <div className="grid grid-cols-7 gap-1.5 text-center">
            {days.map((day, i) => {
               const isSelected = selectedDate && isSameDay(day, selectedDate);
               const isCurrentMonth = isSameMonth(day, viewDate);
               const isTodayDate = isToday(day);
               return (
                  <div key={i} onClick={() => onDateSelect(day)} className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium mx-auto cursor-pointer transition-all ${!isCurrentMonth ? 'text-gray-400 opacity-30' : 'text-gray-700'} ${isSelected ? 'bg-black text-white shadow-lg scale-110' : 'hover:bg-white'} ${!isSelected && isTodayDate ? 'border-2 border-red-600 font-bold text-red-600' : ''}`}>{format(day, 'd')}</div>
               );
            })}
         </div>
         {selectedDate && <div className="text-center mt-4 text-xs text-gray-500">Đang lọc: <span className="font-bold text-black">{format(selectedDate, 'dd/MM/yyyy')}</span></div>}
      </div>
   );
};

const ScheduleModals = ({ modalType, setModalType, selectedClass, confirmRegister, confirmCancel }: any) => {
  if (modalType === 'none') return null;
  const Wrapper = ({ children, title }: any) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in p-4">
      <div className="bg-white rounded-[32px] p-8 w-[500px] shadow-2xl relative animate-scale-up">
         <button onClick={() => setModalType('none')} className="absolute top-5 right-5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full p-2 transition"><HiX className="w-6 h-6"/></button>
         {title && <h2 className="text-center text-3xl font-bold text-blue-900 mb-6 font-serif">{title}</h2>}
         {children}
      </div>
    </div>
  );
  const InfoRow = ({ label, value, isBox, isDate, highlight }: any) => (
    <div className="flex items-center mb-3">
      <span className="font-bold text-blue-900 w-28 flex-shrink-0 text-sm uppercase tracking-wide opacity-80">{label}</span>
      {isBox ? <span className="border-2 border-blue-900 text-blue-900 px-3 py-0.5 rounded-lg font-bold tracking-widest bg-blue-50">{value}</span> : isDate ? <span className="font-bold text-blue-900 tracking-widest border-2 border-blue-200 bg-blue-50 px-2 rounded-lg">{value}</span> : <span className={`font-medium text-lg ${highlight ? 'text-black font-bold' : 'text-gray-700'}`}>{value}</span>}
    </div>
  );

  return (
    <>
      {modalType === 'confirm' && selectedClass && (
        <Wrapper>
           <div className="text-center"><h3 className="text-blue-900 font-bold text-2xl mb-2 font-serif">Xác nhận đăng ký?</h3><p className="text-gray-600 mb-8">Bạn có chắc chắn muốn đăng ký lớp <br/><span className="font-bold text-black">{selectedClass.subject}</span> không?</p><div className="flex justify-center gap-4"><button onClick={confirmRegister} className="bg-blue-800 text-white font-bold py-3 px-8 rounded-full shadow-lg">Xác nhận</button><button onClick={() => setModalType('none')} className="bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg">Hủy</button></div></div>
        </Wrapper>
      )}
      {modalType === 'success' && (<div className="fixed bottom-6 right-6 z-50 animate-bounce-in bg-[#DCFCE7] border border-green-400 text-green-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"><HiCheckCircle className="w-8 h-8 text-green-600"/><div><h4 className="font-bold text-lg">Thành công</h4><p className="text-sm">Đăng ký thành công!</p></div><button onClick={() => setModalType('none')}><HiX className="w-5 h-5"/></button></div>)}
      {modalType === 'conflict' && (<div className="fixed bottom-6 right-6 z-50 animate-bounce-in bg-[#FEF9C3] border border-yellow-400 text-yellow-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"><HiExclamation className="w-8 h-8 text-yellow-600"/><div><h4 className="font-bold text-lg">Cảnh báo</h4><p className="text-sm">Trùng lịch học!</p></div><button onClick={() => setModalType('none')}><HiX className="w-5 h-5"/></button></div>)}
      {modalType === 'full' && (<div className="fixed bottom-6 right-6 z-50 animate-bounce-in bg-red-100 border border-red-400 text-red-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"><HiExclamation className="w-8 h-8 text-white bg-red-500 rounded-full p-1"/><div><h4 className="font-bold text-lg">Lớp đầy</h4><p className="text-sm">Sĩ số đã đủ.</p></div><button onClick={() => setModalType('none')}><HiX className="w-5 h-5"/></button></div>)}
      {modalType === 'detail' && selectedClass && (
        <Wrapper title="Chi tiết buổi học">
           <div className="space-y-4 text-gray-700 px-2">
                <InfoRow label="Chủ đề" value={selectedClass.subject} />
                <InfoRow label="Tutor" value={selectedClass.tutorName} highlight />
                <div className="flex gap-4">
                    <InfoRow label="Ngày" value={selectedClass.date} isDate />
                    <InfoRow label="Giờ" value={`${selectedClass.startTime}`} isBox />
                </div>
                <InfoRow label="Hình thức" value={selectedClass.type} />
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <InfoRow label="Địa điểm" value={selectedClass.location} />
                    {selectedClass.base && <InfoRow label="Cơ sở" value={`Cơ sở ${selectedClass.base}`} />}
                </div>
                <InfoRow label="Trạng thái" value={`${selectedClass.currentStudents}/${selectedClass.maxStudents} học viên`} />
            </div>
            <div className="mt-8 flex justify-center">
                <button onClick={() => setModalType('confirm-cancel')} className="bg-red-100 text-red-600 font-bold py-3 px-10 rounded-full hover:bg-red-200">Hủy đăng ký</button>
            </div>
        </Wrapper>
      )}
      {modalType === 'confirm-cancel' && (<Wrapper><div className="text-center pt-2"><h3 className="text-blue-900 font-bold text-2xl mb-2 font-serif">Xác nhận hủy?</h3><p className="text-gray-600 mb-8 px-6">Bạn có chắc chắn muốn hủy đăng ký buổi học này không?</p><div className="flex justify-center gap-4"><button onClick={confirmCancel} className="bg-blue-800 text-white font-bold py-3 px-8 rounded-full shadow-lg">Xác nhận</button><button onClick={() => setModalType('detail')} className="bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg">Giữ lại</button></div></div></Wrapper>)}
    </>
  );
};