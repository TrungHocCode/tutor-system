// Mock data cho sinh viên và đánh giá tiến bộ

export interface StudentProgress {
  id: number;
  studentId: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  faculty: string;
  year: string;
  
  // Thông tin học tập
  coursesEnrolled: CourseEnrollment[];
  totalSessions: number;
  averageScore: number | null;
  
  // Đánh giá gần nhất
  latestEvaluation?: Evaluation;
  evaluationHistory: Evaluation[];
}

export interface CourseEnrollment {
  courseId: string;
  courseName: string;
  subject: string;
  sessionsAttended: number;
  totalSessions: number;
  attendanceRate: number;
  startDate: string;
  status: 'active' | 'completed' | 'dropped';
}

export interface Evaluation {
  id: number;
  studentId: string;
  tutorId: string;
  date: string;
  session: string;
  
  // Thông tin sinh viên
  studentName: string;
  studentYear: string;
  studentFaculty: string;
  subject: string;
  
  // Điểm đánh giá (1-5 scale)
  criteria: {
    understanding: number; // Chuẩn bị
    participation: number; // Thái độ
    homework: number; // Kết quả
    progress: number; // Tiến bộ chung
  };
  
  // Ghi chú chi tiết
  notes: string;
  strengths: string;
  improvements: string;
  
  // Tính toán
  averageScore: number;
}

// MOCK DATA - 15 sinh viên với dữ liệu đầy đủ
export const MOCK_STUDENTS: StudentProgress[] = [
  {
    id: 1,
    studentId: "2211234",
    name: "Nguyễn Văn An",
    avatar: "/avatar-placeholder.jpg",
    email: "an.nguyen@hcmut.edu.vn",
    phone: "0901234567",
    faculty: "Khoa học & Kỹ thuật Máy tính",
    year: "K23",
    coursesEnrolled: [
      {
        courseId: "CS101",
        courseName: "Cấu trúc dữ liệu",
        subject: "Lập trình",
        sessionsAttended: 12,
        totalSessions: 15,
        attendanceRate: 80,
        startDate: "2025-09-01",
        status: "active"
      },
      {
        courseId: "CS102",
        courseName: "Giải tích 1",
        subject: "Toán",
        sessionsAttended: 8,
        totalSessions: 8,
        attendanceRate: 100,
        startDate: "2025-08-15",
        status: "completed"
      }
    ],
    totalSessions: 20,
    averageScore: 4.2,
    latestEvaluation: {
      id: 101,
      studentId: "2211234",
      tutorId: "T001",
      date: "2025-11-20",
      session: "Buổi 12",
      studentName: "Nguyễn Văn An",
      studentYear: "K23",
      studentFaculty: "KHMT",
      subject: "Cấu trúc dữ liệu",
      criteria: {
        understanding: 4,
        participation: 5,
        homework: 4,
        progress: 4
      },
      notes: "Em rất tích cực trong giờ học, hiểu bài nhanh",
      strengths: "Logic tốt, code sạch, tư duy thuật toán tốt",
      improvements: "Cần cải thiện kỹ năng debug và tối ưu code",
      averageScore: 4.25
    },
    evaluationHistory: []
  },
  {
    id: 2,
    studentId: "2211567",
    name: "Trần Thị Bình",
    avatar: "/avatar-placeholder.jpg",
    email: "binh.tran@hcmut.edu.vn",
    phone: "0902345678",
    faculty: "Kỹ thuật Điện - Điện tử",
    year: "K22",
    coursesEnrolled: [
      {
        courseId: "EE201",
        courseName: "Mạch điện tử",
        subject: "Điện tử",
        sessionsAttended: 10,
        totalSessions: 12,
        attendanceRate: 83.3,
        startDate: "2025-09-10",
        status: "active"
      }
    ],
    totalSessions: 10,
    averageScore: 4.5,
    latestEvaluation: {
      id: 102,
      studentId: "2211567",
      tutorId: "T001",
      date: "2025-11-18",
      session: "Buổi 10",
      studentName: "Trần Thị Bình",
      studentYear: "K22",
      studentFaculty: "Điện - Điện tử",
      subject: "Mạch điện tử",
      criteria: {
        understanding: 5,
        participation: 4,
        homework: 5,
        progress: 4
      },
      notes: "Em học rất chăm chỉ, luôn chuẩn bị bài kỹ",
      strengths: "Nắm vững lý thuyết, làm bài tập đầy đủ",
      improvements: "Nên tự tin hơn khi trình bày",
      averageScore: 4.5
    },
    evaluationHistory: []
  },
  {
    id: 3,
    studentId: "2210987",
    name: "Lê Hoàng Cường",
    avatar: "/avatar-placeholder.jpg",
    email: "cuong.le@hcmut.edu.vn",
    phone: "0903456789",
    faculty: "Cơ khí",
    year: "K23",
    coursesEnrolled: [
      {
        courseId: "ME101",
        courseName: "Vật lý đại cương",
        subject: "Vật lý",
        sessionsAttended: 15,
        totalSessions: 15,
        attendanceRate: 100,
        startDate: "2025-08-20",
        status: "active"
      },
      {
        courseId: "ME102",
        courseName: "Toán cao cấp",
        subject: "Toán",
        sessionsAttended: 6,
        totalSessions: 10,
        attendanceRate: 60,
        startDate: "2025-10-01",
        status: "active"
      }
    ],
    totalSessions: 21,
    averageScore: 3.8,
    latestEvaluation: {
      id: 103,
      studentId: "2210987",
      tutorId: "T001",
      date: "2025-11-15",
      session: "Buổi 15",
      studentName: "Lê Hoàng Cường",
      studentYear: "K23",
      studentFaculty: "Cơ khí",
      subject: "Vật lý đại cương",
      criteria: {
        understanding: 4,
        participation: 3,
        homework: 4,
        progress: 4
      },
      notes: "Em học ổn, cần tăng tương tác hơn",
      strengths: "Chăm chỉ, hoàn thành bài tập đúng hạn",
      improvements: "Cần chủ động hỏi khi không hiểu",
      averageScore: 3.75
    },
    evaluationHistory: []
  },
  {
    id: 4,
    studentId: "2212345",
    name: "Phạm Minh Đức",
    avatar: "/avatar-placeholder.jpg",
    email: "duc.pham@hcmut.edu.vn",
    phone: "0904567890",
    faculty: "Khoa học & Kỹ thuật Máy tính",
    year: "K23",
    coursesEnrolled: [
      {
        courseId: "CS201",
        courseName: "Thuật toán nâng cao",
        subject: "Lập trình",
        sessionsAttended: 18,
        totalSessions: 20,
        attendanceRate: 90,
        startDate: "2025-09-05",
        status: "active"
      }
    ],
    totalSessions: 18,
    averageScore: 4.7,
    latestEvaluation: {
      id: 104,
      studentId: "2212345",
      tutorId: "T001",
      date: "2025-11-22",
      session: "Buổi 18",
      studentName: "Phạm Minh Đức",
      studentYear: "K23",
      studentFaculty: "KHMT",
      subject: "Thuật toán nâng cao",
      criteria: {
        understanding: 5,
        participation: 5,
        homework: 5,
        progress: 4
      },
      notes: "Học sinh xuất sắc, tiến bộ vượt bậc",
      strengths: "Tư duy logic tốt, sáng tạo trong giải quyết vấn đề",
      improvements: "Tiếp tục phát huy",
      averageScore: 4.75
    },
    evaluationHistory: []
  },
  {
    id: 5,
    studentId: "2213456",
    name: "Võ Thị Hà",
    avatar: "/avatar-placeholder.jpg",
    email: "ha.vo@hcmut.edu.vn",
    phone: "0905678901",
    faculty: "Hóa - Sinh học",
    year: "K22",
    coursesEnrolled: [
      {
        courseId: "CH101",
        courseName: "Hóa đại cương",
        subject: "Hóa học",
        sessionsAttended: 8,
        totalSessions: 10,
        attendanceRate: 80,
        startDate: "2025-10-15",
        status: "active"
      }
    ],
    totalSessions: 8,
    averageScore: 3.9,
    latestEvaluation: {
      id: 105,
      studentId: "2213456",
      tutorId: "T001",
      date: "2025-11-19",
      session: "Buổi 8",
      studentName: "Võ Thị Hà",
      studentYear: "K22",
      studentFaculty: "Hóa - Sinh",
      subject: "Hóa đại cương",
      criteria: {
        understanding: 4,
        participation: 4,
        homework: 4,
        progress: 3
      },
      notes: "Em học tốt, cần thêm thời gian thực hành",
      strengths: "Hiểu lý thuyết tốt, cẩn thận",
      improvements: "Cần rèn luyện kỹ năng thực hành nhiều hơn",
      averageScore: 3.75
    },
    evaluationHistory: []
  },
  {
    id: 6,
    studentId: "2214567",
    name: "Đặng Quốc Khánh",
    avatar: "/avatar-placeholder.jpg",
    email: "khanh.dang@hcmut.edu.vn",
    phone: "0906789012",
    faculty: "Xây dựng",
    year: "K23",
    coursesEnrolled: [
      {
        courseId: "CE101",
        courseName: "Cơ học kết cấu",
        subject: "Xây dựng",
        sessionsAttended: 14,
        totalSessions: 16,
        attendanceRate: 87.5,
        startDate: "2025-09-01",
        status: "active"
      },
      {
        courseId: "CE102",
        courseName: "Vẽ kỹ thuật",
        subject: "Kỹ thuật",
        sessionsAttended: 12,
        totalSessions: 12,
        attendanceRate: 100,
        startDate: "2025-08-25",
        status: "completed"
      }
    ],
    totalSessions: 26,
    averageScore: 4.3,
    latestEvaluation: {
      id: 106,
      studentId: "2214567",
      tutorId: "T001",
      date: "2025-11-21",
      session: "Buổi 14",
      studentName: "Đặng Quốc Khánh",
      studentYear: "K23",
      studentFaculty: "Xây dựng",
      subject: "Cơ học kết cấu",
      criteria: {
        understanding: 4,
        participation: 5,
        homework: 4,
        progress: 4
      },
      notes: "Em rất tích cực, nhiệt tình học hỏi",
      strengths: "Tư duy không gian tốt, kỹ năng vẽ kỹ thuật chính xác",
      improvements: "Cần tập trung hơn vào tính toán",
      averageScore: 4.25
    },
    evaluationHistory: []
  },
  {
    id: 7,
    studentId: "2215678",
    name: "Bùi Thanh Lan",
    avatar: "/avatar-placeholder.jpg",
    email: "lan.bui@hcmut.edu.vn",
    phone: "0907890123",
    faculty: "Quản lý Công nghiệp",
    year: "K22",
    coursesEnrolled: [
      {
        courseId: "IE101",
        courseName: "Quản trị học",
        subject: "Quản lý",
        sessionsAttended: 9,
        totalSessions: 12,
        attendanceRate: 75,
        startDate: "2025-09-20",
        status: "active"
      }
    ],
    totalSessions: 9,
    averageScore: 4.1,
    latestEvaluation: {
      id: 107,
      studentId: "2215678",
      tutorId: "T001",
      date: "2025-11-17",
      session: "Buổi 9",
      studentName: "Bùi Thanh Lan",
      studentYear: "K22",
      studentFaculty: "QL Công nghiệp",
      subject: "Quản trị học",
      criteria: {
        understanding: 4,
        participation: 4,
        homework: 4,
        progress: 5
      },
      notes: "Em có tiến bộ rõ rệt qua các buổi học",
      strengths: "Phân tích tình huống tốt, tư duy hệ thống",
      improvements: "Cần đọc thêm tài liệu mở rộng",
      averageScore: 4.25
    },
    evaluationHistory: []
  },
  {
    id: 8,
    studentId: "2216789",
    name: "Hoàng Văn Minh",
    avatar: "/avatar-placeholder.jpg",
    email: "minh.hoang@hcmut.edu.vn",
    phone: "0908901234",
    faculty: "Khoa học & Kỹ thuật Máy tính",
    year: "K23",
    coursesEnrolled: [
      {
        courseId: "CS103",
        courseName: "Cơ sở dữ liệu",
        subject: "Lập trình",
        sessionsAttended: 11,
        totalSessions: 14,
        attendanceRate: 78.6,
        startDate: "2025-09-12",
        status: "active"
      }
    ],
    totalSessions: 11,
    averageScore: 3.6,
    latestEvaluation: {
      id: 108,
      studentId: "2216789",
      tutorId: "T001",
      date: "2025-11-16",
      session: "Buổi 11",
      studentName: "Hoàng Văn Minh",
      studentYear: "K23",
      studentFaculty: "KHMT",
      subject: "Cơ sở dữ liệu",
      criteria: {
        understanding: 3,
        participation: 4,
        homework: 4,
        progress: 3
      },
      notes: "Em cần tập trung hơn, đôi khi bị mất tập trung",
      strengths: "Làm bài tập đầy đủ, có trách nhiệm",
      improvements: "Cần nắm vững lý thuyết SQL hơn",
      averageScore: 3.5
    },
    evaluationHistory: []
  },
  {
    id: 9,
    studentId: "2217890",
    name: "Ngô Thị Thu",
    avatar: "/avatar-placeholder.jpg",
    email: "thu.ngo@hcmut.edu.vn",
    phone: "0909012345",
    faculty: "Kỹ thuật Địa chất & Dầu khí",
    year: "K22",
    coursesEnrolled: [
      {
        courseId: "GE101",
        courseName: "Địa chất đại cương",
        subject: "Địa chất",
        sessionsAttended: 13,
        totalSessions: 15,
        attendanceRate: 86.7,
        startDate: "2025-09-08",
        status: "active"
      }
    ],
    totalSessions: 13,
    averageScore: 4.4,
    latestEvaluation: {
      id: 109,
      studentId: "2217890",
      tutorId: "T001",
      date: "2025-11-20",
      session: "Buổi 13",
      studentName: "Ngô Thị Thu",
      studentYear: "K22",
      studentFaculty: "Địa chất - Dầu khí",
      subject: "Địa chất đại cương",
      criteria: {
        understanding: 4,
        participation: 5,
        homework: 4,
        progress: 5
      },
      notes: "Em rất xuất sắc, có đam mê với môn học",
      strengths: "Nhiệt tình, tìm tòi học hỏi, đặt câu hỏi hay",
      improvements: "Tiếp tục phát huy",
      averageScore: 4.5
    },
    evaluationHistory: []
  },
  {
    id: 10,
    studentId: "2218901",
    name: "Phan Đức Nam",
    avatar: "/avatar-placeholder.jpg",
    email: "nam.phan@hcmut.edu.vn",
    phone: "0900123456",
    faculty: "Kỹ thuật Giao thông",
    year: "K23",
    coursesEnrolled: [
      {
        courseId: "TE101",
        courseName: "Kỹ thuật giao thông",
        subject: "Giao thông",
        sessionsAttended: 7,
        totalSessions: 10,
        attendanceRate: 70,
        startDate: "2025-10-05",
        status: "active"
      }
    ],
    totalSessions: 7,
    averageScore: 3.5,
    latestEvaluation: {
      id: 110,
      studentId: "2218901",
      tutorId: "T001",
      date: "2025-11-14",
      session: "Buổi 7",
      studentName: "Phan Đức Nam",
      studentYear: "K23",
      studentFaculty: "Giao thông",
      subject: "Kỹ thuật giao thông",
      criteria: {
        understanding: 3,
        participation: 3,
        homework: 4,
        progress: 4
      },
      notes: "Em học khá ổn, cần tăng tương tác",
      strengths: "Chăm chỉ, có trách nhiệm",
      improvements: "Cần tham gia tích cực hơn trong thảo luận",
      averageScore: 3.5
    },
    evaluationHistory: []
  },
  {
    id: 11,
    studentId: "2219012",
    name: "Trương Thị Oanh",
    avatar: "/avatar-placeholder.jpg",
    email: "oanh.truong@hcmut.edu.vn",
    phone: "0901234560",
    faculty: "Môi trường",
    year: "K22",
    coursesEnrolled: [
      {
        courseId: "EN101",
        courseName: "Sinh thái môi trường",
        subject: "Môi trường",
        sessionsAttended: 16,
        totalSessions: 18,
        attendanceRate: 88.9,
        startDate: "2025-08-28",
        status: "active"
      }
    ],
    totalSessions: 16,
    averageScore: 4.6,
    latestEvaluation: {
      id: 111,
      studentId: "2219012",
      tutorId: "T001",
      date: "2025-11-23",
      session: "Buổi 16",
      studentName: "Trương Thị Oanh",
      studentYear: "K22",
      studentFaculty: "Môi trường",
      subject: "Sinh thái môi trường",
      criteria: {
        understanding: 5,
        participation: 5,
        homework: 4,
        progress: 5
      },
      notes: "Học sinh giỏi, có đam mê lớn với môi trường",
      strengths: "Nghiên cứu sâu, có tư duy phản biện tốt",
      improvements: "Tiếp tục duy trì",
      averageScore: 4.75
    },
    evaluationHistory: []
  },
  {
    id: 12,
    studentId: "2210123",
    name: "Lý Minh Phúc",
    avatar: "/avatar-placeholder.jpg",
    email: "phuc.ly@hcmut.edu.vn",
    phone: "0902345671",
    faculty: "Vật liệu",
    year: "K23",
    coursesEnrolled: [
      {
        courseId: "MT101",
        courseName: "Khoa học vật liệu",
        subject: "Vật liệu",
        sessionsAttended: 10,
        totalSessions: 12,
        attendanceRate: 83.3,
        startDate: "2025-09-18",
        status: "active"
      }
    ],
    totalSessions: 10,
    averageScore: 3.9,
    latestEvaluation: {
      id: 112,
      studentId: "2210123",
      tutorId: "T001",
      date: "2025-11-18",
      session: "Buổi 10",
      studentName: "Lý Minh Phúc",
      studentYear: "K23",
      studentFaculty: "Vật liệu",
      subject: "Khoa học vật liệu",
      criteria: {
        understanding: 4,
        participation: 3,
        homework: 4,
        progress: 4
      },
      notes: "Em học tốt nhưng cần chủ động hơn",
      strengths: "Hiểu bài nhanh, làm bài tập tốt",
      improvements: "Cần tham gia thảo luận nhiều hơn",
      averageScore: 3.75
    },
    evaluationHistory: []
  },
  {
    id: 13,
    studentId: "2211345",
    name: "Đỗ Thị Quỳnh",
    avatar: "/avatar-placeholder.jpg",
    email: "quynh.do@hcmut.edu.vn",
    phone: "0903456782",
    faculty: "Kỹ thuật Hóa học",
    year: "K22",
    coursesEnrolled: [
      {
        courseId: "CH201",
        courseName: "Hóa hữu cơ",
        subject: "Hóa học",
        sessionsAttended: 14,
        totalSessions: 16,
        attendanceRate: 87.5,
        startDate: "2025-09-03",
        status: "active"
      },
      {
        courseId: "CH202",
        courseName: "Hóa phân tích",
        subject: "Hóa học",
        sessionsAttended: 5,
        totalSessions: 8,
        attendanceRate: 62.5,
        startDate: "2025-10-20",
        status: "active"
      }
    ],
    totalSessions: 19,
    averageScore: 4.2,
    latestEvaluation: {
      id: 113,
      studentId: "2211345",
      tutorId: "T001",
      date: "2025-11-19",
      session: "Buổi 14",
      studentName: "Đỗ Thị Quỳnh",
      studentYear: "K22",
      studentFaculty: "Hóa học",
      subject: "Hóa hữu cơ",
      criteria: {
        understanding: 4,
        participation: 4,
        homework: 5,
        progress: 4
      },
      notes: "Em học rất chăm chỉ, làm bài tập xuất sắc",
      strengths: "Tỉ mỉ, cẩn thận trong thực hành",
      improvements: "Cần tự tin hơn trong trình bày",
      averageScore: 4.25
    },
    evaluationHistory: []
  },
  {
    id: 14,
    studentId: "2212456",
    name: "Nguyễn Hoàng Sơn",
    avatar: "/avatar-placeholder.jpg",
    email: "son.nguyen@hcmut.edu.vn",
    phone: "0904567893",
    faculty: "Cơ khí - Động lực",
    year: "K23",
    coursesEnrolled: [
      {
        courseId: "ME201",
        courseName: "Nhiệt động lực học",
        subject: "Cơ khí",
        sessionsAttended: 11,
        totalSessions: 14,
        attendanceRate: 78.6,
        startDate: "2025-09-15",
        status: "active"
      }
    ],
    totalSessions: 11,
    averageScore: 3.7,
    latestEvaluation: {
      id: 114,
      studentId: "2212456",
      tutorId: "T001",
      date: "2025-11-17",
      session: "Buổi 11",
      studentName: "Nguyễn Hoàng Sơn",
      studentYear: "K23",
      studentFaculty: "Cơ khí",
      subject: "Nhiệt động lực học",
      criteria: {
        understanding: 3,
        participation: 4,
        homework: 4,
        progress: 4
      },
      notes: "Em học khá ổn, cần nắm vững lý thuyết hơn",
      strengths: "Nhiệt tình, chăm chỉ",
      improvements: "Cần ôn tập lại kiến thức cơ bản",
      averageScore: 3.75
    },
    evaluationHistory: []
  },
  {
    id: 15,
    studentId: "2213567",
    name: "Võ Thị Tuyết",
    avatar: "/avatar-placeholder.jpg",
    email: "tuyet.vo@hcmut.edu.vn",
    phone: "0905678904",
    faculty: "Kỹ thuật Địa chất & Dầu khí",
    year: "K22",
    coursesEnrolled: [
      {
        courseId: "GE201",
        courseName: "Địa vật lý",
        subject: "Địa chất",
        sessionsAttended: 17,
        totalSessions: 18,
        attendanceRate: 94.4,
        startDate: "2025-08-22",
        status: "active"
      }
    ],
    totalSessions: 17,
    averageScore: 4.8,
    latestEvaluation: {
      id: 115,
      studentId: "2213567",
      tutorId: "T001",
      date: "2025-11-24",
      session: "Buổi 17",
      studentName: "Võ Thị Tuyết",
      studentYear: "K22",
      studentFaculty: "Địa chất - Dầu khí",
      subject: "Địa vật lý",
      criteria: {
        understanding: 5,
        participation: 5,
        homework: 5,
        progress: 5
      },
      notes: "Học sinh xuất sắc nhất lớp, luôn đi đầu",
      strengths: "Tư duy sắc bén, hiểu sâu, nghiên cứu tốt",
      improvements: "Hoàn hảo, tiếp tục duy trì",
      averageScore: 5.0
    },
    evaluationHistory: []
  }
];

// Hàm helper để lấy thông tin sinh viên
export const getStudentById = (studentId: string): StudentProgress | undefined => {
  return MOCK_STUDENTS.find(s => s.studentId === studentId);
};

// Hàm helper để tính điểm trung bình của một đánh giá
export const calculateAverageScore = (criteria: Evaluation['criteria']): number => {
  const scores = Object.values(criteria);
  return Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
};

// Thêm evaluation mới vào history
export const addEvaluation = (studentId: string, evaluation: Evaluation): void => {
  const student = MOCK_STUDENTS.find(s => s.studentId === studentId);
  if (student) {
    student.evaluationHistory.unshift(evaluation);
    student.latestEvaluation = evaluation;
    student.averageScore = evaluation.averageScore;
  }
};