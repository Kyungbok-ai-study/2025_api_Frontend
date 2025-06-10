import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api.js';
import useResponsive from '../../hooks/useResponsive';

const RegisterStep2 = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  
  const [registerData, setRegisterData] = useState(null);
  const [allDepartments, setAllDepartments] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // 반응형 스타일
  const containerWidth = isMobile ? '90%' : isTablet ? '80%' : '600px';
  const fontSize = isMobile ? '14px' : '16px';
  const inputHeight = isMobile ? '45px' : '50px';

  // 이전 단계 데이터 확인 및 학과 정보 로드
  useEffect(() => {
    const savedData = localStorage.getItem('registerData');
    if (!savedData) {
      navigate('/register');
      return;
    }

    const data = JSON.parse(savedData);
    setRegisterData(data);
    loadDepartments(data.school.school_name);
  }, [navigate]);

  // 학과 정보 로드
  const loadDepartments = async (schoolName) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/schools/${encodeURIComponent(schoolName)}/departments`);
      if (response.data.success) {
        const deptData = response.data.data.departments;
        setAllDepartments(deptData);
      }
    } catch (error) {
      console.error('학과 정보 로드 실패:', error);
      alert('학과 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 학과 검색
  const handleDepartmentSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // 학과 검색 API 호출
      const response = await apiClient.get(
        `/schools/${encodeURIComponent(registerData.school.school_name)}/departments?query=${encodeURIComponent(query)}`
      );
      
      if (response.data.success) {
        setSearchResults(response.data.data.departments);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('학과 검색 실패:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 검색어 변경 핸들러 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleDepartmentSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 학과 선택
  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setSearchTerm(department.department_name);
    setSearchResults([]);
  };

  // 다음 단계로
  const handleNext = () => {
    if (!selectedDepartment) {
      alert('학과를 선택해주세요.');
      return;
    }

    const updatedData = {
      ...registerData,
      department: selectedDepartment
    };

    localStorage.setItem('registerData', JSON.stringify(updatedData));
    navigate('/register/agreement');
  };

  // 이전 단계로
  const handleBack = () => {
    navigate('/register');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">학과 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-8"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'AppleSDGothicNeoB00'
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8"
        style={{ width: containerWidth, maxWidth: '600px' }}
      >
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">회원가입</h1>
          <p className="text-gray-600" style={{ fontSize }}>
            2단계: 학과 선택
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 선택된 학교 정보 */}
        {registerData && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-purple-900">{registerData.school.school_name}</div>
                <div className="text-sm text-purple-700">{registerData.admissionYear}학번 • {registerData.school.area_name}</div>
              </div>
            </div>
          </div>
        )}

        {/* 학과 검색 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" style={{ fontSize }}>
            학과 검색
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // 입력값이 변경되면 선택된 학과 초기화
                if (selectedDepartment && e.target.value !== selectedDepartment.department_name) {
                  setSelectedDepartment(null);
                }
              }}
              placeholder="학과명을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ height: inputHeight, fontSize }}
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* 검색 결과 */}
          {searchResults.length > 0 && !selectedDepartment && (
            <div className="mt-3 max-h-60 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-lg">
              {searchResults.map((dept, index) => (
                <div
                  key={index}
                  onClick={() => handleDepartmentSelect(dept)}
                  className="px-4 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-base">{dept.department_name}</div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{dept.degree_course}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{dept.study_period}</span>
                        {dept.department_characteristic && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            {dept.department_characteristic}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 선택된 학과 표시 */}
        {selectedDepartment && (
          <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-green-900 text-lg">{selectedDepartment.department_name}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                      {selectedDepartment.degree_course}
                    </span>
                    <span className="px-3 py-1 bg-emerald-200 text-emerald-800 rounded-full text-sm font-medium">
                      {selectedDepartment.study_period}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDepartment(null);
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="w-8 h-8 bg-red-100 text-red-600 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors duration-200"
                title="선택 취소"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-3 p-3 bg-white rounded-lg border border-green-100">
              <div className="text-xs text-gray-600 mb-1">✅ 선택 완료</div>
              <div className="text-sm text-gray-700">다음 단계로 진행하여 약관에 동의해주세요.</div>
            </div>
          </div>
        )}

        {/* 인기 학과 또는 전체 학과 목록 */}
        {!searchTerm && !selectedDepartment && allDepartments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-gray-700 font-semibold mb-4 flex items-center" style={{ fontSize }}>
              <span className="mr-2">📚</span>
              전체 학과 ({allDepartments.length}개)
            </h3>
            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-xl">
              {allDepartments.slice(0, 20).map((dept, index) => (
                <div
                  key={index}
                  onClick={() => handleDepartmentSelect(dept)}
                  className="px-4 py-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{dept.department_name}</div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{dept.degree_course}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{dept.study_period}</span>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {allDepartments.length > 20 && (
              <div className="mt-3 text-center text-sm text-gray-500">
                더 많은 학과를 보려면 검색을 이용해주세요
              </div>
            )}
          </div>
        )}

        {/* 검색 팁 */}
        {!searchTerm && !selectedDepartment && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
              <span className="text-yellow-600 mr-2">💡</span>
              <p className="text-sm text-yellow-700">
                <strong>검색 팁:</strong> 학과명의 일부만 입력해도 검색됩니다
              </p>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex space-x-4">
          <button
            onClick={handleBack}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ fontSize }}
          >
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedDepartment}
            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            style={{ fontSize }}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep2; 