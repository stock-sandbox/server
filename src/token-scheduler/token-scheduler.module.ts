import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenSchedulerService } from './token-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot(), PrismaModule],
  providers: [TokenSchedulerService],
  exports: [TokenSchedulerService],
})
export class TokenSchedulerModule {}
