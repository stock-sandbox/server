import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import {
  KisAccessTokenRequest,
  KisAccessTokenResponse,
  KisTokenData,
  KIS_API_CONFIG,
} from './types/token.types';

@Injectable()
export class TokenSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(TokenSchedulerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    // 서비스 시작시 토큰이 없거나 만료된 경우 새로운 토큰 발급
    await this.ensureValidToken();
  }

  /**
   * 24시간마다 토큰 갱신 (매일 오전 9시에 실행)
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async refreshTokenSchedule() {
    this.logger.log('정기 토큰 갱신 작업 시작');
    await this.refreshAccessToken();
  }

  /**
   * 현재 유효한 토큰을 가져오기
   */
  async getCurrentToken(): Promise<string | null> {
    try {
      const token = await this.prismaService.kisAccessToken.findFirst({
        where: {
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return token?.accessToken || null;
    } catch (error) {
      this.logger.error('토큰 조회 중 오류:', error);
      return null;
    }
  }

  /**
   * 유효한 토큰이 있는지 확인하고, 없으면 새로 발급
   */
  async ensureValidToken(): Promise<string> {
    const existingToken = await this.getCurrentToken();

    if (existingToken) {
      this.logger.log('유효한 토큰이 존재합니다');
      return existingToken;
    }

    this.logger.log('유효한 토큰이 없어 새로 발급합니다');
    return await this.refreshAccessToken();
  }

  /**
   * 액세스 토큰 갱신
   */
  async refreshAccessToken(): Promise<string> {
    try {
      // 기존 토큰들을 비활성화
      await this.prismaService.kisAccessToken.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // 새로운 토큰 발급
      const tokenData = await this.issueAccessToken();

      // 데이터베이스에 저장
      const savedToken = await this.prismaService.kisAccessToken.create({
        data: {
          accessToken: tokenData.accessToken,
          expiresAt: tokenData.expiresAt,
          isActive: true,
        },
      });

      this.logger.log(
        `새로운 액세스 토큰이 발급되어 저장되었습니다. 만료시간: ${tokenData.expiresAt.toISOString()}`,
      );
      return savedToken.accessToken;
    } catch (error) {
      this.logger.error('토큰 갱신 중 오류 발생:', error);
      throw new Error('토큰 갱신 실패');
    }
  }

  /**
   * 한국투자증권 API에서 액세스 토큰 발급
   */
  private async issueAccessToken(): Promise<KisTokenData> {
    const appkey = this.configService.get<string>('KIS_API_KEY');
    const appsecret = this.configService.get<string>('KIS_API_SECRET');
    const apiUrl = this.configService.get<string>('KIS_API_URL');

    if (!appkey || !appsecret) {
      throw new Error(
        'KIS_API_KEY 또는 KIS_API_SECRET 환경변수가 설정되지 않았습니다',
      );
    }

    if (!apiUrl) {
      throw new Error('KIS_API_URL 환경변수가 설정되지 않았습니다');
    }

    const requestData: KisAccessTokenRequest = {
      grant_type: 'client_credentials',
      appkey,
      appsecret,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<KisAccessTokenResponse>(
          `${apiUrl}${KIS_API_CONFIG.TOKEN_PATH}`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const { access_token, expires_in } = response.data;

      // 만료 시간 계산 (현재 시간 + expires_in 초)
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      return {
        accessToken: access_token,
        expiresAt,
      };
    } catch (error) {
      this.logger.error('한국투자증권 API 토큰 발급 실패:', error);
      throw new Error(`토큰 발급 실패: ${error}`);
    }
  }

  /**
   * 만료된 토큰들을 정리하는 메서드
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens() {
    try {
      const result = await this.prismaService.kisAccessToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`만료된 토큰 ${result.count}개를 정리했습니다`);
      }
    } catch (error) {
      this.logger.error('만료된 토큰 정리 중 오류:', error);
    }
  }
}
