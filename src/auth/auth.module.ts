import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthService } from './jwt.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      // 기본 설정 (실제 secret은 ConfigService에서 가져옴)
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, JwtAuthService],
  exports: [AuthService, AuthGuard, JwtAuthService],
})
export class AuthModule {}
