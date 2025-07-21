import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SupabaseModule } from './supabase/supabase.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TokenSchedulerModule } from './token-scheduler/token-scheduler.module';
import { KisApiModule } from './kis-api/kis-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    SupabaseModule,
    PrismaModule,
    TokenSchedulerModule,
    KisApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
