import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthService, JwtPayload } from './jwt.service';
import { User } from 'generated/prisma';
import { KakaoTokenResponse, KakaoUserInfo } from './types/kakao.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtAuthService: JwtAuthService,
    private readonly configService: ConfigService,
  ) {}

  // 카카오 로그인 URL 생성
  getKakaoLoginUrl(): { url: string } {
    const clientId = this.configService.get<string>('KAKAO_CLIENT_ID');
    const redirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      throw new BadRequestException('카카오 OAuth 설정이 필요합니다.');
    }

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

    return { url: kakaoAuthUrl };
  }

  // 카카오 OAuth 콜백 처리
  async handleKakaoCallback(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // 1. 카카오 access token 획득
    const kakaoTokens = await this.getKakaoTokens(code);

    // 2. 카카오 사용자 정보 조회
    const kakaoUserInfo = await this.getKakaoUserInfo(kakaoTokens.access_token);

    // 3. 사용자 DB 확인 및 생성
    const user = await this.findOrCreateUser(kakaoUserInfo);

    // 4. JWT 토큰 생성
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    };

    const tokens = this.jwtAuthService.generateTokens(payload);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // JWT 토큰으로 사용자 정보 조회
  async getUserFromToken(accessToken: string): Promise<User> {
    try {
      const payload = this.jwtAuthService.verifyAccessToken(accessToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      return user;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  // Refresh Token으로 새로운 Access Token 생성
  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = this.jwtAuthService.verifyRefreshToken(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        nickname: user.nickname,
      };

      return this.jwtAuthService.generateTokens(newPayload);
    } catch {
      throw new UnauthorizedException('유효하지 않은 refresh token입니다.');
    }
  }

  // 카카오에서 access token 획득
  private async getKakaoTokens(code: string): Promise<KakaoTokenResponse> {
    const clientId = this.configService.get<string>('KAKAO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('KAKAO_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI');

    const tokenUrl = 'https://kauth.kakao.com/oauth/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri!,
      code,
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`카카오 토큰 요청 실패: ${response.status}`);
      }

      return (await response.json()) as KakaoTokenResponse;
    } catch {
      throw new UnauthorizedException('카카오 토큰 획득에 실패했습니다.');
    }
  }

  // 카카오 사용자 정보 조회
  private async getKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo> {
    const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';

    try {
      const response = await fetch(userInfoUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      if (!response.ok) {
        throw new Error(`카카오 사용자 정보 요청 실패: ${response.status}`);
      }

      return (await response.json()) as KakaoUserInfo;
    } catch {
      throw new UnauthorizedException(
        '카카오 사용자 정보 조회에 실패했습니다.',
      );
    }
  }

  // 사용자 찾기 또는 생성
  private async findOrCreateUser(kakaoUserInfo: KakaoUserInfo): Promise<User> {
    const kakaoId = kakaoUserInfo.id.toString();
    const email = kakaoUserInfo.kakao_account.email;
    const nickname = kakaoUserInfo.kakao_account.profile.nickname;

    // 기존 사용자 확인 (카카오 ID 기반)
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { id: { contains: kakaoId } }, // 카카오 ID가 포함된 경우
        ],
      },
    });

    if (user) {
      return user;
    }

    // 닉네임 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { nickname },
    });

    if (existingUser) {
      throw new ConflictException(
        '이미 사용중인 닉네임입니다. 다른 닉네임을 선택해주세요.',
      );
    }

    // 새 사용자 생성 (카카오 ID를 포함한 고유 ID 생성)
    const userId = `kakao_${kakaoId}_${Date.now()}`;

    user = await this.prisma.user.create({
      data: {
        id: userId,
        email,
        nickname,
      },
    });

    return user;
  }
}
