#!/bin/bash

# 프로덕션 배포 스크립트
echo "🚀 CampusON 프론트엔드 배포 시작..."

# 환경변수 설정
export NODE_ENV=production

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 2. 빌드
echo "🏗️ 프로덕션 빌드 중..."
NODE_ENV=production npm run build

# 3. 기존 파일 백업
echo "💾 기존 파일 백업 중..."
sudo cp -r /var/www/campuson-frontend /var/www/campuson-frontend-backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# 4. 새 파일 배포
echo "📁 새 파일 배포 중..."
sudo mkdir -p /var/www/campuson-frontend
sudo rm -rf /var/www/campuson-frontend/*
sudo cp -r dist/* /var/www/campuson-frontend/

# 5. 권한 설정
echo "🔐 권한 설정 중..."
sudo chown -R www-data:www-data /var/www/campuson-frontend
sudo chmod -R 755 /var/www/campuson-frontend

# 6. Nginx 설정 업데이트
echo "⚙️ Nginx 설정 업데이트 중..."
sudo cp nginx.conf /etc/nginx/sites-available/campuson-frontend

# 처음 설치시에만 심볼릭 링크 생성
if [ ! -L /etc/nginx/sites-enabled/campuson-frontend ]; then
    sudo ln -s /etc/nginx/sites-available/campuson-frontend /etc/nginx/sites-enabled/
fi

# 7. Nginx 설정 테스트 및 재시작
echo "🔄 Nginx 재시작 중..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ 배포 완료!"
echo "🌐 https://kbu-ai-tutor.kr 에서 확인하세요." 