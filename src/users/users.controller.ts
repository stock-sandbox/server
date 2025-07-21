import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserResponseDto } from './interfaces/users.interface';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: '모든 사용자 조회',
    description: '시스템에 등록된 모든 사용자의 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 목록 조회 성공',
    type: [UserResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: '인증 토큰이 없거나 유효하지 않음',
  })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({
    summary: '특정 사용자 조회',
    description: '사용자 ID를 통해 특정 사용자의 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 사용자의 고유 ID',
    example: 'cuid123456789',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 조회 성공',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: '인증 토큰이 없거나 유효하지 않음',
  })
  @ApiNotFoundResponse({
    description: '해당 ID의 사용자를 찾을 수 없음',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
