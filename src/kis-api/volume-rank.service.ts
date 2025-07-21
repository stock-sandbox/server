import { Injectable, Logger } from '@nestjs/common';
import { KisApiService } from './kis-api.service';
import {
  VolumeRankRequest,
  VolumeRankResponse,
  VolumeRankItem,
  VOLUME_RANK_CONFIG,
  MARKET_CODES,
} from './types/kis.types';
import {
  VolumeRankOptions,
  VolumeRankDto,
} from './interfaces/volume-rank.interface';

@Injectable()
export class VolumeRankService {
  private readonly logger = new Logger(VolumeRankService.name);

  constructor(private readonly kisApiService: KisApiService) {}

  /**
   * 거래량 순위를 조회합니다
   * @param options 조회 옵션
   * @returns 거래량 순위 리스트
   */
  async getVolumeRank(
    options: VolumeRankOptions = {},
  ): Promise<VolumeRankDto[]> {
    const { market = 'KOSPI', count = 20 } = options;

    // 요청 파라미터 구성
    const params: VolumeRankRequest = {
      FID_COND_MRKT_DIV_CODE: MARKET_CODES[market], // 시장 구분
      FID_COND_SCR_DIV_CODE: '20170', // 거래량상위 화면 코드
      FID_INPUT_ISCD: '0000', // 입력 종목코드 (전체)
      FID_DIV_CLS_CODE: '0', // 분류구분코드 (전체)
      FID_BLNG_CLS_CODE: '0', // 소속구분코드 (전체)
      FID_TRGT_CLS_CODE: '111111111', // 대상구분코드
      FID_TRGT_EXLS_CLS_CODE: '000000000', // 대상제외구분코드
      FID_INPUT_PRICE_1: '', // 입력가격1
      FID_INPUT_PRICE_2: '', // 입력가격2
      FID_VOL_CNT: '0', // 거래량 수
      FID_INPUT_DATE_1: '', // 입력날짜1
    };

    try {
      this.logger.log(
        `거래량 순위 조회 시작 - 시장: ${market}, 개수: ${count}`,
      );

      const response = await this.kisApiService.get<VolumeRankResponse>(
        VOLUME_RANK_CONFIG.PATH,
        VOLUME_RANK_CONFIG.TR_ID,
        params,
      );

      // 응답 검증
      if (response.rt_cd !== '0') {
        throw new Error(
          `API 호출 실패: ${response.msg1} (코드: ${response.msg_cd})`,
        );
      }

      if (!response.output || !Array.isArray(response.output)) {
        this.logger.warn('거래량 순위 데이터가 없습니다');
        return [];
      }

      // 데이터 변환 및 정렬
      const volumeRankList = response.output
        .slice(0, count) // 요청한 개수만큼 제한
        .map((item: VolumeRankItem) => this.transformVolumeRankItem(item))
        .filter((item) => item !== null) // 유효하지 않은 데이터 제거
        .sort((a, b) => a.rank - b.rank); // 순위순으로 정렬

      this.logger.log(
        `거래량 순위 조회 완료 - ${volumeRankList.length}개 종목`,
      );
      return volumeRankList;
    } catch (error) {
      this.logger.error('거래량 순위 조회 실패:', error);
      throw error;
    }
  }

  /**
   * KIS API 응답 데이터를 DTO로 변환합니다
   * @param item KIS API 거래량 순위 데이터
   * @returns 변환된 DTO 또는 null (유효하지 않은 데이터인 경우)
   */
  private transformVolumeRankItem(item: VolumeRankItem): VolumeRankDto | null {
    try {
      // 필수 데이터 검증
      if (!item.mksc_shrn_iscd || !item.hts_kor_isnm || !item.data_rank) {
        this.logger.warn('필수 데이터가 누락된 종목 스킵:', item);
        return null;
      }

      // 숫자 변환 및 검증
      const rank = parseInt(item.data_rank, 10);
      const currentPrice = parseFloat(item.stck_prpr) || 0;
      const priceChange = parseFloat(item.prdy_vrss) || 0;
      const priceChangePercent = parseFloat(item.prdy_ctrt) || 0;
      const volume = parseInt(item.acml_vol, 10) || 0;
      const previousVolume = parseInt(item.prdy_vol, 10) || 0;
      const volumeChangeRate = parseFloat(item.vol_inrt) || 0;
      const tradingValue = parseInt(item.acml_tr_pbmn, 10) || 0;

      if (rank <= 0 || currentPrice <= 0) {
        this.logger.warn('유효하지 않은 순위 또는 가격 데이터:', item);
        return null;
      }

      return {
        rank,
        stockCode: item.mksc_shrn_iscd,
        stockName: item.hts_kor_isnm,
        currentPrice,
        priceChange,
        priceChangePercent,
        volume,
        previousVolume,
        volumeChangeRate,
        tradingValue,
      };
    } catch (error) {
      this.logger.error('데이터 변환 중 오류:', error, item);
      return null;
    }
  }
}
