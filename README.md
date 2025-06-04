# 🎓 CampusON - AI 맞춤형 튜터링 플랫폼

CampusON은 React + TypeScript 기반의 혁신적인 교육 플랫폼입니다. 
AI 기반 맞춤형 학습과 "1문제 30선택지" 진단 테스트를 통해 개인별 최적화된 학습 경험을 제공합니다.

## 🎯 주요 기능

- **🔍 혁신적 진단 테스트**: 1문제 30선택지 방식으로 정확한 수준 진단
- **🤖 AI 맞춤형 학습**: 개인 학습 패턴 분석 및 맞춤형 문제 추천
- **📊 실시간 분석**: 학습 진도와 성과를 실시간으로 추적
- **👨‍🏫 교수 대시보드**: 교수님이 학생들의 학습 현황을 모니터링
- **🏫 학교 정보 연동**: 공공데이터 API를 통한 실제 학교/학과 정보

## 🛠️ 기술 스택

- **프론트엔드**: React 18, TypeScript, Material-UI
- **상태관리**: Zustand
- **API 통신**: Axios, React Query
- **라우팅**: React Router DOM
- **차트**: Chart.js, MUI X Charts
- **백엔드 연동**: FastAPI, PostgreSQL

## 🚀 시작하기

### 1. 프로젝트 클론 및 설치

```bash
git clone <repository-url>
cd campuson-react
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음과 같이 설정하세요:

```env
# 공공데이터포털 API 키 (한국대학교육협의회 대학정보)
REACT_APP_UNIV_API_KEY=발급받은_API_키

# 백엔드 API URL
REACT_APP_API_URL=http://localhost:8000/api

# 개발/프로덕션 환경
REACT_APP_ENV=development
```

### 3. 공공데이터 API 키 발급 방법

1. [공공데이터포털](https://www.data.go.kr) 회원가입
2. "한국대학교육협의회_대학알리미 대학 기본 정보" 검색
3. 활용신청 및 승인 대기 (보통 즉시 승인)
4. 마이페이지에서 발급받은 인증키 확인
5. `.env` 파일에 API 키 설정

### 4. 개발 서버 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Layout.tsx       # 공통 레이아웃
│   ├── LoginSidebar.tsx # 로그인 사이드바
│   └── ProtectedRoute.tsx # 인증된 라우트
├── pages/               # 페이지 컴포넌트
│   ├── LandingPage.tsx  # 메인 랜딩 페이지
│   ├── MultiChoiceDiagnosisTest.tsx # 30선택지 진단 테스트
│   ├── Dashboard.tsx    # 사용자 대시보드
│   └── ProfessorDashboard.tsx # 교수 대시보드
├── services/            # API 서비스
│   ├── api.ts          # 백엔드 API 클라이언트
│   ├── schoolApi.ts    # 학교정보 API 서비스
│   └── authService.ts  # 인증 서비스
├── store/              # Zustand 상태 관리
├── types/              # TypeScript 타입 정의
└── utils/              # 유틸리티 함수
```

## 🎮 주요 화면

### 1. 메인 페이지 (`/`)
- 프로그램 소개와 주요 기능 안내
- 우측 로그인 사이드바
- 회원가입 링크

### 2. 진단 테스트 (`/multi-diagnosis`)
- 1문제 30선택지 방식
- 실시간 타이머 및 자동 저장
- 선택지 제거/복원 기능 (우클릭)
- 확신도 선택

### 3. 대시보드 (`/dashboard`)
- 개인 학습 현황
- AI 추천 문제
- 최근 활동 내역

## 🔧 개발 스크립트

```bash
# 개발 서버 실행
npm start

# 빌드
npm run build

# 테스트 실행
npm test

# 타입 체크
npm run type-check

# ESLint 실행
npm run lint
```

## 📊 API 연동 현황

### 공공데이터 API
- ✅ 한국대학교육협의회 대학 기본정보
- ✅ 대학별 학과정보
- 🔄 기상청 API (예정)

### 백엔드 API
- ✅ 인증 (로그인/회원가입)
- ✅ 진단 테스트 제출
- ✅ 대시보드 데이터
- ✅ AI 분석 서비스
- ✅ 교수 대시보드

## 🎯 다음 단계 개발 계획

### Phase 1: 기본 구조 (완료)
- ✅ 메인 페이지 및 로그인 사이드바
- ✅ 1문제 30선택지 진단 테스트
- ✅ 공공데이터 API 연동
- ✅ 기본 대시보드

### Phase 2: 고급 기능 (진행 중)
- 🔄 단계별 회원가입 프로세스
- 🔄 AI 기반 문제 추천
- 🔄 실시간 학습 분석
- 🔄 모바일 최적화

### Phase 3: 최적화 (예정)
- ⏳ 성능 최적화
- ⏳ 접근성 개선
- ⏳ 테스트 코드 작성
- ⏳ 배포 준비

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 문의: [GitHub Issues](../../issues)

---

**CampusON** - AI가 만드는 스마트한 교육의 미래 🚀
