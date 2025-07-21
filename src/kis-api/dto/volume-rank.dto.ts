import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class VolumeRankQueryDto {
  @IsOptional()
  @IsIn(['KOSPI', 'KOSDAQ'])
  market?: 'KOSPI' | 'KOSDAQ' = 'KOSPI';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  count?: number = 20;
}
