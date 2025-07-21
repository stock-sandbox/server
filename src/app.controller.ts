import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'API 상태 확인',
    description:
      'API 서버의 상태를 확인합니다. 서버가 정상적으로 동작 중인지 테스트할 때 사용합니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'API 서버 정상 동작 중',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
