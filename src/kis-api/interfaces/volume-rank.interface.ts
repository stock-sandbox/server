// 거래량 순위 조회 옵션
export interface VolumeRankOptions {
  market?: 'KOSPI' | 'KOSDAQ'; // 시장 구분
  count?: number; // 조회할 종목 수 (기본 20)
}

// 거래량 순위 DTO (응답용 데이터)
export interface VolumeRankDto {
  rank: number; // 순위
  stockCode: string; // 종목코드
  stockName: string; // 종목명
  currentPrice: number; // 현재가
  priceChange: number; // 전일 대비 변동
  priceChangePercent: number; // 전일 대비 변동률(%)
  volume: number; // 거래량
  previousVolume: number; // 전일 거래량
  volumeChangeRate: number; // 거래량 증가율(%)
  tradingValue: number; // 거래대금
}

// API 응답 형태
export interface VolumeRankApiResponse {
  success: boolean;
  message: string;
  data: VolumeRankDto[];
  timestamp: string;
  market: string;
  count: number;
}
