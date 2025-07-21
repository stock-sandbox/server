// 한국투자증권 API 토큰 관련 타입 정의

export interface KisAccessTokenRequest {
  grant_type: 'client_credentials';
  appkey: string;
  appsecret: string;
}

export interface KisAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // 초 단위 (86400 = 24시간)
}

export interface KisApiError {
  error_code: string;
  error_description: string;
}

export interface KisTokenData {
  accessToken: string;
  expiresAt: Date;
}

export const KIS_API_CONFIG = {
  TOKEN_PATH: '/oauth2/tokenP',
  TOKEN_EXPIRY_HOURS: 24,
} as const;
