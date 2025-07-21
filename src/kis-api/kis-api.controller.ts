import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  VolumeRankService,
  VolumeRankDto,
  VolumeRankOptions,
} from './volume-rank.service';
import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

// 거래량 순위 조회 Query DTO
export class VolumeRankQueryDto {
  @IsOptional()
  @IsIn(['KOSPI', 'KOSDAQ'])
  market?: 'KOSPI' | 'KOSDAQ' = 'KOSPI';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  count?: number = 20;
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

@Controller('kis-api')
export class KisApiController {
  private readonly logger = new Logger(KisApiController.name);

  constructor(private readonly volumeRankService: VolumeRankService) {}

  /**
   * 거래량 순위를 조회합니다
   * @param query 조회 옵션 (시장, 조회 개수)
   * @returns 거래량 순위 데이터
   */
  @Get('volume-rank')
  async getVolumeRank(
    @Query() query: VolumeRankQueryDto,
  ): Promise<VolumeRankApiResponse> {
    try {
      const { market = 'KOSPI', count = 20 } = query;

      this.logger.log(
        `거래량 순위 조회 요청 - 시장: ${market}, 개수: ${count}`,
      );

      const options: VolumeRankOptions = {
        market,
        count,
      };

      const volumeRankList =
        await this.volumeRankService.getVolumeRank(options);

      const response: VolumeRankApiResponse = {
        success: true,
        message: '거래량 순위 조회 성공',
        data: volumeRankList,
        timestamp: new Date().toISOString(),
        market,
        count: volumeRankList.length,
      };

      this.logger.log(
        `거래량 순위 조회 성공 - ${volumeRankList.length}개 종목 조회됨`,
      );

      return response;
    } catch (error) {
      this.logger.error('거래량 순위 조회 실패:', error);

      // KIS API 에러인 경우
      if (error instanceof HttpException) {
        throw error;
      }

      // 일반 에러인 경우
      throw new HttpException(
        {
          success: false,
          message: '거래량 순위 조회 중 오류가 발생했습니다',
          error: error.message || '알 수 없는 오류',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 코스피 거래량 순위 (편의 메서드)
   */
  @Get('volume-rank/kospi')
  async getKospiVolumeRank(
    @Query('count') count: number = 20,
  ): Promise<VolumeRankApiResponse> {
    return this.getVolumeRank({ market: 'KOSPI', count });
  }

  /**
   * 코스닥 거래량 순위 (편의 메서드)
   */
  @Get('volume-rank/kosdaq')
  async getKosdaqVolumeRank(
    @Query('count') count: number = 20,
  ): Promise<VolumeRankApiResponse> {
    return this.getVolumeRank({ market: 'KOSDAQ', count });
  }
}
