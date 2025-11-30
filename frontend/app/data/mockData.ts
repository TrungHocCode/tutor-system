// --- 1. DỮ LIỆU LỚP HỌC (Dùng cho cả Student và Tutor) ---
export const MOCK_CLASSES = [
  {
    id: 1,
    title: "Công nghệ phần mềm",
    code: "CO3001",
    base: "2",
    room: "H6 - 702",
    time: "15h - 17h",
    tutorName: "Lương Ngọc Trung",
    studentCount: 45,
    status: "ongoing", // đang học
    type: "student" // Lớp này user đang học
  },
  {
    id: 2,
    title: "Cấu trúc rời rạc",
    code: "CO1007",
    base: "2",
    room: "H3 - 201",
    time: "07h - 09h",
    tutorName: "Nguyễn Văn A",
    studentCount: 30,
    status: "ongoing",
    type: "student"
  },
  {
    id: 3,
    title: "Lập trình Web",
    code: "CO3005",
    base: "1",
    room: "B1 - 304",
    time: "13h - 15h",
    tutorName: "Me", // Lớp này user đang DẠY
    studentCount: 20,
    status: "teaching",
    type: "tutor"
  }
];

// --- 2. DỮ LIỆU THỐNG KÊ (Cho Admin) ---
export const MOCK_STATS = {
  students: [6500, 3800, 3800, 3800], // Số liệu biểu đồ cột
  tutors: [4800, 6500, 6500, 6500],
  feedback: {
    good: 75,
    bad: 25
  }
};

// --- 3. DỮ LIỆU USER (Cho Profile) ---
export const MOCK_USER_PROFILE = {
  name: "Lương Ngọc Trung",
  role: "Tutor",
  id: "2110123",
  email: "trung.deptrai@hcmut.edu.vn",
  faculty: "Khoa học & Kỹ thuật Máy tính",
  avatar: "/avatar-placeholder.png"
};

// --- 4. DỮ LIỆU LỊCH DẠY (SCHEDULE) ---
// ... (Các phần trên giữ nguyên)

export type Session = {
  id: number;
  subject: string;
  tutorName: string; // <-- THÊM TRƯỜNG NÀY
  day: string;
  period: 'morning' | 'afternoon' | 'evening';
  date: string;
  startTime: string;
  endTime: string; // <-- THÊM ĐỂ CHECK TRÙNG LỊCH DỄ HƠN
  duration: number;
  type: 'online' | 'offline';
  location: string;
  base?: string;
  maxStudents: number;
  currentStudents: number; // <-- Số lượng đã đăng ký
  status: 'open' | 'finished' | 'cancelled';
};

export const MOCK_SCHEDULE: Session[] = [
  {
    id: 1,
    subject: "Cấu trúc rời rạc",
    tutorName: "Mai Đức Trung",
    day: "Tue",
    period: "afternoon",
    date: "19/08/2025",
    startTime: "15:00",
    endTime: "17:00",
    duration: 120,
    type: "offline",
    location: "H6 - 201",
    base: "2",
    maxStudents: 40,
    currentStudents: 36,
    status: "open"
  },
  {
    id: 2,
    subject: "Giải tích 2",
    tutorName: "Nguyễn Văn A",
    day: "Tue",
    period: "afternoon",
    date: "19/08/2025", // TRÙNG GIỜ VỚI ID 1 (Để test trùng lịch)
    startTime: "15:00",
    endTime: "17:00",
    duration: 120,
    type: "offline",
    location: "H1 - 304",
    base: "1",
    maxStudents: 40,
    currentStudents: 10,
    status: "open"
  },
  {
    id: 3,
    subject: "PPL",
    tutorName: "Trần Thị B",
    day: "Wed",
    period: "morning",
    date: "20/08/2025",
    startTime: "09:00",
    endTime: "11:00",
    duration: 120,
    type: "offline",
    location: "A2 - 203",
    base: "1",
    maxStudents: 40,
    currentStudents: 2,
    status: "open"
  },
  {
    id: 4,
    subject: "Hệ thống số",
    tutorName: "Mai Đức Trung",
    day: "Thu",
    period: "morning",
    date: "21/08/2025",
    startTime: "08:00",
    endTime: "10:00",
    duration: 120,
    type: "online",
    location: "Google Meet",
    maxStudents: 50,
    currentStudents: 45,
    status: "open"
  }
];

export type Community = {
  id: number;
  name: string;
  members: number;
  isJoined: boolean;
  cover: string;
  category: string;
  description: string;
};

export const MOCK_COMMUNITIES: Community[] = [
  { id: 1, name: "Hội đồng hương 36", members: 1200, isJoined: true, cover: "/group-1.jpg", category: "Đồng hương", description: "Nơi giao lưu anh em Thanh Hóa" },
  { id: 2, name: "Nhóm tấu hài BK", members: 36000, isJoined: false, cover: "/group-2.jpg", category: "Giải trí", description: "Stress thì vào đây" },
  { id: 3, name: "Góc học tập K23", members: 500, isJoined: false, cover: "/group-3.jpg", category: "Học tập", description: "Chia sẻ tài liệu K23" },
  { id: 4, name: "Anti rớt môn", members: 9000, isJoined: true, cover: "/group-4.jpg", category: "Học tập", description: "Quyết tâm A+" },
  { id: 5, name: "CLB Guitar", members: 150, isJoined: false, cover: "/group-5.jpg", category: "Nghệ thuật", description: "Yêu âm nhạc" },
];

// --- 7. DỮ LIỆU TIN NHẮN (CHAT) ---
export type ChatMessage = {
  id: number;
  groupId: number; // Tin nhắn thuộc nhóm nào
  sender: string;
  text: string;
  isMe: boolean;
  timestamp: string;
};

export const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, groupId: 1, sender: "Quê 36", text: "Hello mọi người", isMe: false, timestamp: "10:00" },
  { id: 2, groupId: 1, sender: "Trung", text: "Chào anh em nhé", isMe: true, timestamp: "10:05" },
  { id: 3, groupId: 1, sender: "Nam", text: "Cuối tuần đá bóng không?", isMe: false, timestamp: "10:10" },
  { id: 4, groupId: 4, sender: "Minh", text: "Ai có slide Giải tích 2 chương 3 không?", isMe: false, timestamp: "08:00" },
  { id: 5, groupId: 4, sender: "Trung", text: "Để tớ gửi lên thư viện cho", isMe: true, timestamp: "08:15" },
];