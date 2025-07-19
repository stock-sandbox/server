import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthService } from './jwt.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('인증 토큰이 필요합니다.');
    }

    try {
      // JWT 토큰 검증
      const payload = this.jwtAuthService.verifyAccessToken(token);

      // 데이터베이스에서 사용자 정보 조회
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      // 요청 객체에 사용자 정보 추가
      (request as any).user = user;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return true;
  }

  // Authorization 헤더 또는 쿠키에서 토큰 추출
  private extractToken(request: Request): string | undefined {
    // 1. Authorization 헤더에서 토큰 확인 (우선순위 높음)
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }

    // 2. 쿠키에서 토큰 확인
    const cookieToken = (request as any).cookies?.accessToken;
    if (cookieToken) {
      return cookieToken;
    }

    return undefined;
  }
}
