// 한국투자증권 API 관련 공통 타입 정의

// 공통 API 헤더
export interface KisApiHeaders {
  'content-type': 'application/json; charset=utf-8';
  authorization: string;
  appkey: string;
  appsecret: string;
  custtype: 'Y';
  tr_id?: string; // API별로 다른 tr_id
}

// API 에러 응답
export interface KisApiError {
  rt_cd: string;
  msg_cd: string;
  msg1: string;
}
