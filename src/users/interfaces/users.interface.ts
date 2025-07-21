import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
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
