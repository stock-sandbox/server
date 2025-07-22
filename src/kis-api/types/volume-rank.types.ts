// 거래량 순위 조회 관련 타입 정의

// 거래량 순위 조회 요청 파라미터
export interface VolumeRankRequest {
  FID_COND_MRKT_DIV_CODE?: string; // 조건 시장 분류 코드 (J: 코스피, Q: 코스닥)
  FID_COND_SCR_DIV_CODE?: string; // 조건 화면 분류 코드 (20170: 거래량상위)
  FID_INPUT_ISCD?: string; // 입력 종목코드
  FID_DIV_CLS_CODE?: string; // 분류구분코드 (0: 전체)
  FID_BLNG_CLS_CODE?: string; // 소속구분코드 (0: 전체)
  FID_TRGT_CLS_CODE?: string; // 대상구분코드 (111111111)
  FID_TRGT_EXLS_CLS_CODE?: string; // 대상제외구분코드 (000000000)
  FID_INPUT_PRICE_1?: string; // 입력가격1
  FID_INPUT_PRICE_2?: string; // 입력가격2
  FID_VOL_CNT?: string; // 거래량 수 (기본값: 0)
  FID_INPUT_DATE_1?: string; // 입력날짜1
}

// 거래량 순위 조회 응답 - 개별 종목 정보
export interface VolumeRankItem {
  mksc_shrn_iscd: string; // 유가증권 단축 종목코드
  data_rank: string; // 데이터 순위
  hts_kor_isnm: string; // HTS 한글 종목명
  stck_prpr: string; // 주식 현재가
  prdy_vrss_sign: string; // 전일 대비 부호
  prdy_vrss: string; // 전일 대비
  prdy_ctrt: string; // 전일 대비율
  acml_vol: string; // 누적 거래량
  prdy_vol: string; // 전일 거래량
  lstn_stcn: string; // 상장 주수
  avrg_vol: string; // 평균 거래량
  n_befr_clpr: string; // N일전 종가
  vol_inrt: string; // 거래량 증가율
  vol_tnrt: string; // 거래량 회전율
  nday_vol_tnrt: string; // N일 거래량 회전율
  avrg_tr_pbmn: string; // 평균 거래 대금
  tr_pbmn_tnrt: string; // 거래 대금 회전율
  nday_tr_pbmn_tnrt: string; // N일 거래 대금 회전율
  acml_tr_pbmn: string; // 누적 거래 대금
}

// 거래량 순위 조회 API 응답
export interface VolumeRankResponse {
  rt_cd: string; // 성공실패 여부 (0: 성공)
  msg_cd: string; // 응답코드
  msg1: string; // 응답메세지
  output: VolumeRankItem[];
}
