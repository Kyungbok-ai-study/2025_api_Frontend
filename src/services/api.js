import axios from 'axios';

// 일반 API 클라이언트 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 파일 업로드용 API 클라이언트 (타임아웃 연장)
const fileUploadApiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 300000, // 5분 (300초)
  headers: {
    'Content-Type': 'multipart/form-data',
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
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// 두 클라이언트에 인터셉터 적용
setupRequestInterceptor(apiClient);
setupResponseInterceptor(apiClient);
setupRequestInterceptor(fileUploadApiClient);
setupResponseInterceptor(fileUploadApiClient);

// API 함수들
export const campusOnApi = {
  // 인증
  login: (data) => 
    apiClient.post('/auth/login', data),
  
  register: (data) => 
    apiClient.post('/auth/register', data),

  logout: () => 
    apiClient.post('/auth/logout'),

  // 진단 테스트
  getDiagnosisTest: () => 
    apiClient.get('/diagnosis/multi-choice/sample'),
  
  submitDiagnosisTest: (data) => 
    apiClient.post('/diagnosis/submit', data),

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
export { fileUploadApiClient }; 