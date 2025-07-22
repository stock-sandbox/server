import { ApiProperty } from '@nestjs/swagger';

// 거래량 순위 조회 옵션
export interface VolumeRankOptions {
  count?: number; // 조회할 종목 수 (기본 20)
}

// 거래량 순위 DTO (응답용 데이터)
export class VolumeRankDto {
  @ApiProperty({ description: '순위', example: 1 })
  rank: number;

  @ApiProperty({ description: '종목코드', example: '005930' })
  stockCode: string;

  @ApiProperty({ description: '종목명', example: '삼성전자' })
  stockName: string;

  @ApiProperty({ description: '현재가', example: 75000 })
  currentPrice: number;

  @ApiProperty({ description: '전일 대비 변동', example: 1000 })
  priceChange: number;

  @ApiProperty({ description: '전일 대비 변동률(%)', example: 1.35 })
  priceChangePercent: number;

  @ApiProperty({ description: '누적 거래량', example: 15234567 })
  volume: number;

  @ApiProperty({ description: '전일 거래량', example: 12345678 })
  previousVolume: number;

  @ApiProperty({ description: '거래량 증가율(%)', example: 23.4 })
  volumeChangeRate: number;

  @ApiProperty({ description: '거래대금', example: 1143225025000 })
  tradingValue: number;
}

// API 응답 형태
export class VolumeRankApiResponse {
  @ApiProperty({ description: '성공 여부', example: true })
  success: boolean;

  @ApiProperty({ description: '응답 메시지', example: '거래량 순위 조회 성공' })
  message: string;

  @ApiProperty({
    description: '거래량 순위 데이터 배열',
    type: [VolumeRankDto],
  })
  data: VolumeRankDto[];

  @ApiProperty({
    description: '조회 시점 타임스탬프',
    example: '2024-01-15T09:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({ description: '실제 조회된 종목 수', example: 20 })
  count: number;
}
