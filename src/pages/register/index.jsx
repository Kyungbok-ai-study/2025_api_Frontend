import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApiClient } from '../../services/api.js';
import useResponsive from '../../hooks/useResponsive';

const RegisterStep1 = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  
  const [formData, setFormData] = useState({
    admissionYear: '',
    school: null
  });
  
  const [schoolSearch, setSchoolSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularSchools, setPopularSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // 반응형 스타일
  const containerWidth = isMobile ? '90%' : isTablet ? '80%' : '500px';
  const fontSize = isMobile ? '14px' : '16px';
  const inputHeight = isMobile ? '45px' : '50px';

  // 입학연도 옵션 생성 (현재년도 기준으로 ±10년)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear + 1; i >= currentYear - 10; i--) {
      years.push(i);
    }
    return years;
  };

  // 기본 학교 데이터 (백엔드 연결 실패 시 사용)
  const getDefaultSchools = () => [
    {"school_name": "서울대학교", "school_code": "SCH_001", "area_name": "서울특별시", "school_type": "국립대학교"},
    {"school_name": "연세대학교", "school_code": "SCH_002", "area_name": "서울특별시", "school_type": "사립대학교"},
    {"school_name": "고려대학교", "school_code": "SCH_003", "area_name": "서울특별시", "school_type": "사립대학교"},
    {"school_name": "성균관대학교", "school_code": "SCH_004", "area_name": "서울특별시", "school_type": "사립대학교"},
    {"school_name": "한양대학교", "school_code": "SCH_005", "area_name": "서울특별시", "school_type": "사립대학교"},
    {"school_name": "중앙대학교", "school_code": "SCH_006", "area_name": "서울특별시", "school_type": "사립대학교"},
    {"school_name": "경희대학교", "school_code": "SCH_007", "area_name": "서울특별시", "school_type": "사립대학교"},
    {"school_name": "부산대학교", "school_code": "SCH_008", "area_name": "부산광역시", "school_type": "국립대학교"},
    {"school_name": "경복대학교", "school_code": "SCH_009", "area_name": "경기도", "school_type": "전문대학"},
    {"school_name": "가천대학교", "school_code": "SCH_010", "area_name": "경기도", "school_type": "사립대학교"}
  ];

  // 인기 학교 목록 로드 - 완전 오프라인 모드
  useEffect(() => {
    // API 호출 없이 즉시 기본 데이터 사용
    console.log('[오프라인 모드] 기본 학교 데이터 로드');
    setPopularSchools(getDefaultSchools());
  }, []);

  // 한글 초성 추출 함수
  const getInitialConsonants = (str) => {
    const initials = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    let result = '';
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const code = char.charCodeAt(0);
      
      if (code >= 0xAC00 && code <= 0xD7A3) {
        // 한글 완성형 문자
        const initialIndex = Math.floor((code - 0xAC00) / 588);
        result += initials[initialIndex];
      } else if (initials.includes(char)) {
        // 이미 초성인 경우
        result += char;
      } else {
        // 한글이 아닌 경우 그대로 추가
        result += char;
      }
    }
    
    return result;
  };

  // 검색어 매칭 함수
  const isMatchingSearch = (schoolName, searchTerm) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const lowerSchoolName = schoolName.toLowerCase();
    
    console.log(`[매칭 검사] 학교명: ${schoolName}, 검색어: ${searchTerm}`);
    
    // 1. 직접 포함 검사
    if (lowerSchoolName.includes(lowerSearchTerm)) {
      console.log(`[매칭 검사] 직접 포함 매칭 성공`);
      return true;
    }
    
    // 2. 초성 검사
    const schoolInitials = getInitialConsonants(schoolName);
    const searchInitials = getInitialConsonants(searchTerm);
    
    console.log(`[매칭 검사] 학교 초성: ${schoolInitials}, 검색 초성: ${searchInitials}`);
    
    if (schoolInitials.includes(searchInitials)) {
      console.log(`[매칭 검사] 초성 매칭 성공`);
      return true;
    }
    
    // 3. 부분 매칭 (한글자씩)
    for (let i = 0; i <= schoolName.length - searchTerm.length; i++) {
      const substring = schoolName.substring(i, i + searchTerm.length);
      if (getInitialConsonants(substring) === searchInitials) {
        console.log(`[매칭 검사] 부분 초성 매칭 성공`);
        return true;
      }
    }
    
    console.log(`[매칭 검사] 매칭 실패`);
    return false;
  };

  // 학교 검색 - 완전 오프라인 모드
  const handleSchoolSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    
    // API 호출 없이 즉시 로컬 검색 수행
    console.log('[오프라인 모드] 로컬 검색 수행:', query);
    performLocalSearch(query);
    
    setSearchLoading(false);
  };

  // 로컬 데이터에서 학교 검색
  const performLocalSearch = (query) => {
    const allSchools = [...getDefaultSchools(), ...popularSchools];
    const uniqueSchools = allSchools.filter((school, index, self) => 
      index === self.findIndex(s => s.school_name === school.school_name)
    );
    
    const results = uniqueSchools.filter(school => 
      isMatchingSearch(school.school_name, query)
    );
    
    console.log('[로컬 검색] 검색어:', query);
    console.log('[로컬 검색] 결과:', results);
    
    setSearchResults(results.slice(0, 20)); // 상위 20개만 표시
  };

  // 검색어 변경 핸들러 (디바운싱 시간 단축)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (schoolSearch) {
        handleSchoolSearch(schoolSearch);
      }
    }, 300); // 500ms에서 300ms로 단축

    return () => clearTimeout(timer);
  }, [schoolSearch]);

  // 검색 결과 변경 추적 (디버깅용)
  useEffect(() => {
    console.log('[상태 변경] searchResults가 변경됨:', searchResults);
    console.log('[상태 변경] searchResults 길이:', searchResults.length);
  }, [searchResults]);

  // 학교 선택
  const handleSchoolSelect = (school) => {
    setFormData(prev => ({ ...prev, school }));
    // 선택한 학교명과 현재 검색어가 다를 때만 업데이트
    if (schoolSearch !== school.school_name) {
      setSchoolSearch(school.school_name);
    }
    setSearchResults([]);
  };

  // 다음 단계로
  const handleNext = () => {
    if (!formData.admissionYear || !formData.school) {
      alert('입학연도와 학교를 모두 선택해주세요.');
      return;
    }

    // 데이터를 localStorage에 저장
    localStorage.setItem('registerData', JSON.stringify(formData));
    navigate('/register/dept');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'AppleSDGothicNeoB00'
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8"
        style={{ width: containerWidth, maxWidth: '500px' }}
      >
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">회원가입</h1>
          <p className="text-gray-600" style={{ fontSize }}>
            1단계: 입학연도 및 학교 선택
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 입학연도 선택 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" style={{ fontSize }}>
            입학연도
          </label>
          <select
            value={formData.admissionYear}
            onChange={(e) => setFormData(prev => ({ ...prev, admissionYear: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ height: inputHeight, fontSize }}
          >
            <option value="">입학연도를 선택하세요</option>
            {generateYearOptions().map(year => (
              <option key={year} value={year}>{year}학번</option>
            ))}
          </select>
        </div>

        {/* 학교 검색 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" style={{ fontSize }}>
            학교 검색
          </label>
          <div className="relative">
            <input
              type="text"
              value={schoolSearch}
              onChange={(e) => {
                setSchoolSearch(e.target.value);
                // 입력값이 변경되면 선택된 학교 초기화
                if (formData.school && e.target.value !== formData.school.school_name) {
                  setFormData(prev => ({ ...prev, school: null }));
                }
              }}
              placeholder="학교명을 입력하세요"
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
          {searchResults.length > 0 && !formData.school && (
            <div className="mt-3 max-h-60 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-lg" style={{ position: 'relative', zIndex: 10 }}>
              {console.log('[검색 결과 표시] searchResults:', searchResults)}
              {searchResults.map((school, index) => (
                <div
                  key={index}
                  onClick={() => handleSchoolSelect(school)}
                  className="px-4 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-base">{school.school_name}</div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{school.area_name}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{school.school_type}</span>
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

        {/* 선택된 학교 표시 */}
        {formData.school && (
          <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-blue-900 text-lg">{formData.school.school_name}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">{formData.school.area_name}</span>
                    <span className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-sm font-medium">{formData.school.school_type}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, school: null }));
                  setSchoolSearch('');
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
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
              <div className="text-xs text-gray-600 mb-1">✅ 선택 완료</div>
              <div className="text-sm text-gray-700">다음 단계로 진행하여 학과를 선택해주세요.</div>
            </div>
          </div>
        )}

        {/* 인기 학교 목록 */}
        {!schoolSearch && !formData.school && popularSchools.length > 0 && (
          <div className="mt-6">
            <h3 className="text-gray-700 font-semibold mb-4 flex items-center" style={{ fontSize }}>
              <span className="mr-2">🔥</span>
              인기 학교
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {popularSchools.slice(0, 8).map((school, index) => (
                <button
                  key={index}
                  onClick={() => handleSchoolSelect(school)}
                  className="text-left px-4 py-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-200 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{school.school_name}</div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{school.area_name}</span>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                <span className="text-yellow-600 mr-2">💡</span>
                <p className="text-sm text-yellow-700">
                  <strong>검색 팁:</strong> 학교명의 첫 글자나 초성만 입력해도 검색됩니다
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 검색 결과가 없을 때 도움말 */}
        {schoolSearch && searchResults.length === 0 && !searchLoading && (
          <div className="mt-4 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-yellow-700 mb-3 font-semibold">검색 결과가 없습니다</div>
              <div className="text-sm text-yellow-600 mb-4">
                다음과 같이 검색해보세요:
              </div>
              <div className="text-sm text-yellow-600 space-y-2 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="px-3 py-1 bg-yellow-100 rounded-full">예시:</span>
                  <span>'서울' → 서울대학교, 서울과기대 등</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="px-3 py-1 bg-yellow-100 rounded-full">초성:</span>
                  <span>'ㄱ' → 고려대, 경희대 등</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="px-3 py-1 bg-yellow-100 rounded-full">줄임말:</span>
                  <span>'연대' → 연세대학교</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSchoolSearch('');
                  setSearchResults([]);
                }}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
              >
                인기 학교 목록 보기
              </button>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ fontSize }}
          >
            취소
          </button>
          <button
            onClick={handleNext}
            disabled={!formData.admissionYear || !formData.school}
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

export default RegisterStep1; 