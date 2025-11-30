"use client";

import { useState } from 'react';
import Image from 'next/image';
import { HiStar } from 'react-icons/hi';
import { StudentProgress } from './mockStudentData';

interface StudentCardProps {
  student: StudentProgress;
  onEvaluate: () => void;
}

export default function StudentCard({ student, onEvaluate }: StudentCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Tính tổng số buổi và rate tham gia
  const totalAttended = student.coursesEnrolled.reduce((sum, c) => sum + c.sessionsAttended, 0);
  const totalSessions = student.coursesEnrolled.reduce((sum, c) => sum + c.totalSessions, 0);
  const attendanceRate = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 0;

  // Màu sắc theo điểm
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-blue-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBg = (score: number | null) => {
    if (score === null) return 'bg-gray-50';
    if (score >= 4.5) return 'bg-green-50';
    if (score >= 4.0) return 'bg-blue-50';
    if (score >= 3.5) return 'bg-yellow-50';
    return 'bg-orange-50';
  };

  return (
    <div className="relative group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 border border-gray-100 hover:border-blue-200">
        
        {/* Header with Avatar */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <Image
              src={student.avatar}
              alt={student.name}
              width={60}
              height={60}
              className="rounded-full border-2 border-blue-100"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 text-lg truncate">{student.name}</h3>
            <p className="text-sm text-gray-500 truncate">{student.studentId}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {student.year}
              </span>
              <span className="text-xs text-gray-500 truncate">{student.faculty}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Số lớp đang học */}
          <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-3">
            <div className="text-xs text-purple-600 font-medium mb-1">Lớp đang học</div>
            <div className="text-2xl font-bold text-purple-700">
              {student.coursesEnrolled.filter(c => c.status === 'active').length}
            </div>
          </div>

          {/* Số buổi tham gia */}
          <div 
            className="bg-linear-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 cursor-pointer hover:scale-105 transition-transform"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className="text-xs text-indigo-600 font-medium mb-1">Buổi tham gia</div>
            <div className="text-2xl font-bold text-indigo-700">
              {totalAttended}
              <span className="text-sm font-normal text-indigo-500 ml-1">/{totalSessions}</span>
            </div>
            <div className="text-xs text-indigo-500 mt-1">
              {attendanceRate}% tham dự
            </div>
          </div>
        </div>

        {/* Score */}
        <div className={`${getScoreBg(student.averageScore)} rounded-lg p-3 mb-4`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Điểm trung bình</span>
            <div className="flex items-center space-x-1">
              <HiStar className={`w-4 h-4 ${getScoreColor(student.averageScore)} fill-current`} />
              <span className={`text-xl font-bold ${getScoreColor(student.averageScore)}`}>
                {student.averageScore?.toFixed(1) || 'N/A'}
              </span>
              <span className="text-sm text-gray-400">/5.0</span>
            </div>
          </div>
        </div>

        {/* Latest Subject */}
        {student.latestEvaluation && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-500 mb-1">Đánh giá gần nhất</div>
            <div className="font-medium text-gray-800 text-sm truncate">
              {student.latestEvaluation.subject}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {student.latestEvaluation.date}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onEvaluate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Đánh giá
        </button>

      </div>

      {/* Tooltip - Chi tiết các lớp */}
      {showTooltip && student.coursesEnrolled.length > 0 && (
        <div className="absolute left-full top-0 ml-4 z-50 w-80 animate-fade-in">
          <div className="bg-gray-900 text-white rounded-xl shadow-2xl p-4 border border-gray-700">
            <h4 className="font-bold text-sm mb-3 text-blue-300">Chi tiết lớp học</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {student.coursesEnrolled.map((course, idx) => (
                <div 
                  key={idx}
                  className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-bold text-sm text-white mb-1">{course.courseName}</h5>
                      <p className="text-xs text-gray-400">{course.subject}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      course.status === 'active' ? 'bg-green-900 text-green-300' :
                      course.status === 'completed' ? 'bg-blue-900 text-blue-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {course.status === 'active' ? 'Đang học' :
                       course.status === 'completed' ? 'Hoàn thành' : 'Đã bỏ'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Tham gia:</span>
                      <span className="text-white font-bold ml-1">
                        {course.sessionsAttended}/{course.totalSessions}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tỷ lệ:</span>
                      <span className="text-white font-bold ml-1">
                        {course.attendanceRate}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          course.attendanceRate >= 80 ? 'bg-green-500' :
                          course.attendanceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${course.attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSS for custom scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}