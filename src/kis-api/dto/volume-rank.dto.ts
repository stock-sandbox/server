import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VolumeRankQueryDto {
  @ApiProperty({
    description: '조회할 시장 구분',
    enum: ['KOSPI', 'KOSDAQ'],
    default: 'KOSPI',
    example: 'KOSPI',
    required: false,
  })
  @IsOptional()
  @IsIn(['KOSPI', 'KOSDAQ'])
  market?: 'KOSPI' | 'KOSDAQ' = 'KOSPI';

  @ApiProperty({
    description: '조회할 종목 수 (최대 100개)',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
    type: 'integer',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams): number =>
    parseInt(String(value), 10),
  )
  @IsInt()
  @Min(1)
  @Max(100)
  count?: number = 20;
}
