# Paper Trade Server

가상 투자 시뮬레이션 백엔드 서버입니다.

## 주요 기능

- 사용자 인증 (Kakao OAuth)
- 가상 주식 거래 시뮬레이션
- 포트폴리오 관리
- 랭킹 시스템
- **한국투자증권 API 연동** ✨

## 한국투자증권 API 기능

### 자동 토큰 관리

- 서버 시작시 자동 토큰 발급
- 매일 오전 9시 자동 토큰 갱신
- 만료된 토큰 자동 정리

### 백엔드 토큰 관리

- 완전 자동화된 토큰 생명주기 관리
- 다른 서비스에서 `TokenSchedulerService` 주입하여 사용
- 서버 로그를 통한 토큰 상태 모니터링

자세한 설정 방법은 [KIS-API-SETUP.md](/docs/KIS-API-SETUP.md)를 참조하세요.

## 환경 설정

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 필요한 값들을 입력하세요

# 데이터베이스 마이그레이션
pnpm dlx prisma migrate dev

# 개발 서버 시작
pnpm run start:dev
```

## 필수 환경변수

```env
# 데이터베이스
DATABASE_URL="your-database-url"
DIRECT_URL="your-direct-url"

# Supabase
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-key"

# 한국투자증권 API
KIS_API_URL="https://openapi.koreainvestment.com:9443"
KIS_API_KEY="your-kis-api-key"
KIS_API_SECRET="your-kis-api-secret"

# JWT
JWT_SECRET="your-jwt-secret"

# 프론트엔드 URL
FRONTEND_URL="your-frontend-url"
```

## 기술 스택

- **Framework**: NestJS
- **Database**: Supabase + Prisma
- **Scheduler**: @nestjs/schedule
- **HTTP Client**: @nestjs/axios
- **External API**: 한국투자증권 Open API
