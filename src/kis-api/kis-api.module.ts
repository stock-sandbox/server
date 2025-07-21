import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KisApiService } from './kis-api.service';
import { VolumeRankService } from './volume-rank.service';
import { KisApiController } from './kis-api.controller';
import { TokenSchedulerModule } from '../token-scheduler/token-scheduler.module';

@Module({
  imports: [
    HttpModule, // HTTP 요청을 위한 모듈
    TokenSchedulerModule, // 토큰 관리를 위한 모듈
  ],
  controllers: [KisApiController],
  providers: [KisApiService, VolumeRankService],
  exports: [KisApiService, VolumeRankService], // 다른 모듈에서 사용할 수 있도록 export
})
export class KisApiModule {}
