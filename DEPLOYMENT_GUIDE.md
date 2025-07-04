# CampusON 프론트엔드 배포 가이드

## 문제 해결 완료 사항

### 1. 프론트엔드 글자 표시 문제 해결
- HTML `lang` 속성을 `"ko"`로 변경
- UTF-8 인코딩 메타 태그 추가
- 한글 폰트 스택 개선 (시스템 폰트 폴백 추가)
- nginx 설정에 `charset utf-8` 추가

### 2. 학교 검색 기능 문제 해결
- API URL을 환경에 따라 동적으로 설정
  - 개발 환경: `http://localhost:8000/api`
  - 프로덕션 환경: 현재 도메인 기반 URL 사용
- nginx 프록시 설정 확인
- 에러 처리 및 디버깅 로그 개선

## 🚨 **배포 전 필수 체크리스트**

### 1. 하드코딩된 URL 확인

현재 프로젝트는 환경변수를 사용하지 않고 동적으로 URL을 설정합니다:
- 개발 환경: `http://localhost:8000/api`
- 프로덕션 환경: 현재 도메인 기반 자동 설정

### 2. 보안 설정 확인

백엔드의 경우 모든 환경변수에 기본값이 설정되어 있지만, 프로덕션에서는 변경 권장:
- [ ] JWT 시크릿 키 변경 (선택사항)
- [ ] 데이터베이스 자격증명 확인
- [ ] CORS 설정이 프로덕션 도메인 포함 확인

### 3. 프로덕션 최적화

- [ ] console.log 제거됨 (빌드 시 자동 제거)
- [ ] nginx 설정이 올바른 도메인으로 설정됨
- [ ] 빌드 최적화 설정 확인

## 배포 전 확인사항

### 1. 백엔드 서버 확인
```bash
# 백엔드 서버가 실행 중인지 확인
sudo systemctl status campuson-backend

# 백엔드 API 테스트
curl http://localhost:8000/api/schools/popular
```

### 2. nginx 설정 확인
```bash
# nginx 설정 테스트
sudo nginx -t

# nginx 상태 확인
sudo systemctl status nginx
```

### 3. 환경변수 파일 생성 (중요!)
프로덕션 서버에서 환경변수 파일을 생성해야 합니다:

```bash
# .env.production 파일 생성
cat > .env.production << EOF
# 프로덕션 환경 설정
VITE_API_URL=https://www.kbu-ai-tutor.kr
VITE_APP_ENV=production
EOF
```

**중요**: 이제 프로필 이미지 URL 생성 시 환경변수 `VITE_API_URL`을 사용하도록 변경되었으므로,
반드시 이 파일을 생성해야 합니다.

## 배포 절차

### 1. 프론트엔드 빌드 및 배포
```bash
# 프로젝트 디렉토리로 이동
cd /path/to/2025_api_Frontend

# 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh
```

### 2. 수동 배포 (필요시)
```bash
# 1. 의존성 설치
npm install

# 2. 프로덕션 빌드
NODE_ENV=production npm run build

# 3. 빌드 파일 복사
sudo rm -rf /var/www/campuson-frontend/*
sudo cp -r dist/* /var/www/campuson-frontend/

# 4. 권한 설정
sudo chown -R www-data:www-data /var/www/campuson-frontend
sudo chmod -R 755 /var/www/campuson-frontend

# 5. nginx 설정 업데이트
sudo cp nginx.conf /etc/nginx/sites-available/campuson-frontend

# 6. nginx 재시작
sudo nginx -t && sudo systemctl reload nginx
```

## 배포 후 확인사항

### 1. 웹사이트 접속 테스트
- https://kbu-ai-tutor.kr 접속
- 한글 표시 정상 여부 확인
- 학교 검색 기능 테스트

### 2. 브라우저 콘솔 확인
- F12 개발자 도구 열기
- Console 탭에서 에러 확인
- Network 탭에서 API 호출 확인

### 3. API 연결 확인
```javascript
// 브라우저 콘솔에서 직접 테스트
fetch('/api/schools/popular')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## 트러블슈팅

### 1. 한글이 깨져서 보이는 경우
- 브라우저 캐시 삭제 (Ctrl+F5)
- nginx 캐시 클리어: `sudo rm -rf /var/cache/nginx/*`

### 2. 학교 검색이 작동하지 않는 경우
- 백엔드 서버 실행 확인
- nginx 프록시 설정 확인
- 브라우저 개발자 도구에서 네트워크 에러 확인

### 3. CORS 에러가 발생하는 경우
- 백엔드 CORS 설정 확인
- nginx 프록시 헤더 설정 확인

## 모니터링

### 로그 확인
```bash
# nginx 에러 로그
sudo tail -f /var/log/nginx/error.log

# nginx 접속 로그
sudo tail -f /var/log/nginx/access.log

# 백엔드 로그
sudo journalctl -u campuson-backend -f
```

## 롤백 절차

문제 발생 시 이전 버전으로 롤백:
```bash
# 백업된 이전 버전으로 복원
sudo rm -rf /var/www/campuson-frontend/*
sudo cp -r /var/www/campuson-frontend-backup-[날짜]/* /var/www/campuson-frontend/
sudo systemctl reload nginx
``` 