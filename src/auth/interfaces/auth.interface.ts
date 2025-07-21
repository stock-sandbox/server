import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: '사용자 고유 ID', example: 'cuid123456789' })
  id: string;

  @ApiProperty({ description: '사용자 이메일', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: '사용자 닉네임', example: '투자왕김대리' })
  nickname: string;

  @ApiProperty({ description: '보유 현금', example: 100000000 })
  cash: number;

  @ApiProperty({
    description: '계정 생성일',
    example: '2024-01-15T09:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '계정 수정일',
    example: '2024-01-15T09:30:00.000Z',
  })
  updatedAt: string;
}

export class KakaoLoginUrlResponse {
  @ApiProperty({
    description: '카카오 OAuth 로그인 URL',
    example:
      'https://kauth.kakao.com/oauth/authorize?client_id=...&redirect_uri=...&response_type=code',
  })
  url: string;
}

export class AuthMeResponse {
  @ApiProperty({ description: '응답 메시지', example: '사용자 정보 조회 성공' })
  message: string;

  @ApiProperty({ description: '사용자 정보', type: UserDto })
  user: UserDto;
}

export class AuthRefreshResponse {
  @ApiProperty({ description: '응답 메시지', example: '토큰 갱신 성공' })
  message: string;

  @ApiProperty({
    description: '새로운 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '새로운 리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
