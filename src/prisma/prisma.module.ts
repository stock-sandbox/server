import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 이 데코레이터를 추가합니다.
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // exports는 그대로 유지합니다.
})
export class PrismaModule {}
