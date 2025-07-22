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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiHeader,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/auth.dto';
import {
  KakaoLoginUrlResponse,
  AuthMeResponse,
  AuthRefreshResponse,
} from './interfaces/auth.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 카카오 로그인 URL 반환
  @ApiOperation({
    summary: '카카오 로그인 URL 조회',
    description: '카카오 OAuth 인증을 위한 로그인 URL을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '카카오 로그인 URL 조회 성공',
    type: KakaoLoginUrlResponse,
  })
  @Get('kakao')
  getKakaoLoginUrl(): KakaoLoginUrlResponse {
    return this.authService.getKakaoLoginUrl();
  }

  // 카카오 OAuth 콜백 처리
  @ApiOperation({
    summary: '카카오 OAuth 콜백 처리',
    description: `
      카카오 OAuth 인증 후 리다이렉트되는 콜백을 처리합니다.
      성공 시 JWT 토큰을 HttpOnly 쿠키에 저장하고 프론트엔드로 리다이렉트합니다.
    `,
  })
  @ApiQuery({
    name: 'code',
    description: '카카오에서 받은 인증 코드',
    required: true,
  })
  @ApiResponse({
    status: 302,
    description: '인증 성공 후 프론트엔드로 리다이렉트',
  })
  @ApiBadRequestResponse({
    description: '인증 코드가 없거나 잘못된 경우',
  })
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
      if (error instanceof Error) {
        const errorMessage = encodeURIComponent(error.message || '로그인_실패');
        return res.redirect(
          `${frontendUrl}/auth/error?message=${errorMessage}`,
        );
      }
      const errorMessage = encodeURIComponent('로그인_실패');
      return res.redirect(`${frontendUrl}/auth/error?message=${errorMessage}`);
    }
  }

  // 현재 사용자 정보 조회
  @ApiOperation({
    summary: '현재 사용자 정보 조회',
    description: 'JWT 토큰을 통해 현재 로그인한 사용자의 정보를 조회합니다.',
  })
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer JWT 토큰',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    type: AuthMeResponse,
  })
  @ApiUnauthorizedResponse({
    description: '토큰이 없거나 유효하지 않음',
  })
  @Get('me')
  async getMe(@Headers('authorization') authorization?: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer 토큰이 필요합니다.');
    }

    const token = authorization.slice(7); // 'Bearer ' 제거
    const user = await this.authService.getUserFromToken(token);

    return {
      message: '사용자 정보 조회 성공',
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        cash: Number(user.cash),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  // 토큰 갱신
  @ApiOperation({
    summary: '토큰 갱신',
    description:
      'Refresh Token을 사용하여 새로운 Access Token과 Refresh Token을 발급받습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
    type: AuthRefreshResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh Token이 없거나 유효하지 않음',
  })
  @Post('refresh')
  async refreshToken(
    @Body() body: RefreshTokenDto,
  ): Promise<AuthRefreshResponse> {
    const { refreshToken } = body;
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
