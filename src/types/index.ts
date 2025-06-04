// User Types
export interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  school: string;
  department: string;
  phone: string;
  role: 'student' | 'professor' | 'admin';
  createdAt: string;
}

export interface LoginRequest {
  studentId: string;
  password: string;
}

export interface RegisterRequest {
  studentId: string;
  name: string;
  email: string;
  password: string;
  school: string;
  department: string;
  phone: string;
  grade?: number;
  admissionYear?: number;
}

// Problem Types
export interface Problem {
  id: string;
  content: string;
  options: string[];
  answer: string;
  difficulty: 1 | 2 | 3; // 쉬움=1, 보통=2, 어려움=3
  subject: string;
  type: string;
  tags: string[];
}

// Test Types
export interface TestSession {
  id: string;
  userId: string;
  subject: string;
  totalProblems: number;
  startTime: string;
  endTime?: string;
  isCompleted: boolean;
  learningLevel?: number;
}

export interface TestResponse {
  id: string;
  sessionId: string;
  problemId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  answeredAt: string;
}

// Dashboard Types
export interface LearningStats {
  totalProblems: number;
  correctAnswers: number;
  averageTime: number;
  learningLevel: number;
  recentSessions: TestSession[];
  subjectStats: SubjectStat[];
}

export interface SubjectStat {
  subject: string;
  totalProblems: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
} 