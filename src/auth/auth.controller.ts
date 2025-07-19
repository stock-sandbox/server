import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 카카오 로그인 URL 반환
  @Get('kakao')
  async getKakaoLoginUrl() {
    return this.authService.getKakaoLoginUrl();
  }

  // 카카오 OAuth 콜백 처리
  @Get('callback')
  async handleCallback(@Query('code') code: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!code) {
      return res.redirect(
        `${frontendUrl}/auth/error?message=인증코드가_없습니다`,
      );
    }

    try {
      const result = await this.authService.handleKakaoCallback(code);

      // HttpOnly 쿠키로 토큰 설정 (더 안전)
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS에서만
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000, // 1시간
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      });

      return res.redirect(`${frontendUrl}/bff-api/auth/callback`);
    } catch (error) {
      const errorMessage = encodeURIComponent(error.message || '로그인_실패');
      return res.redirect(`${frontendUrl}/auth/error?message=${errorMessage}`);
    }
  }

  // 현재 사용자 정보 조회
  @Get('me')
  async getMe(@Headers('authorization') authorization?: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer 토큰이 필요합니다.');
    }

    const token = authorization.slice(7); // 'Bearer ' 제거
    const user = await this.authService.getUserFromToken(token);

    return {
      message: '사용자 정보 조회 성공',
      user,
    };
  }

  // 토큰 갱신
  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token이 필요합니다.');
    }

    const result = await this.authService.refreshTokens(refreshToken);

    return {
      message: '토큰 갱신 성공',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }
}
