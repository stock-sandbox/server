import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { TokenSchedulerService } from '../token-scheduler/token-scheduler.service';
import { firstValueFrom } from 'rxjs';
import { KisApiError } from './types/kis.types';

@Injectable()
export class KisApiService {
  private readonly logger = new Logger(KisApiService.name);
  private readonly baseUrl: string;
  private readonly appkey: string;
  private readonly appsecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly tokenSchedulerService: TokenSchedulerService,
  ) {
    const baseUrl = this.configService.get<string>('KIS_API_URL');
    const appkey = this.configService.get<string>('KIS_API_KEY');
    const appsecret = this.configService.get<string>('KIS_API_SECRET');

    if (!baseUrl || !appkey || !appsecret) {
      throw new Error(
        'KIS API 설정이 불완전합니다. 환경변수를 확인해주세요: KIS_API_URL, KIS_API_KEY, KIS_API_SECRET',
      );
    }

    this.baseUrl = baseUrl;
    this.appkey = appkey;
    this.appsecret = appsecret;
  }

  /**
   * 공통 헤더를 생성합니다
   * @param trId API별 고유 TR_ID
   * @returns KIS API 공통 헤더
   */
  async createHeaders(trId: string): Promise<Record<string, string>> {
    const accessToken = await this.tokenSchedulerService.ensureValidToken();

    if (!accessToken) {
      throw new HttpException(
        '유효한 액세스 토큰을 가져올 수 없습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      'content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${accessToken}`,
      appkey: this.appkey,
      appsecret: this.appsecret,
      custtype: 'P',
      tr_id: trId,
    };
  }

  /**
   * GET 요청을 수행합니다
   * @param path API 경로
   * @param trId TR_ID
   * @param params 쿼리 파라미터
   * @returns API 응답 데이터
   */
  async get<T>(
    path: string,
    trId: string,
    params?: Record<string, any>,
  ): Promise<T> {
    try {
      const headers = await this.createHeaders(trId);
      const url = `${this.baseUrl}${path}`;

      this.logger.debug(`KIS API GET 요청: ${url}`, { params, trId });

      const response = await firstValueFrom(
        this.httpService.get<T>(url, {
          headers,
          params,
        }),
      );

      this.logger.debug(`KIS API 응답 성공: ${url}`, response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`KIS API 요청 실패: ${path}`, error);
      this.handleApiError(error);
    }
  }

  /**
   * POST 요청을 수행합니다
   * @param path API 경로
   * @param trId TR_ID
   * @param data 요청 본문 데이터
   * @returns API 응답 데이터
   */
  async post<T>(
    path: string,
    trId: string,
    data?: Record<string, any>,
  ): Promise<T> {
    try {
      const headers = await this.createHeaders(trId);
      const url = `${this.baseUrl}${path}`;

      this.logger.debug(`KIS API POST 요청: ${url}`, { data, trId });

      const response = await firstValueFrom(
        this.httpService.post<T>(url, data, {
          headers,
        }),
      );

      this.logger.debug(`KIS API 응답 성공: ${url}`, response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`KIS API 요청 실패: ${path}`, error);
      this.handleApiError(error);
    }
  }

  /**
   * API 에러를 처리합니다
   * @param error axios 에러 객체
   */
  private handleApiError(error: any): never {
    if (error.response?.data) {
      const kisError = error.response.data as KisApiError;
      throw new HttpException(
        {
          message: 'KIS API 에러',
          errorCode: kisError.msg_cd,
          errorMessage: kisError.msg1,
          statusCode: error.response.status,
        },
        error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    throw new HttpException(
      '한국투자증권 API 호출 중 알 수 없는 오류가 발생했습니다',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
