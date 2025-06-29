import axios from 'axios';

// API 기본 URL 설정 (환경별 자동 감지)
const getApiBaseUrl = (): string => {
  // 프로덕션 환경에서는 환경변수 사용
  if ((import.meta as any).env?.VITE_API_BASE_URL) {
    return (import.meta as any).env.VITE_API_BASE_URL;
  }
  
  // 개발 환경 자동 감지
  if ((import.meta as any).env?.DEV) {
    return 'http://localhost:8000';
  }
  
  // 프로덕션 기본값 (실제 배포 후 수정 필요)
  return '/api';
};

// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 자동 추가)
apiClient.interceptors.request.use(
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

// 응답 인터셉터 (토큰 만료 처리)
apiClient.interceptors.response.use(
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

// 타입 정의
export interface LoginRequest {
  studentId: string;
  password: string;
}

export interface RegisterRequest {
  school: string;
  department: string;
  grade: number;
  studentId: string;
  password: string;
  name: string;
}

export interface DiagnosisSubmission {
  userId?: string;
  selectedChoice: number | null;
  eliminatedChoices: number[];
  confidenceLevel: 'low' | 'medium' | 'high';
  timeSpentSeconds: number;
  question: string;
  choices: any[];
  timestamp: string;
}

export interface ProgressParams {
  period_days?: number;
  subject?: string;
}

// API 함수들
export const campusOnApi = {
  // 인증
  login: (data: LoginRequest) => 
    apiClient.post('/auth/login', data),
  
  register: (data: RegisterRequest) => 
    apiClient.post('/auth/register', data),

  logout: () => 
    apiClient.post('/auth/logout'),

  // 진단 테스트
  getDiagnosisTest: () => 
    apiClient.get('/diagnosis/multi-choice/sample'),
  
  submitDiagnosisTest: (data: DiagnosisSubmission) => 
    apiClient.post('/diagnosis/submit', data),

  // 대시보드
  getDashboard: () => 
    apiClient.get('/dashboard/overview'),
  
  getProgress: (params?: ProgressParams) => 
    apiClient.get('/dashboard/progress', { params }),

  getStudyPlan: (weeks: number = 4) => 
    apiClient.get(`/dashboard/study-plan?weeks=${weeks}`),

  // AI 서비스
  getRecommendations: (limit: number = 10, type: string = 'all') => 
    apiClient.get(`/dashboard/recommendations?limit=${limit}&type=${type}`),
  
  getAIAnalysis: () => 
    apiClient.get('/ai/analyze/learning-pattern'),

  getPerformancePrediction: (subject: string, days: number = 30) => 
    apiClient.get(`/ai/predict/performance?subject=${subject}&prediction_days=${days}`),

  // 교수 대시보드
  getProfessorDashboard: () => 
    apiClient.get('/professor/dashboard'),

  getStudentProgress: (classId?: number, sort?: string, filter?: string) => 
    apiClient.get('/professor/students/progress', { 
      params: { class_id: classId, sort, filter } 
    }),

  createAssignment: (assignmentData: any) => 
    apiClient.post('/professor/assignment', assignmentData),

  // 보안
  getLoginAnalysis: () => 
    apiClient.get('/security/analyze/login'),

  setup2FA: (method: string = 'totp') => 
    apiClient.post(`/security/2fa/setup?method=${method}`),

  verify2FA: (token: string) => 
    apiClient.post('/security/2fa/verify', { token }),

  // 문제 풀이
  getProblems: (params?: any) => 
    apiClient.get('/problems', { params }),

  submitProblem: (problemId: string, answer: any) => 
    apiClient.post(`/problems/${problemId}/submit`, { answer }),

  // 사용자 정보
  getUserProfile: () => 
    apiClient.get('/user/profile'),

  updateUserProfile: (data: any) => 
    apiClient.put('/user/profile', data),
};

export default apiClient; 