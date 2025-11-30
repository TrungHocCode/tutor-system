"use client";

import { useState, useMemo } from 'react';
import { HiSearch, HiFilter, HiSortAscending, HiSortDescending, HiChartBar } from 'react-icons/hi';
import StudentCard from '@/components/StudentCard';
import EvaluationModal from '@/components/EvaluationModal';
import { MOCK_STUDENTS, StudentProgress, Evaluation, addEvaluation } from '@/components/mockStudentData';

export default function TutorProgressPage() {
  const [students] = useState<StudentProgress[]>(MOCK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'sessions'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterFaculty, setFilterFaculty] = useState<string>('all');

  // Lấy danh sách khoa duy nhất
  const faculties = useMemo(() => {
    const uniqueFaculties = Array.from(new Set(students.map(s => s.faculty)));
    return ['all', ...uniqueFaculties];
  }, [students]);

  // Lọc và sắp xếp sinh viên
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchFaculty = filterFaculty === 'all' || student.faculty === filterFaculty;
      
      return matchSearch && matchFaculty;
    });

    // Sắp xếp
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'name') {
        compareValue = a.name.localeCompare(b.name, 'vi');
      } else if (sortBy === 'score') {
        compareValue = (a.averageScore || 0) - (b.averageScore || 0);
      } else if (sortBy === 'sessions') {
        compareValue = a.totalSessions - b.totalSessions;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [students, searchQuery, sortBy, sortOrder, filterFaculty]);

  // Thống kê tổng quan
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const avgScore = students.reduce((sum, s) => sum + (s.averageScore || 0), 0) / totalStudents;
    const totalSessions = students.reduce((sum, s) => sum + s.totalSessions, 0);
    const excellentStudents = students.filter(s => (s.averageScore || 0) >= 4.5).length;
    
    return {
      totalStudents,
      avgScore: avgScore.toFixed(2),
      totalSessions,
      excellentStudents
    };
  }, [students]);

  const handleEvaluate = (student: StudentProgress) => {
    setSelectedStudent(student);
    setShowEvaluationModal(true);
  };

  const handleSaveEvaluation = (evaluation: Evaluation) => {
    if (selectedStudent) {
      addEvaluation(selectedStudent.studentId, evaluation);
      setShowEvaluationModal(false);
      setSelectedStudent(null);
      // Có thể thêm refresh data ở đây nếu cần
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      
      {/* Header với thống kê */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Theo dõi tiến bộ sinh viên</h1>
            <p className="text-blue-100">Quản lý và đánh giá học tập của sinh viên</p>
          </div>
          <HiChartBar className="w-16 h-16 text-blue-200 opacity-50" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-blue-100 text-sm mb-1">Tổng sinh viên</div>
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-blue-100 text-sm mb-1">Điểm TB</div>
            <div className="text-3xl font-bold">{stats.avgScore}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-blue-100 text-sm mb-1">Tổng buổi học</div>
            <div className="text-3xl font-bold">{stats.totalSessions}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-blue-100 text-sm mb-1">Sinh viên xuất sắc</div>
            <div className="text-3xl font-bold">{stats.excellentStudents}</div>
          </div>
        </div>
      </div>

      {/* Thanh công cụ */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center space-x-4">
          
          {/* Tìm kiếm */}
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, MSSV, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            />
          </div>

          {/* Lọc theo khoa */}
          <div className="flex items-center space-x-2">
            <HiFilter className="w-5 h-5 text-gray-500" />
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-600"
            >
              <option value="all">Tất cả khoa</option>
              {faculties.filter(f => f !== 'all').map(faculty => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-600"
            >
              <option value="name">Tên</option>
              <option value="score">Điểm</option>
              <option value="sessions">Số buổi</option>
            </select>
            
            <button
              onClick={toggleSort}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {sortOrder === 'asc' ? (
                <HiSortAscending className="w-5 h-5 text-gray-600" />
              ) : (
                <HiSortDescending className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Hiển thị số kết quả */}
        <div className="mt-3 text-sm text-gray-600">
          Hiển thị <span className="font-bold text-blue-600">{filteredStudents.length}</span> / {students.length} sinh viên
        </div>
      </div>

      {/* Danh sách sinh viên */}
      <div className="flex-1 overflow-y-auto">
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredStudents.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                onEvaluate={() => handleEvaluate(student)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy sinh viên</h3>
            <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>

      {/* Modal đánh giá */}
      {showEvaluationModal && selectedStudent && (
        <EvaluationModal
          studentId={selectedStudent.studentId}
          studentName={selectedStudent.name}
          studentYear={selectedStudent.year}
          studentFaculty={selectedStudent.faculty}
          subject={selectedStudent.latestEvaluation?.subject || selectedStudent.coursesEnrolled[0]?.subject || 'Chưa có lớp'}
          onClose={() => {
            setShowEvaluationModal(false);
            setSelectedStudent(null);
          }}
          onSave={handleSaveEvaluation}
        />
      )}
    </div>
  );
}