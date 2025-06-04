// 학교 정보 API 서비스 (공공데이터포털 연동)

export interface School {
  id: string;
  name: string;
  address: string;
  establishmentType: string;
  region: string;
  schoolType?: string;
  code?: string;
}

export interface Department {
  id: string;
  name: string;
  schoolId: string;
  category: string;
  stdClftMjrId?: string;
  clgNm?: string;
}

// 실제 공공데이터 API 응답 타입
interface ApiResponse<T> {
  resultCode: string;
  resultMsg: string;
  numOfRows: number;
  pageNo: number;
  totalCount: number;
  items?: {
    item?: T[];
  };
}

interface SchoolApiItem {
  schlId: string;
  schlKrnNm: string;
  adres: string;
  estblSe: string;
  siSdoNm: string;
  schlKnd: string;
}

interface DepartmentApiItem {
  schlId: string;
  schlNm: string;
  korMjrNm: string;
  clgNm: string;
  stdClftMjrId: string;
  mjrAreaNm: string;
  pbnfDgriCrseDivNm: string;
}

export const schoolApi = {
  // 한국대학교육협의회 대학정보 API (실제 구현)
  async getSchools(query?: string): Promise<School[]> {
    try {
      // API 키 - 실제 배포 시에는 환경변수 사용
      const apiKey = process.env.REACT_APP_UNIV_API_KEY || 'Kgn3NZtSyDOE51%2FjW0cW8kkX7Yxvga%2FZ%2FdrpGvn%2B0m5IBqRV9UCKO%2BXRxFXWwKNHPsRUqzPFW6CdTSHbYln2Kw%3D%3D';
      
      // 실제 API 호출
      const baseUrl = 'http://openapi.academyinfo.go.kr/openapi/service/rest/BasicInformationService';
      const endpoint = '/getSchoolList';
      
      const params = new URLSearchParams({
        serviceKey: decodeURIComponent(apiKey),
        pageNo: '1',
        numOfRows: '100',
        // 추가 필터 파라미터들
        ...(query && { schlKrnNm: query })
      });

      const response = await fetch(`${baseUrl}${endpoint}?${params}`);
      
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data: ApiResponse<SchoolApiItem> = await response.json();
      
      if (data.resultCode !== '00') {
        throw new Error(`API 오류: ${data.resultMsg}`);
      }

      // API 응답을 School 타입으로 변환
      const schools: School[] = data.items?.item?.map(item => ({
        id: item.schlId,
        name: item.schlKrnNm,
        address: item.adres || '',
        establishmentType: item.estblSe || '사립',
        region: item.siSdoNm || '',
        schoolType: item.schlKnd || '대학교',
        code: item.schlId,
      })) || [];

      return schools;

    } catch (error) {
      console.error('실제 API 호출 실패, 목업 데이터 사용:', error);
      
      // API 실패 시 목업 데이터 반환
      const mockSchools: School[] = [
        {
          id: '1',
          name: '경복대학교',
          address: '경기도 포천시',
          establishmentType: '사립',
          region: '경기',
          schoolType: '대학교',
          code: '0000001',
        },
        {
          id: '2',
          name: '서울대학교',
          address: '서울시 관악구',
          establishmentType: '국립',
          region: '서울',
          schoolType: '대학교',
          code: '0000002',
        },
        {
          id: '3',
          name: '연세대학교',
          address: '서울시 서대문구',
          establishmentType: '사립',
          region: '서울',
          schoolType: '대학교',
          code: '0000003',
        },
        {
          id: '4',
          name: '고려대학교',
          address: '서울시 성북구',
          establishmentType: '사립',
          region: '서울',
          schoolType: '대학교',
          code: '0000004',
        },
        {
          id: '5',
          name: '성균관대학교',
          address: '서울시 종로구',
          establishmentType: '사립',
          region: '서울',
          schoolType: '대학교',
          code: '0000005',
        },
        {
          id: '6',
          name: '한양대학교',
          address: '서울시 성동구',
          establishmentType: '사립',
          region: '서울',
          schoolType: '대학교',
          code: '0000006',
        },
        {
          id: '7',
          name: '중앙대학교',
          address: '서울시 동작구',
          establishmentType: '사립',
          region: '서울',
          schoolType: '대학교',
          code: '0000007',
        },
        {
          id: '8',
          name: '경희대학교',
          address: '서울시 동대문구',
          establishmentType: '사립',
          region: '서울',
          schoolType: '대학교',
          code: '0000008',
        },
        {
          id: '9',
          name: '부산대학교',
          address: '부산시 금정구',
          establishmentType: '국립',
          region: '부산',
          schoolType: '대학교',
          code: '0000009',
        },
        {
          id: '10',
          name: '전남대학교',
          address: '광주시 북구',
          establishmentType: '국립',
          region: '광주',
          schoolType: '대학교',
          code: '0000010',
        },
      ];

      // 검색 필터링
      if (query) {
        return mockSchools.filter(school => 
          school.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      return mockSchools;
    }
  },

  async getDepartments(schoolId: string): Promise<Department[]> {
    try {
      // API 키
      const apiKey = process.env.REACT_APP_UNIV_API_KEY || 'Kgn3NZtSyDOE51%2FjW0cW8kkX7Yxvga%2FZ%2FdrpGvn%2B0m5IBqRV9UCKO%2BXRxFXWwKNHPsRUqzPFW6CdTSHbYln2Kw%3D%3D';
      
      // 실제 학과정보 API 호출
      const baseUrl = 'http://openapi.academyinfo.go.kr/openapi/service/rest/SchoolMajorInfoService';
      const endpoint = '/getSchoolMajorInfo';
      
      const params = new URLSearchParams({
        serviceKey: decodeURIComponent(apiKey),
        pageNo: '1',
        numOfRows: '500',
        svyYr: '2024', // 조사년도
        schlId: schoolId.padStart(7, '0'), // 학교코드는 7자리로 패딩
      });

      const response = await fetch(`${baseUrl}${endpoint}?${params}`);
      
      if (!response.ok) {
        throw new Error(`학과정보 API 요청 실패: ${response.status}`);
      }

      const data: ApiResponse<DepartmentApiItem> = await response.json();
      
      if (data.resultCode !== '00') {
        throw new Error(`학과정보 API 오류: ${data.resultMsg}`);
      }

      // API 응답을 Department 타입으로 변환
      const departments: Department[] = data.items?.item?.map(item => ({
        id: item.stdClftMjrId || Math.random().toString(),
        name: item.korMjrNm,
        schoolId: item.schlId,
        category: this.getDepartmentCategory(item.korMjrNm),
        stdClftMjrId: item.stdClftMjrId,
        clgNm: item.clgNm,
      })) || [];

      return departments;

    } catch (error) {
      console.error('학과정보 API 호출 실패, 목업 데이터 사용:', error);
      
      // API 실패 시 목업 데이터 반환
      const mockDepartments: { [key: string]: Department[] } = {
        '1': [ // 경복대학교
          { id: '1-1', name: '빅데이터과', schoolId: '1', category: '공학' },
          { id: '1-2', name: '컴퓨터소프트웨어과', schoolId: '1', category: '공학' },
          { id: '1-3', name: '간호학과', schoolId: '1', category: '의학' },
          { id: '1-4', name: '유아교육과', schoolId: '1', category: '교육' },
          { id: '1-5', name: '경영학과', schoolId: '1', category: '경영' },
          { id: '1-6', name: '관광경영과', schoolId: '1', category: '경영' },
        ],
        '2': [ // 서울대학교
          { id: '2-1', name: '컴퓨터공학부', schoolId: '2', category: '공학' },
          { id: '2-2', name: '전기정보공학부', schoolId: '2', category: '공학' },
          { id: '2-3', name: '기계공학부', schoolId: '2', category: '공학' },
          { id: '2-4', name: '경영학과', schoolId: '2', category: '경영' },
          { id: '2-5', name: '의학과', schoolId: '2', category: '의학' },
        ],
        '3': [ // 연세대학교
          { id: '3-1', name: '컴퓨터과학과', schoolId: '3', category: '공학' },
          { id: '3-2', name: '전기전자공학과', schoolId: '3', category: '공학' },
          { id: '3-3', name: '경영학과', schoolId: '3', category: '경영' },
          { id: '3-4', name: '의학과', schoolId: '3', category: '의학' },
        ],
      };

      return mockDepartments[schoolId] || [];
    }
  },

  // 학과명으로 카테고리 분류
  getDepartmentCategory(departmentName: string): string {
    const categories: { [key: string]: string[] } = {
      '공학': ['컴퓨터', '전기', '전자', '기계', '화학', '토목', '건축', '산업', '소프트웨어', '빅데이터', 'IT', '정보', '공학'],
      '의학': ['의학', '간호', '치의학', '한의학', '수의학', '약학', '보건'],
      '경영': ['경영', '경제', '회계', '마케팅', '무역', '금융', '경제', '상경'],
      '교육': ['교육', '유아교육', '초등교육', '체육교육'],
      '인문': ['국어', '영어', '문학', '역사', '철학', '종교'],
      '사회': ['사회', '정치', '행정', '법학', '심리', '사회복지'],
      '자연': ['수학', '물리', '화학', '생물', '지구과학', '통계'],
      '예체능': ['음악', '미술', '체육', '무용', '연극', '영화'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => departmentName.includes(keyword))) {
        return category;
      }
    }

    return '기타';
  },

  // 입학 연도 목록 생성
  getAdmissionYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // 현재 연도부터 10년 전까지
    for (let year = currentYear; year >= currentYear - 10; year--) {
      years.push(year);
    }
    
    return years;
  },

  // 학년 목록
  getGrades(): number[] {
    return [1, 2, 3, 4];
  },

  // 지역별 학교 필터링
  getSchoolsByRegion(schools: School[], region: string): School[] {
    return schools.filter(school => school.region === region);
  },

  // 설립 유형별 학교 필터링
  getSchoolsByType(schools: School[], type: string): School[] {
    return schools.filter(school => school.establishmentType === type);
  },

  // 환경변수 설정 가이드
  getApiKeySetupGuide(): string {
    return `
      환경변수 설정 방법:
      1. 프로젝트 루트에 .env 파일 생성
      2. REACT_APP_UNIV_API_KEY=발급받은_API_키 추가
      3. .gitignore에 .env 파일 추가하여 보안 유지
    `;
  },
};

export default schoolApi; 