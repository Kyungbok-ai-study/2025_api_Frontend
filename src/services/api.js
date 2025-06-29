import axios from 'axios';

// API 기본 URL 설정 (환경별 자동 감지)
const getApiBaseUrl = () => {
  // 프로덕션 환경에서는 환경변수 사용
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 개발 환경 자동 감지
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  
  // 프로덕션에서 직접 백엔드 URL 사용
  return 'https://2025backend-f1zll9bfq-gabrieljung0727s-projects.vercel.app';
};

// 일반 API 클라이언트 설정
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 파일 업로드용 API 클라이언트 (타임아웃 연장)
const fileUploadApiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 300000, // 5분 (300초)
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// 공개 API 클라이언트 (회원가입, 학교 검색 등 인증이 필요 없는 API용)
const publicApiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 공통 요청 인터셉터 함수
const setupRequestInterceptor = (client) => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// 공통 응답 인터셉터 함수
const setupResponseInterceptor = (client) => {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // 회원가입 페이지에서는 자동 리다이렉트 하지 않음
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/register')) {
          console.log('회원가입 페이지에서 401 에러 - 리다이렉트 안 함');
          return Promise.reject(error);
        }
        
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// 인증이 필요한 클라이언트에만 인터셉터 적용
setupRequestInterceptor(apiClient);
setupResponseInterceptor(apiClient);
setupRequestInterceptor(fileUploadApiClient);
setupResponseInterceptor(fileUploadApiClient);

// 공개 API 클라이언트에는 응답 인터셉터만 적용 (인증 토큰은 제외)
setupResponseInterceptor(publicApiClient);

// API 함수들
export const campusOnApi = {
  // 인증
  login: (data) => 
    apiClient.post('/auth/login', data),
  
  register: (data) => 
    apiClient.post('/auth/register', data),

  logout: () => 
    apiClient.post('/auth/logout'),

  // 진단 테스트 (기존)
  getDiagnosisTest: () => 
    apiClient.get('/diagnosis/multi-choice/sample'),
  
  submitDiagnosisTest: (data) => 
    apiClient.post('/diagnosis/submit', data),

  // 학과별 진단테스트 (새로운 API)
  // 사용자의 학과에 맞는 진단테스트 목록 조회
  getMyAvailableTests: () =>
    apiClient.get('/diagnosis/v1/my-tests'),
  
  // 추천 진단테스트 조회
  getRecommendedTests: () =>
    apiClient.get('/diagnosis/v1/recommended'),
  
  // 특정 학과의 진단테스트 목록 조회
  getDepartmentTests: (department) =>
    apiClient.get(`/diagnosis/v1/departments/${encodeURIComponent(department)}`),
  
  // 진단테스트 시작
  startDiagnosisTest: (testId) =>
    apiClient.post(`/diagnosis/v1/tests/${testId}/start`),
  
  // 진단 세션 정보 조회
  getDiagnosisSession: (sessionId) =>
    apiClient.get(`/diagnosis/v1/sessions/${sessionId}`),
  
  // 진단테스트 히스토리 조회
  getMyDiagnosisHistory: (params = {}) =>
    apiClient.get('/diagnosis/v1/my-history', { params }),
  
  // 개인 성과 분석 조회
  getMyPerformanceAnalysis: (days = 30) =>
    apiClient.get(`/diagnosis/v1/my-performance?days=${days}`),

  // 대시보드
  getDashboard: () => 
    apiClient.get('/dashboard/overview'),
  
  getProgress: (params) => 
    apiClient.get('/dashboard/progress', { params }),

  getStudyPlan: (weeks = 4) => 
    apiClient.get(`/dashboard/study-plan?weeks=${weeks}`),

  // AI 서비스
  getRecommendations: (limit = 10, type = 'all') => 
    apiClient.get(`/dashboard/recommendations?limit=${limit}&type=${type}`),
  
  getAIAnalysis: () => 
    apiClient.get('/ai/analyze/learning-pattern'),

  getPerformancePrediction: (subject, days = 30) => 
    apiClient.get(`/ai/predict/performance?subject=${subject}&prediction_days=${days}`),

  // 교수 대시보드
  getProfessorDashboard: () => 
    apiClient.get('/professor/dashboard'),

  getStudentProgress: (classId, sort, filter) => 
    apiClient.get('/professor/students/progress', { 
      params: { class_id: classId, sort, filter } 
    }),

  createAssignment: (assignmentData) => 
    apiClient.post('/professor/assignment', assignmentData),

  // 보안
  getLoginAnalysis: () => 
    apiClient.get('/security/analyze/login'),

  setup2FA: (method = 'totp') => 
    apiClient.post(`/security/2fa/setup?method=${method}`),

  verify2FA: (token) => 
    apiClient.post('/security/2fa/verify', { token }),

  // 문제 풀이
  getProblems: (params) => 
    apiClient.get('/problems', { params }),

  submitProblem: (problemId, answer) => 
    apiClient.post(`/problems/${problemId}/submit`, { answer }),

  // 사용자 정보
  getUserProfile: () => 
    apiClient.get('/user/profile'),

  updateUserProfile: (data) => 
    apiClient.put('/user/profile', data),
};

export default apiClient;
export { fileUploadApiClient, publicApiClient }; 