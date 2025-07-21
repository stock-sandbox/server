import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 파이프 설정 (DTO 검증을 위해)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // 정의되지 않은 속성 있으면 에러
      transform: true, // 타입 자동 변환
    }),
  );

  // 쿠키 파서 미들웨어 추가
  app.use(cookieParser());

  // CORS 설정 (프론트엔드와 쿠키 공유를 위해)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // 쿠키 전송 허용
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Paper Trade API')
    .setDescription(
      `
      모의 주식 거래 플랫폼 API 문서입니다.
      
      ## 주요 기능
      - 사용자 인증 (카카오 로그인)
      - 가상 포트폴리오 관리
      - 한국투자증권 API 연동 (거래량 순위 등)
      - 실시간 주식 데이터 조회
      
      ## 사용법
      1. 카카오 로그인을 통해 인증 토큰 발급
      2. Authorization 헤더에 Bearer 토큰 설정
      3. 각 API 엔드포인트 호출
    `,
    )
    .setVersion('1.0')
    .addTag('auth', '사용자 인증 관련 API')
    .addTag('users', '사용자 관리 API')
    .addTag('kis-api', '한국투자증권 API (주식 데이터)')
    .addTag('app', '기본 애플리케이션 정보')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '카카오 로그인을 통해 발급받은 JWT 토큰을 입력하세요',
        in: 'header',
      },
      'access-token',
    )
    .addServer('http://localhost:8000', '개발 서버')
    .addServer('https://api.papertrade.com', '프로덕션 서버 (예시)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침해도 토큰 유지
      tagsSorter: 'alpha', // 태그 알파벳 순 정렬
      operationsSorter: 'alpha', // 오퍼레이션 알파벳 순 정렬
    },
    customSiteTitle: 'Paper Trade API Docs',
  });

  await app.listen(process.env.PORT ?? 8000);

  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 8000}`,
  );
  console.log(
    `📚 API Documentation: http://localhost:${process.env.PORT ?? 8000}/api`,
  );
}
bootstrap();
