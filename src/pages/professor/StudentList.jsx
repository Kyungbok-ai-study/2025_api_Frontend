import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWarnings, setFilterWarnings] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudentList();
  }, [searchTerm, filterWarnings, students]);

  const loadStudents = async () => {
    try {
      const response = await apiClient.get('/professor/students');
      setStudents(response.data.students);
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
      alert('학생 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filterStudentList = () => {
    let filtered = students;

    // 검색어 필터
    if (searchTerm.trim()) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 경고 필터
    if (filterWarnings !== 'all') {
      if (filterWarnings === 'warning') {
        filtered = filtered.filter(student => student.warning_count > 0);
      } else if (filterWarnings === 'no_warning') {
        filtered = filtered.filter(student => student.warning_count === 0);
      }
    }

    setFilteredStudents(filtered);
  };

  const handleStudentDetail = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const getWarningBadge = (warningCount) => {
    if (warningCount === 0) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          정상
        </span>
      );
    } else if (warningCount <= 2) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          주의 {warningCount}건
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          위험 {warningCount}건
        </span>
      );
    }
  };

  const getActivityStatus = (lastActivity) => {
    if (!lastActivity) {
      return (
        <span className="text-xs text-gray-500">활동 없음</span>
      );
    }

    const activityDate = new Date(lastActivity);
    const now = new Date();
    const diffDays = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return (
        <span className="text-xs text-green-600">오늘 활동</span>
      );
    } else if (diffDays <= 3) {
      return (
        <span className="text-xs text-blue-600">{diffDays}일 전</span>
      );
    } else if (diffDays <= 7) {
      return (
        <span className="text-xs text-yellow-600">{diffDays}일 전</span>
      );
    } else {
      return (
        <span className="text-xs text-red-600">{diffDays}일 전</span>
      );
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateTimeString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">학생 목록 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/professor')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← 대시보드로 돌아가기
              </button>
              <h1 className="text-xl font-bold text-gray-900">학생 관리</h1>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{currentUser.school}</span> | 
                  <span className="font-medium"> {currentUser.department}</span> 담당
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">전체 학생</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">
                  {students.length}명
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">정상 학생</div>
                <div className="mt-1 text-2xl font-semibold text-green-600">
                  {students.filter(s => s.warning_count === 0).length}명
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">주의 학생</div>
                <div className="mt-1 text-2xl font-semibold text-yellow-600">
                  {students.filter(s => s.warning_count > 0 && s.warning_count <= 2).length}명
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">위험 학생</div>
                <div className="mt-1 text-2xl font-semibold text-red-600">
                  {students.filter(s => s.warning_count > 2).length}명
                </div>
              </div>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="bg-white shadow rounded-lg mb-6 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="학생 이름, 학번, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <select
                  value={filterWarnings}
                  onChange={(e) => setFilterWarnings(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">전체 학생</option>
                  <option value="no_warning">정상 학생</option>
                  <option value="warning">경고 학생</option>
                </select>
              </div>
            </div>
          </div>

          {/* 학생 목록 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                담당 학생 목록 ({filteredStudents.length}명)
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                같은 학교, 같은 학과의 학생들을 관리하세요.
              </p>
            </div>
            
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">👥</div>
                <p className="text-gray-500">
                  {searchTerm || filterWarnings !== 'all' 
                    ? '검색 조건에 맞는 학생이 없습니다.'
                    : '담당 학생이 없습니다.'
                  }
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <li key={student.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-red-600">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{student.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>📚 {student.user_id}</span>
                              <span>✉️ {student.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4">
                          {getWarningBadge(student.warning_count)}
                          {getActivityStatus(student.last_activity)}
                          {student.last_activity && (
                            <span className="text-xs text-gray-400">
                              마지막 활동: {formatDateTime(student.last_activity)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleStudentDetail(student)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          상세보기
                        </button>
                        {student.warning_count > 0 && (
                          <button className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">
                            경고 관리
                          </button>
                        )}
                        <button className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
                          학습 현황
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* 학생 상세보기 모달 */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">학생 상세 정보</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 기본 정보 */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-xl font-medium text-red-600">
                        {selectedStudent.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedStudent.name}</h3>
                      <p className="text-gray-600">@{selectedStudent.user_id}</p>
                      <p className="text-gray-600">{selectedStudent.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">학교: </span>
                        <span className="text-sm text-gray-900">{currentUser?.school}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">학과: </span>
                        <span className="text-sm text-gray-900">{currentUser?.department}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">경고 수: </span>
                        {getWarningBadge(selectedStudent.warning_count)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">활동 상태: </span>
                        {getActivityStatus(selectedStudent.last_activity)}
                      </div>
                    </div>

                    {selectedStudent.last_activity && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">마지막 활동: </span>
                        <span className="text-sm text-gray-900">
                          {formatDateTime(selectedStudent.last_activity)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 활동 및 경고 요약 */}
              <div className="space-y-6">
                {/* 경고 현황 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-yellow-900 mb-3">경고 현황</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-yellow-700">총 경고:</span>
                      <span className="text-sm font-medium text-yellow-900">
                        {selectedStudent.warning_count}건
                      </span>
                    </div>
                    <div className="text-xs text-yellow-600">
                      {selectedStudent.warning_count > 0 
                        ? '상담 및 관리가 필요합니다.' 
                        : '양호한 상태입니다.'
                      }
                    </div>
                  </div>
                </div>

                {/* 학습 현황 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-blue-900 mb-3">학습 현황</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">진도율:</span>
                      <span className="text-sm font-medium text-blue-900">75%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">평균 점수:</span>
                      <span className="text-sm font-medium text-blue-900">82점</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">제출률:</span>
                      <span className="text-sm font-medium text-blue-900">90%</span>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="space-y-3">
                  <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    학습 현황 상세보기
                  </button>
                  <button className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                    경고 관리
                  </button>
                  <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    상담 기록 작성
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList; 