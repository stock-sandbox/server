import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { VolumeRankService } from './volume-rank.service';
import { VolumeRankQueryDto } from './dto/volume-rank.dto';
import {
  VolumeRankOptions,
  VolumeRankApiResponse,
} from './interfaces/volume-rank.interface';

@ApiTags('kis-api')
@Controller('kis-api')
export class KisApiController {
  private readonly logger = new Logger(KisApiController.name);

  constructor(private readonly volumeRankService: VolumeRankService) {}

  /**
   * 거래량 순위를 조회합니다
   * @param query 조회 옵션 (시장, 조회 개수)
   * @returns 거래량 순위 데이터
   */
  @ApiOperation({
    summary: '거래량 순위 조회',
    description: `
      한국투자증권 API를 통해 실시간 거래량 순위를 조회합니다.
      
      - 코스피(KOSPI) 또는 코스닥(KOSDAQ) 시장별 조회 가능
      - 최대 100개 종목까지 조회 가능
      - 실시간 거래량, 현재가, 변동률 등의 정보 제공
    `,
  })
  @ApiResponse({
    status: 200,
    description: '거래량 순위 조회 성공',
    type: VolumeRankApiResponse,
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 파라미터 (예: count가 1~100 범위를 벗어남)',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류 또는 KIS API 호출 실패',
  })
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

      if (error instanceof Error) {
        // 일반 에러인 경우
        throw new HttpException(
          {
            success: false,
            message: '거래량 순위 조회 중 오류가 발생했습니다',
            error: error.message,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: '거래량 순위 조회 중 오류가 발생했습니다',
          error: '알 수 없는 오류',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 코스피 거래량 순위 (편의 메서드)
   */
  @ApiOperation({
    summary: '코스피 거래량 순위 조회',
    description:
      '코스피(KOSPI) 시장의 거래량 순위를 조회하는 편의 메서드입니다.',
  })
  @ApiQuery({
    name: 'count',
    required: false,
    description: '조회할 종목 수 (기본값: 20)',
    type: 'integer',
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '코스피 거래량 순위 조회 성공',
    type: VolumeRankApiResponse,
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 파라미터',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류 또는 KIS API 호출 실패',
  })
  @Get('volume-rank/kospi')
  async getKospiVolumeRank(
    @Query('count') count: number = 20,
  ): Promise<VolumeRankApiResponse> {
    return this.getVolumeRank({ market: 'KOSPI', count });
  }

  /**
   * 코스닥 거래량 순위 (편의 메서드)
   */
  @ApiOperation({
    summary: '코스닥 거래량 순위 조회',
    description:
      '코스닥(KOSDAQ) 시장의 거래량 순위를 조회하는 편의 메서드입니다.',
  })
  @ApiQuery({
    name: 'count',
    required: false,
    description: '조회할 종목 수 (기본값: 20)',
    type: 'integer',
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '코스닥 거래량 순위 조회 성공',
    type: VolumeRankApiResponse,
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 파라미터',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류 또는 KIS API 호출 실패',
  })
  @Get('volume-rank/kosdaq')
  async getKosdaqVolumeRank(
    @Query('count') count: number = 20,
  ): Promise<VolumeRankApiResponse> {
    return this.getVolumeRank({ market: 'KOSDAQ', count });
  }
}
