# 한국투자증권 API 설정 가이드

## 1. 환경변수 설정

다음 환경변수들을 `.env` 파일에 추가해주세요:

```env
# 한국투자증권 API 설정
KIS_API_URL="https://openapi.koreainvestment.com:9443"
KIS_API_KEY="your-kis-api-key"
KIS_API_SECRET="your-kis-api-secret"
```

## 2. 한국투자증권 API Key 발급

1. [한국투자증권 Open API 포털](https://apiportal.koreainvestment.com/) 접속
2. 회원가입 및 로그인
3. 앱 등록하여 APP KEY, APP SECRET 발급
4. 위의 환경변수에 설정

## 3. API 기능

### 자동 토큰 관리

- **자동 토큰 발급**: 서버 시작시 유효한 토큰이 없으면 자동으로 발급
- **스케줄 갱신**: 매일 오전 9시에 자동으로 토큰 갱신
- **만료 토큰 정리**: 매일 자정에 만료된 토큰들 자동 삭제

### 백엔드 토큰 관리

모든 토큰 관리는 백엔드에서 자동으로 처리됩니다:

- 서버 로그에서 토큰 상태 확인 가능
- 데이터베이스에서 직접 토큰 정보 조회 가능
- 필요시 서버 재시작으로 강제 토큰 갱신 가능

## 4. 사용법

### 다른 서비스에서 토큰 사용

```typescript
import { TokenSchedulerService } from './token-scheduler/token-scheduler.service';

@Injectable()
export class YourService {
  constructor(private readonly tokenSchedulerService: TokenSchedulerService) {}

  async makeKisApiCall() {
    // 현재 유효한 토큰 가져오기 (자동으로 갱신됨)
    const token = await this.tokenSchedulerService.ensureValidToken();

    // API 호출 시 Authorization 헤더에 사용
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 한국투자증권 API 호출
    // ...
  }
}
```

### 모듈에서 토큰 서비스 사용

```typescript
import { TokenSchedulerModule } from './token-scheduler/token-scheduler.module';

@Module({
  imports: [TokenSchedulerModule],
  // ...
})
export class YourModule {}
```

## 5. 데이터베이스 테이블

`KisAccessToken` 모델이 생성되어 토큰들을 관리합니다:

```sql
CREATE TABLE "KisAccessToken" (
  "id" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY ("id")
);
```

## 6. 로깅

모든 토큰 관리 작업은 로그로 기록됩니다:

- 토큰 발급/갱신 성공/실패
- 정기 작업 실행
- 오류 발생시 상세 정보

## 7. 환경변수 상세 설명

### KIS_API_URL

- 한국투자증권 API의 베이스 URL
- 실전: `https://openapi.koreainvestment.com:9443`
- 모의: `https://openapivts.koreainvestment.com:29443`

### KIS_API_KEY, KIS_API_SECRET

- 한국투자증권에서 발급받은 API Key와 Secret
- 실전용과 모의용이 각각 다름
