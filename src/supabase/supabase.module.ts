import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  imports: [ConfigModule], // ConfigModule을 import 합니다.
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return createClient(
          configService.get<string>('SUPABASE_URL')!,
          configService.get<string>('SUPABASE_ANON_KEY')!,
        );
      },
    },
    SupabaseService,
  ],
  exports: [SupabaseService], // 다른 모듈에서 사용할 수 있도록 export 합니다.
})
export class SupabaseModule {}
