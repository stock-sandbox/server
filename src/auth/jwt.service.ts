import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  nickname: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  // JWT 토큰 생성
  generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '1h', // 1시간
    });

    const refreshToken = this.jwtService.sign(
      { sub: payload.sub },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d', // 7일
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  // Access Token 검증
  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  // Refresh Token 검증
  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  // 토큰에서 payload 추출 (검증 없이)
  decodeToken(token: string) {
    return this.jwtService.decode(token) as JwtPayload;
  }
}
